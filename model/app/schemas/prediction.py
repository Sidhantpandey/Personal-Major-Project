"""
Pydantic schemas for the /predict endpoint.
"""

from pydantic import BaseModel, Field


class PredictionResult(BaseModel):
    """Single prediction output."""

    predicted_class: str = Field(
        ...,
        description="Unified class name, e.g. 'Tomato___Bacterial_Spot'",
        examples=["Tomato___Bacterial_Spot"],
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Confidence percentage for the predicted class",
        examples=[97.32],
    )
    all_probabilities: dict[str, float] = Field(
        ...,
        description="Probability (%) for every class",
    )
    tta_views: int | None = Field(
        default=None,
        description="Number of TTA views used (only present when tta=true)",
    )


class PredictionResponse(BaseModel):
    """API envelope for prediction results."""

    status: str = Field(default="success", examples=["success"])
    message: str = Field(
        default="Prediction completed.",
        examples=["Prediction completed."],
    )
    data: PredictionResult
