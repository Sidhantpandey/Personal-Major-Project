"""
SQLAlchemy ORM model for the User entity.

Roles (RBAC):
    ADMIN       – full access, can manage users and roles
    AGRONOMIST  – can view/upload disease reports and analysis
    FARMER      – can upload plant images and view own results
    GUEST       – read-only, limited endpoints
"""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Role(str, enum.Enum):
    """Supported roles for Role-Based Access Control."""

    ADMIN = "admin"
    AGRONOMIST = "agronomist"
    FARMER = "farmer"
    GUEST = "guest"


def _now_utc() -> datetime:
    return datetime.now(tz=timezone.utc)


class User(Base):
    """Persistent user record."""

    __tablename__ = "users"

    # ── Identity ──────────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        nullable=False,
        index=True,
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # ── RBAC ─────────────────────────────────────────────────────────────────
    role: Mapped[Role] = mapped_column(
        Enum(Role, name="user_role", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=Role.GUEST,
    )

    # ── Status ────────────────────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_now_utc,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_now_utc,
        onupdate=_now_utc,
        nullable=False,
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User id={self.id} email={self.email!r} role={self.role.value}>"
