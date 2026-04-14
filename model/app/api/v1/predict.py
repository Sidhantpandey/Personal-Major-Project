"""
Plant Disease Prediction API endpoint (v1).

Endpoints:
    POST  /api/v1/predict  – upload a leaf image, get disease prediction
"""

import logging

from fastapi import APIRouter, File, HTTPException, Query, Request, UploadFile, status

from app.schemas.prediction import PredictionResponse, PredictionResult

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/predict", tags=["Prediction"])

# Maximum file size: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# Allowed MIME types
ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/tiff",
}


@router.post(
    "",
    response_model=PredictionResponse,
    summary="Predict plant disease from leaf image",
    response_description="Prediction result with class, confidence, and probabilities",
)
async def predict_disease(
    request: Request,
    file: UploadFile = File(
        ...,
        description="Plant leaf image (JPEG, PNG, WebP, BMP, TIFF — max 10 MB)",
    ),
    tta: bool = Query(
        default=False,
        description=(
            "Enable Test-Time Augmentation (5× views). "
            "Slower but more accurate predictions."
        ),
    ),
) -> PredictionResponse:
    """
    Upload a plant leaf image and receive a disease prediction.

    The model (OmniCrops SwinV2-B+FPN) classifies the image into one of
    48 disease/healthy categories across 15 crop types.

    **Query params:**
    - `tta=true` — enables 5× Test-Time Augmentation for higher accuracy
      (roughly 5× slower, recommended for critical predictions)

    **Supported formats:** JPEG, PNG, WebP, BMP, TIFF  
    **Max file size:** 10 MB
    """
    # ── Validate file type ────────────────────────────────────────────────
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported file type: {file.content_type}. "
                f"Allowed: {', '.join(sorted(ALLOWED_TYPES))}"
            ),
        )

    # ── Read and validate file size ───────────────────────────────────────
    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large ({len(image_bytes):,} bytes). Max: {MAX_FILE_SIZE:,} bytes.",
        )

    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # ── Get ML service from app state ─────────────────────────────────────
    ml_service = request.app.state.ml_service
    if ml_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML model is not loaded. Please try again later.",
        )

    # ── Run prediction ────────────────────────────────────────────────────
    try:
        if tta:
            result = ml_service.predict_with_tta(image_bytes)
        else:
            result = ml_service.predict(image_bytes)
    except Exception as exc:
        logger.exception("Prediction failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction failed. The image may be corrupted or invalid.",
        ) from exc

    logger.info(
        "Prediction: %s (%.1f%%) — tta=%s, file=%s",
        result["predicted_class"],
        result["confidence"],
        tta,
        file.filename,
    )

    return PredictionResponse(
        status="success",
        message="Prediction completed.",
        data=PredictionResult(**result),
    )
