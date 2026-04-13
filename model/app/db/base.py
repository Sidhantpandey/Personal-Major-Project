"""
Declarative base for all SQLAlchemy ORM models.

Import this module wherever you need the shared Base so that Alembic
can auto-discover all mapped tables.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared metadata / registry for all ORM models."""
    pass


# ─── Import all models here so Alembic sees them ──────────────────────────────
# Keep this import at the bottom to avoid circular imports.
from app.models import user as _user_models  # noqa: F401, E402
