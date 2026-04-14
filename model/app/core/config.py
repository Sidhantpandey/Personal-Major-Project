"""
Application configuration management using pydantic-settings.
All sensitive values are loaded from environment variables / .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """Central settings loaded from .env via pydantic-settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Application ─────────────────────────────────────────────────────────
    APP_NAME: str = "Plant Disease Detection API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str  # e.g. postgresql+asyncpg://user:pass@host/db

    # ── JWT ──────────────────────────────────────────────────────────────────
    SECRET_KEY: str  # generate with: openssl rand -hex 32
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── ML Model ──────────────────────────────────────────────────────────────
    ML_WEIGHTS_DIR: str = "ml-weights/OmniCrops"  # dir with .pth + metadata.json

    # ── CORS (optional) ──────────────────────────────────────────────────────
    ALLOWED_ORIGINS: list[str] = ["*"]


@lru_cache
def get_settings() -> Settings:
    """Return cached Settings instance (singleton pattern)."""
    return Settings()


settings: Settings = get_settings()
