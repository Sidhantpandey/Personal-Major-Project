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
    is_plant: bool = Field(
        default=True,
        description="Whether the image contains plant foliage",
    )
    is_confident: bool = Field(
        default=True,
        description="Whether the prediction confidence meets reliability threshold",
    )
    status: str = Field(
        default="valid",
        description="Prediction status: 'valid', 'not_a_plant', or 'low_confidence'",
    )
    warning: str | None = Field(
        default=None,
        description="Warning or guidance note if image is invalid or low confidence",
    )
    raw_predicted_class: str | None = Field(
        default=None,
        description="Raw model top-class before validation overrides",
    )
    foliage_ratio: float | None = Field(
        default=None,
        description="Estimated percentage of plant foliage pixels in the image",
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
