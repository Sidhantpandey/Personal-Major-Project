"""
Security utilities: JWT creation/verification and password hashing.

All tokens carry the following claims:
  sub      – user email
  role     – user role string
  user_id  – UUID as str
  exp      – expiry timestamp
  iat      – issued-at timestamp
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ─── Password hashing ────────────────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Return the bcrypt hash of *plain_password*."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if *plain_password* matches *hashed_password*."""
    return pwd_context.verify(plain_password, hashed_password)


# ─── Token blacklist (in-memory; replace with Redis in production) ────────────

_token_blacklist: set[str] = set()


def blacklist_token(jti: str) -> None:
    """Add *jti* (token identifier) to the blacklist."""
    _token_blacklist.add(jti)


def is_token_blacklisted(jti: str) -> bool:
    """Return True if *jti* has been blacklisted."""
    return jti in _token_blacklist


# ─── JWT helpers ─────────────────────────────────────────────────────────────

def _build_token(
    subject: str,
    role: str,
    user_id: str,
    expires_delta: timedelta,
    token_type: str,
) -> str:
    """Internal helper that creates a signed JWT."""
    now = datetime.now(tz=timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,          # user email
        "role": role,
        "user_id": user_id,
        "type": token_type,      # "access" | "refresh"
        "jti": f"{user_id}:{token_type}:{now.timestamp()}",
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(email: str, role: str, user_id: str) -> str:
    """Return a short-lived JWT access token."""
    return _build_token(
        subject=email,
        role=role,
        user_id=user_id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="access",
    )


def create_refresh_token(email: str, role: str, user_id: str) -> str:
    """Return a long-lived JWT refresh token."""
    return _build_token(
        subject=email,
        role=role,
        user_id=user_id,
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        token_type="refresh",
    )


def decode_token(token: str) -> dict[str, Any]:
    """
    Decode and validate *token*.

    Raises:
        JWTError: if the token is invalid, expired, or blacklisted.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except JWTError as exc:
        raise JWTError(f"Token validation failed: {exc}") from exc

    jti: str | None = payload.get("jti")
    if jti and is_token_blacklisted(jti):
        raise JWTError("Token has been revoked.")

    return payload
