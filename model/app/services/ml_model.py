"""
OmniCrops SwinV2-B + FPN model architecture.

Extracted from the training notebook so that the FastAPI server can
reconstruct the model graph and load the trained weights (.pth).

Architecture:
    Input(224×224×3)
      → SwinV2-B (ImageNet-1K pretrained backbone)
          Stage2 → 28×28, 256-d  ← FPN P2
          Stage3 → 14×14, 512-d  ← FPN P3
          Stage4 →  7×7, 1024-d  ← FPN P4
      → FPN fusion → 512-d
      → Head: FC(512→256) → GELU → Drop → FC(256→N)
"""

import torch
import torch.nn as nn
from torchvision.models import swin_v2_b, Swin_V2_B_Weights


class FPNFusion(nn.Module):
    """
    Lightweight FPN that fuses SwinV2-B stage outputs.
    SwinV2-B feature dims: S1=128, S2=256, S3=512, S4=1024
    Output: fused 512-d global descriptor
    """

    def __init__(self):
        super().__init__()
        # Lateral projections → common 256-d
        self.lat4 = nn.Sequential(nn.Linear(1024, 256), nn.GELU())
        self.lat3 = nn.Sequential(nn.Linear(512, 256), nn.GELU())
        self.lat2 = nn.Sequential(nn.Linear(256, 256), nn.GELU())

        # Top-down fusion refinement
        self.fuse43 = nn.Sequential(nn.Linear(256, 256), nn.GELU())
        self.fuse32 = nn.Sequential(nn.Linear(256, 256), nn.GELU())

        # Final aggregation: [p4‖p3‖p2] → 512
        self.agg = nn.Sequential(
            nn.Linear(768, 512), nn.GELU(),
            nn.Dropout(0.1),
        )

    def forward(self, f2, f3, f4):
        # f2: (B, H2*W2, 256)  f3: (B, H3*W3, 512)  f4: (B, H4*W4, 1024)
        p4 = self.lat4(f4.mean(1))   # (B, 256) — global avg over tokens
        p3 = self.lat3(f3.mean(1))   # (B, 256)
        p2 = self.lat2(f2.mean(1))   # (B, 256)

        # Top-down fusion
        p3 = self.fuse43(p3 + p4)
        p2 = self.fuse32(p2 + p3)

        return self.agg(torch.cat([p4, p3, p2], dim=1))  # (B, 512)


class OmniCropsSwinFPN(nn.Module):
    """
    SwinV2-B backbone + FPN multi-scale fusion + classification head.
    """

    def __init__(self, num_classes: int, dropout: float = 0.3):
        super().__init__()
        weights = Swin_V2_B_Weights.IMAGENET1K_V1
        backbone = swin_v2_b(weights=weights)

        # Extract stage-wise feature layers
        self.patch_embed = backbone.features[0]   # patch partition
        self.stage1      = backbone.features[1]   # 128-d
        self.downsample1 = backbone.features[2]   # → 256-d
        self.stage2      = backbone.features[3]   # 256-d  ← P2
        self.downsample2 = backbone.features[4]   # → 512-d
        self.stage3      = backbone.features[5]   # 512-d  ← P3
        self.downsample3 = backbone.features[6]   # → 1024-d
        self.stage4      = backbone.features[7]   # 1024-d ← P4
        self.norm        = backbone.norm

        self.fpn  = FPNFusion()
        self.head = nn.Sequential(
            nn.Linear(512, 256), nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(256, num_classes),
        )

        self._init_head()

    def _init_head(self):
        for m in [self.fpn, self.head]:
            for layer in m.modules():
                if isinstance(layer, nn.Linear):
                    nn.init.trunc_normal_(layer.weight, std=0.02)
                    if layer.bias is not None:
                        nn.init.zeros_(layer.bias)

    def forward(self, x):
        x  = self.patch_embed(x)   # (B, 56, 56, 128)
        x  = self.stage1(x)
        x  = self.downsample1(x)   # (B, 28, 28, 256)
        f2 = self.stage2(x)        # (B, 28, 28, 256) ← P2
        x  = self.downsample2(f2)  # (B, 14, 14, 512)
        f3 = self.stage3(x)        # (B, 14, 14, 512) ← P3
        x  = self.downsample3(f3)  # (B,  7,  7, 1024)
        f4 = self.stage4(x)        # (B,  7,  7, 1024) ← P4

        # Flatten spatial → token sequence for FPN
        f2f = f2.flatten(1, 2)   # (B, 784,  256)
        f3f = f3.flatten(1, 2)   # (B, 196,  512)
        f4f = f4.flatten(1, 2)   # (B,  49, 1024)

        feat = self.fpn(f2f, f3f, f4f)   # (B, 512)
        return self.head(feat)            # (B, N_classes)
