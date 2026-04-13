"""
User management API routes (v1).

Endpoints:
    GET    /api/v1/users/        – list all users          (ADMIN)
    GET    /api/v1/users/{id}    – get user by ID          (ADMIN or self)
    PATCH  /api/v1/users/{id}    – partial update          (ADMIN or self)
    DELETE /api/v1/users/{id}    – permanently delete      (ADMIN)
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_role
from app.db.session import get_db
from app.models.user import Role, User
from app.schemas.user import APIResponse, UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


# ─── List users ───────────────────────────────────────────────────────────────

@router.get("/", response_model=APIResponse)
async def list_users(
    skip: int = Query(default=0, ge=0, description="Number of records to skip"),
    limit: int = Query(default=50, ge=1, le=200, description="Max records to return"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(Role.ADMIN)),
) -> APIResponse:
    """
    Return a paginated list of all registered users.

    **Access:** ADMIN only.
    """
    users = await UserService.list_users(db, skip=skip, limit=limit)
    return APIResponse(
        status="success",
        message=f"Retrieved {len(users)} user(s).",
        data=[UserResponse.model_validate(u).model_dump(mode="json") for u in users],
    )


# ─── Get user by ID ───────────────────────────────────────────────────────────

@router.get("/{user_id}", response_model=APIResponse)
async def get_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> APIResponse:
    """
    Retrieve a single user by their UUID.

    **Access:** ADMIN may look up any user; any authenticated user may look
    up their own record.

    Raises:
        403 – if a non-admin tries to view another user.
        404 – if the user does not exist.
    """
    # Self-access allowed for all roles
    if current_user.role != Role.ADMIN and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own profile.",
        )

    user = await UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{user_id}' not found.",
        )

    return APIResponse(
        status="success",
        message="User retrieved.",
        data=UserResponse.model_validate(user).model_dump(mode="json"),
    )


# ─── Partial update ───────────────────────────────────────────────────────────

@router.patch("/{user_id}", response_model=APIResponse)
async def update_user(
    user_id: uuid.UUID,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> APIResponse:
    """
    Apply a partial update to a user record.

    **Access rules:**
    - ADMIN: may update any field for any user (including role and is_active).
    - Self (non-admin): may update own full_name only; role/is_active changes
      are silently ignored to prevent privilege escalation.

    Raises:
        403 – if a non-admin tries to update another user.
        404 – if the target user does not exist.
    """
    is_admin = current_user.role == Role.ADMIN

    if not is_admin and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile.",
        )

    # Non-admins cannot escalate privileges
    if not is_admin:
        payload = UserUpdate(full_name=payload.full_name)

    user = await UserService.update(db, user_id, payload)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{user_id}' not found.",
        )

    return APIResponse(
        status="success",
        message="User updated successfully.",
        data=UserResponse.model_validate(user).model_dump(mode="json"),
    )


# ─── Delete user ──────────────────────────────────────────────────────────────

@router.delete("/{user_id}", response_model=APIResponse)
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(Role.ADMIN)),
) -> APIResponse:
    """
    Permanently delete a user by ID.

    **Access:** ADMIN only.

    Raises:
        404 – if the user does not exist.
    """
    deleted = await UserService.delete(db, user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{user_id}' not found.",
        )

    return APIResponse(
        status="success",
        message=f"User '{user_id}' deleted.",
        data=None,
    )
