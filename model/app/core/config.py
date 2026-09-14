"""
Application configuration — ML inference service only.

Auth, user management, and persistence are handled by the Node.js service.
This service only needs: FastAPI, uvicorn, torch, and CORS config.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Minimal settings for the ML inference service."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Application ──────────────────────────────────────────────────────────
    APP_NAME: str = "OmniCrops ML Inference API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── ML Model ──────────────────────────────────────────────────────────────
    ML_WEIGHTS_DIR: str = "ml-weights/OmniCrops"  # dir with .pth + metadata.json
    ML_MODEL_FILENAME: str = "bestomnicrops_swinv2.pth"  # model weights checkpoint file

    # ── CORS ──────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: list[str] = ["*"]


@lru_cache
def get_settings() -> Settings:
    """Return cached Settings instance (singleton)."""
    return Settings()


settings: Settings = get_settings()
