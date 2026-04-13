"""
Service layer for User CRUD operations.

All database I/O is async; business logic is kept out of route handlers.
"""

import uuid
from typing import Sequence

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """Namespace for stateless user-related database helpers."""

    # ── Read ─────────────────────────────────────────────────────────────────

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: str | uuid.UUID) -> User | None:
        """Return the User with *user_id* or None if not found."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> User | None:
        """Return the User with *email* or None if not found."""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_users(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> Sequence[User]:
        """Return a paginated list of all users (ADMIN only)."""
        result = await db.execute(select(User).offset(skip).limit(limit))
        return result.scalars().all()

    # ── Write ────────────────────────────────────────────────────────────────

    @staticmethod
    async def create(db: AsyncSession, payload: UserCreate) -> User:
        """
        Persist a new User from *payload*.

        Raises:
            ValueError: if the email is already registered.
        """
        existing = await UserService.get_by_email(db, payload.email)
        if existing:
            raise ValueError(f"Email '{payload.email}' is already registered.")

        user = User(
            email=payload.email,
            hashed_password=hash_password(payload.password),
            full_name=payload.full_name,
            role=payload.role,
        )
        db.add(user)
        await db.flush()   # populate id / timestamps before returning
        await db.refresh(user)
        return user

    @staticmethod
    async def update(
        db: AsyncSession, user_id: str | uuid.UUID, payload: UserUpdate
    ) -> User | None:
        """
        Apply *payload* fields (excluding unset values) to the User.

        Returns the updated User or None if not found.
        """
        changes = payload.model_dump(exclude_unset=True)
        if not changes:
            return await UserService.get_by_id(db, user_id)

        await db.execute(
            update(User).where(User.id == user_id).values(**changes)
        )
        await db.flush()
        return await UserService.get_by_id(db, user_id)

    @staticmethod
    async def delete(db: AsyncSession, user_id: str | uuid.UUID) -> bool:
        """
        Delete the User with *user_id*.

        Returns:
            True if deleted, False if not found.
        """
        user = await UserService.get_by_id(db, user_id)
        if not user:
            return False
        await db.delete(user)
        await db.flush()
        return True
