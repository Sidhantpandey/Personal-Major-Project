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

    def __init__(self, weights_dir: str, model_filename: str | None = None):
        """
        Args:
            weights_dir: Path to the directory containing model weights and metadata.json
            model_filename: Specific weights filename (defaults to bestomnicrops_swinv2.pth)
        """
        weights_path = Path(weights_dir)
        metadata_file = weights_path / "metadata.json"

        if not metadata_file.exists():
            raise FileNotFoundError(f"Metadata not found: {metadata_file}")

        # Target bestomnicrops_swinv2.pth specifically
        target_name = model_filename or "bestomnicrops_swinv2.pth"
        model_file = weights_path / target_name
        if not model_file.exists():
            # Fallback to alternate naming if present
            alt_name = "best_omnicrops_swinv2.pth" if target_name == "bestomnicrops_swinv2.pth" else "bestomnicrops_swinv2.pth"
            alt_file = weights_path / alt_name
            if alt_file.exists():
                logger.warning(
                    "⚠️ %s not found in %s, falling back to %s",
                    target_name,
                    weights_path,
                    alt_name,
                )
                model_file = alt_file
            else:
                raise FileNotFoundError(f"Model weights not found: {model_file}")

        # If the path is a directory (e.g. if extracted as a folder), check if a .pth is inside
        if model_file.is_dir():
            nested_weights = list(model_file.glob("*.pth"))
            if nested_weights:
                logger.warning(
                    "⚠️ '%s' is a directory! Auto-resolved to nested weight file: %s",
                    model_file.name,
                    nested_weights[0],
                )
                model_file = nested_weights[0]
            else:
                dir_contents = [p.name for p in model_file.iterdir()][:5]
                raise IsADirectoryError(
                    f"'{model_file}' is a directory, not a file! Contents: {dir_contents}. "
                    f"Please remove this folder and place the real 336.8 MB .pth file at: {model_file}"
                )

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

        # Load trained weights strictly
        try:
            try:
                state_dict = torch.load(
                    model_file,
                    map_location=self.device,
                    weights_only=True,
                )
            except TypeError:
                state_dict = torch.load(model_file, map_location=self.device)

            self.model.load_state_dict(state_dict, strict=True)
            logger.info("✅ Model checkpoint successfully loaded from %s", model_file)
        except Exception as exc:
            logger.error("❌ Failed to load checkpoint from %s: %s", model_file, exc)
            raise RuntimeError(f"Could not load trained model weights from {model_file}: {exc}") from exc

        self.model.to(self.device)
        self.model.eval()

        param_count = sum(p.numel() for p in self.model.parameters())
        logger.info(
            "OmniCrops-SwinV2+FPN loaded — %s params, device=%s, weights=%s",
            f"{param_count:,}",
            self.device,
            model_file.name,
        )

    def _preprocess(self, image_bytes: bytes) -> Image.Image:
        """Convert raw bytes to a PIL RGB image."""
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return img

    def _validate_leaf_image(self, img: Image.Image) -> tuple[bool, str, float]:
        """
        Validate whether the uploaded image contains plant foliage.

        Checks:
        1. Contrast / dynamic range: rejects blank, solid color, or extreme low-contrast images.
        2. Plant color distribution in HSV: checks for characteristic vegetation chlorophyll
           greens (h in [28, 125]) and necrotic / lesion / blight yellow-browns (h in [10, 35]).

        Returns:
            (is_plant: bool, reason: str, foliage_ratio: float)
        """
        arr_gray = np.array(img.convert("L"), dtype=np.float32)
        std = float(np.std(arr_gray))
        if std < 8.0:
            return False, "Image appears blank, solid, or has insufficient contrast.", 0.0

        # Check for pure synthetic noise (uncorrelated random pixels)
        diff_x = np.abs(np.diff(arr_gray, axis=1))
        diff_y = np.abs(np.diff(arr_gray, axis=0))
        mean_diff = float((np.mean(diff_x) + np.mean(diff_y)) / 2.0)
        roughness = mean_diff / (std + 1e-6)
        if roughness > 0.95:
            return False, "Image appears to be synthetic noise or corrupted visual data.", 0.0

        thumb = img.resize((128, 128))
        hsv = np.array(thumb.convert("HSV"))
        h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

        # Green foliage: Hue 28-125 (approx 40-175 deg)
        green = (h >= 28) & (h <= 125) & (s >= 20) & (v >= 20)

        # Lesion / necrotic yellow-browns: Hue 10-35 (approx 14-50 deg)
        # Leaf tissue has green and red components with low blue, unlike pure skin tones
        rgb = np.array(thumb)
        r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
        lesion = (h >= 10) & (h <= 35) & (s >= 35) & (v >= 20) & (v <= 235) & (g >= b - 20)

        plant_pixels = green | lesion
        ratio = float(np.count_nonzero(plant_pixels) / (128 * 128))

        # Real leaf close-ups typically occupy > 20% of the image.
        # Below 10% is almost certainly a non-leaf (vehicle, shoe, selfie, indoor object, code screenshot).
        if ratio < 0.10:
            return (
                False,
                f"No crop or plant leaf detected ({ratio * 100:.1f}% foliage pixels). Please upload a clear photo of a crop leaf.",
                ratio,
            )

        return True, "Plant leaf detected.", ratio

    def _calibrate_probabilities(
        self, logits: torch.Tensor, crop_type: str | None = None
    ) -> np.ndarray:
        """
        Calibrate output logits into natural probabilities.
        Optionally conditions on crop_type (e.g. 'Tomato', 'Apple', 'Corn')
        to prioritize candidate classes matching the user's selected crop.
        """
        lg = logits.clone().squeeze(0)

        # If a specific crop is provided, prioritize candidate classes for that crop
        if crop_type:
            clean_crop = crop_type.strip().lower()
            matching_indices = [
                i for i, c in enumerate(self.class_list)
                if c.lower().startswith(clean_crop)
            ]
            if matching_indices:
                mask = torch.full_like(lg, -2.5)
                for i in matching_indices:
                    mask[i] = 1.5
                lg = lg + mask

        probs = F.softmax(lg, dim=0).cpu().numpy()
        return probs

    @torch.no_grad()
    def predict(self, image_bytes: bytes, crop_type: str | None = None) -> dict:
        """
        Run single-view inference on an image.

        Args:
            image_bytes: Raw image file bytes (JPEG, PNG, etc.)
            crop_type: Optional crop name (e.g. 'Tomato') to condition predictions

        Returns:
            dict with predicted_class, confidence, all_probabilities, is_plant, is_confident, status, warning
        """
        img = self._preprocess(image_bytes)
        is_plant, foliage_reason, foliage_ratio = self._validate_leaf_image(img)

        tensor = val_transform(img).unsqueeze(0).to(self.device)
        logits = self.model(tensor)
        probs = self._calibrate_probabilities(logits, crop_type=crop_type)

        pred_idx = int(np.argmax(probs))
        raw_confidence = float(probs[pred_idx] * 100)
        raw_class = self.class_list[pred_idx]

        is_confident = (raw_confidence >= 40.0)

        if not is_plant:
            status = "not_a_plant"
            predicted_class = "Unrecognized / Non-Crop Image"
            confidence = round(raw_confidence, 2)
            warning = foliage_reason
        elif not is_confident:
            status = "low_confidence"
            predicted_class = raw_class
            confidence = round(raw_confidence, 2)
            warning = f"Low confidence ({raw_confidence:.1f}%). Symptoms do not clearly match known diseases. Please ensure good lighting and focus on the affected leaf area."
        else:
            status = "valid"
            predicted_class = raw_class
            confidence = round(raw_confidence, 2)
            warning = None

        return {
            "predicted_class": predicted_class,
            "raw_predicted_class": raw_class,
            "confidence": confidence,
            "all_probabilities": {
                self.class_list[i]: round(float(probs[i] * 100), 2)
                for i in range(self.num_classes)
            },
            "is_plant": is_plant,
            "is_confident": is_confident,
            "status": status,
            "warning": warning,
            "foliage_ratio": round(foliage_ratio * 100, 1),
        }

    @torch.no_grad()
    def predict_with_tta(self, image_bytes: bytes, crop_type: str | None = None) -> dict:
        """
        Run Test-Time Augmentation (5× views) for higher accuracy.

        Averages softmax probabilities across 5 augmented views of the
        same image. Slower (~5× inference time) but more robust.

        Args:
            image_bytes: Raw image file bytes (JPEG, PNG, etc.)
            crop_type: Optional crop name (e.g. 'Tomato') to condition predictions

        Returns:
            dict with predicted_class, confidence, all_probabilities, is_plant, is_confident, status, warning, tta_views
        """
        img = self._preprocess(image_bytes)
        is_plant, foliage_reason, foliage_ratio = self._validate_leaf_image(img)

        logits_sum = None

        for tf in tta_transforms:
            tensor = tf(img).unsqueeze(0).to(self.device)
            logits = self.model(tensor)
            if logits_sum is None:
                logits_sum = logits.clone()
            else:
                logits_sum += logits

        avg_logits = logits_sum / len(tta_transforms)
        probs = self._calibrate_probabilities(avg_logits, crop_type=crop_type)

        pred_idx = int(np.argmax(probs))
        raw_confidence = float(probs[pred_idx] * 100)
        raw_class = self.class_list[pred_idx]

        is_confident = (raw_confidence >= 40.0)

        if not is_plant:
            status = "not_a_plant"
            predicted_class = "Unrecognized / Non-Crop Image"
            confidence = round(raw_confidence, 2)
            warning = foliage_reason
        elif not is_confident:
            status = "low_confidence"
            predicted_class = raw_class
            confidence = round(raw_confidence, 2)
            warning = f"Low confidence ({raw_confidence:.1f}%). Symptoms do not clearly match known diseases. Please ensure good lighting and focus on the affected leaf area."
        else:
            status = "valid"
            predicted_class = raw_class
            confidence = round(raw_confidence, 2)
            warning = None

        return {
            "predicted_class": predicted_class,
            "raw_predicted_class": raw_class,
            "confidence": confidence,
            "all_probabilities": {
                self.class_list[i]: round(float(probs[i] * 100), 2)
                for i in range(self.num_classes)
            },
            "is_plant": is_plant,
            "is_confident": is_confident,
            "status": status,
            "warning": warning,
            "foliage_ratio": round(foliage_ratio * 100, 1),
            "tta_views": len(tta_transforms),
        }
