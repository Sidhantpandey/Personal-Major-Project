"""
Reusable FastAPI dependencies for authentication and RBAC.

Usage:
    # Protect any route  ──  current user must be authenticated
    Depends(get_current_user)

    # Protect with role check  ──  must be ADMIN or AGRONOMIST
    Depends(require_role(Role.ADMIN, Role.AGRONOMIST))
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import Role, User
from app.services.user_service import UserService

# OAuth2 bearer scheme – token extracted from `Authorization: Bearer <token>`
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Validate the bearer token and return the corresponding active User.

    Raises:
        HTTPException 401 – if token is missing, invalid, or revoked.
        HTTPException 403 – if account is inactive.
    """
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
    except JWTError:
        raise credentials_exc

    # Access tokens only; reject refresh tokens used as access tokens
    if payload.get("type") != "access":
        raise credentials_exc

    user_id: str | None = payload.get("user_id")
    if user_id is None:
        raise credentials_exc

    user = await UserService.get_by_id(db, user_id)
    if user is None:
        raise credentials_exc

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive account.",
        )

    return user


def require_role(*roles: Role):
    """
    Factory that returns a FastAPI dependency enforcing role membership.

    Example::

        @router.get("/admin-only")
        async def admin_view(
            current_user: User = Depends(require_role(Role.ADMIN)),
        ): ...

    Raises:
        HTTPException 403 – if the current user's role is not in *roles*.
    """

    async def _check_role(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Access denied. Required role(s): "
                    f"{[r.value for r in roles]}."
                ),
            )
        return current_user

    return _check_role
