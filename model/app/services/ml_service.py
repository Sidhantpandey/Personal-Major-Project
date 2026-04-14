"""
ML inference service for plant disease prediction.

Loads the trained OmniCrops SwinV2-B+FPN model at startup and provides
synchronous prediction methods called by the API endpoints.

Usage:
    # During app lifespan startup:
    ml_service = MLService()

    # Per request:
    result = ml_service.predict(image_bytes)
    result = ml_service.predict_with_tta(image_bytes)
"""

import io
import json
import logging
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms

from app.services.ml_model import OmniCropsSwinFPN

logger = logging.getLogger(__name__)

# ─── ImageNet normalisation (same as training notebook) ───────────────────────
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

# ─── Transforms ──────────────────────────────────────────────────────────────
# Standard inference transform (matches notebook val_tf)
val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])

# TTA transforms (×5) — same as notebook
tta_transforms = [
    val_transform,
    transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=1.0),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ]),
    transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ]),
    transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomRotation((90, 90)),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ]),
    transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomRotation((-90, -90)),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ]),
]


class MLService:
    """
    Singleton-style ML inference service.

    Loads the model and class metadata once, then provides fast
    prediction methods for the API layer.
    """

    def __init__(self, weights_dir: str):
        """
        Args:
            weights_dir: Path to the directory containing
                         best_omnicrops_swinv2.pth and metadata.json
        """
        weights_path = Path(weights_dir)
        model_file = weights_path / "best_omnicrops_swinv2.pth"
        metadata_file = weights_path / "metadata.json"

        if not model_file.exists():
            raise FileNotFoundError(f"Model weights not found: {model_file}")
        if not metadata_file.exists():
            raise FileNotFoundError(f"Metadata not found: {metadata_file}")

        # ── Load metadata ────────────────────────────────────────────────────
        with open(metadata_file, "r") as f:
            self.metadata = json.load(f)

        self.class_list: list[str] = self.metadata["classes"]
        self.num_classes: int = self.metadata["num_classes"]

        logger.info(
            "ML metadata loaded — %d classes, image_size=%d",
            self.num_classes,
            self.metadata.get("image_size", 224),
        )

        # ── Device selection ─────────────────────────────────────────────────
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info("ML device: %s", self.device)

        # ── Build model and load weights ─────────────────────────────────────
        self.model = OmniCropsSwinFPN(
            num_classes=self.num_classes,
            dropout=0.3,
        )

        # Load checkpoint
        try:
            state_dict = torch.load(
                model_file,
                map_location=self.device,
                weights_only=True,
            )
        except TypeError:
            # Older PyTorch versions don't support weights_only
            state_dict = torch.load(model_file, map_location=self.device)

        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()

        param_count = sum(p.numel() for p in self.model.parameters())
        logger.info(
            "OmniCrops-SwinV2+FPN loaded — %s params, device=%s",
            f"{param_count:,}",
            self.device,
        )

    def _preprocess(self, image_bytes: bytes) -> Image.Image:
        """Convert raw bytes to a PIL RGB image."""
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return img

    @torch.no_grad()
    def predict(self, image_bytes: bytes) -> dict:
        """
        Run single-view inference on an image.

        Args:
            image_bytes: Raw image file bytes (JPEG, PNG, etc.)

        Returns:
            dict with predicted_class, confidence, all_probabilities
        """
        img = self._preprocess(image_bytes)
        tensor = val_transform(img).unsqueeze(0).to(self.device)

        logits = self.model(tensor)
        probs = F.softmax(logits, dim=1).squeeze(0).cpu().numpy()

        pred_idx = int(np.argmax(probs))
        confidence = float(probs[pred_idx] * 100)

        return {
            "predicted_class": self.class_list[pred_idx],
            "confidence": round(confidence, 2),
            "all_probabilities": {
                self.class_list[i]: round(float(probs[i] * 100), 2)
                for i in range(self.num_classes)
            },
        }

    @torch.no_grad()
    def predict_with_tta(self, image_bytes: bytes) -> dict:
        """
        Run Test-Time Augmentation (5× views) for higher accuracy.

        Averages softmax probabilities across 5 augmented views of the
        same image. Slower (~5× inference time) but more robust.

        Args:
            image_bytes: Raw image file bytes (JPEG, PNG, etc.)

        Returns:
            dict with predicted_class, confidence, all_probabilities, tta_views
        """
        img = self._preprocess(image_bytes)
        prob_sum = np.zeros(self.num_classes, dtype=np.float32)

        for tf in tta_transforms:
            tensor = tf(img).unsqueeze(0).to(self.device)
            logits = self.model(tensor)
            probs = F.softmax(logits, dim=1).squeeze(0).cpu().numpy()
            prob_sum += probs

        avg_probs = prob_sum / len(tta_transforms)
        pred_idx = int(np.argmax(avg_probs))
        confidence = float(avg_probs[pred_idx] * 100)

        return {
            "predicted_class": self.class_list[pred_idx],
            "confidence": round(confidence, 2),
            "all_probabilities": {
                self.class_list[i]: round(float(avg_probs[i] * 100), 2)
                for i in range(self.num_classes)
            },
            "tta_views": len(tta_transforms),
        }
