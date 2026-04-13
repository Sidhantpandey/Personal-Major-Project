"""
Pydantic schemas for User-related request/response payloads.

Password hashes are intentionally excluded from every outbound schema.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import Role


# ─── Shared base ──────────────────────────────────────────────────────────────

class _UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)


# ─── Inbound (request) schemas ───────────────────────────────────────────────

class UserCreate(_UserBase):
    """Payload for POST /auth/register."""

    password: str = Field(..., min_length=8, max_length=128)
    role: Role = Role.GUEST

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Ensure password contains at least one digit and one letter."""
        has_letter = any(c.isalpha() for c in v)
        has_digit = any(c.isdigit() for c in v)
        if not (has_letter and has_digit):
            raise ValueError(
                "Password must contain at least one letter and one digit."
            )
        return v


class UserUpdate(BaseModel):
    """Payload for PATCH /users/{id}  –  all fields optional."""

    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    is_active: bool | None = None
    role: Role | None = None


class LoginRequest(BaseModel):
    """Payload for POST /auth/login."""

    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    """Payload for POST /auth/refresh."""

    refresh_token: str


class LogoutRequest(BaseModel):
    """Payload for POST /auth/logout."""

    access_token: str


# ─── Outbound (response) schemas ─────────────────────────────────────────────

class UserResponse(_UserBase):
    """Public user representation – never includes hashed_password."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: Role
    is_active: bool
    created_at: datetime
    updated_at: datetime


class TokenResponse(BaseModel):
    """Returned by /auth/login and /auth/refresh."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ─── Envelope ────────────────────────────────────────────────────────────────

class APIResponse(BaseModel):
    """Standardised envelope for every endpoint response."""

    status: str          # "success" | "error"
    message: str
    data: dict | list | None = None
