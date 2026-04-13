"""
Authentication API routes (v1).

Endpoints:
    POST  /api/v1/auth/register  – create a new account
    POST  /api/v1/auth/login     – authenticate and receive JWT tokens
    POST  /api/v1/auth/refresh   – exchange refresh token for new access token
    POST  /api/v1/auth/logout    – revoke the current access token
    GET   /api/v1/auth/me        – return the authenticated user's profile
"""

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, oauth2_scheme
from app.core.security import (
    blacklist_token,
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    APIResponse,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    TokenResponse,
    UserCreate,
    UserResponse,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ─── Register ─────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> APIResponse:
    """
    Create a new user account.

    - Validates email format and password strength via Pydantic.
    - Returns 422 if validation fails; 409 if email already exists.
    """
    try:
        user = await UserService.create(db, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc

    return APIResponse(
        status="success",
        message="Account created successfully.",
        data=UserResponse.model_validate(user).model_dump(mode="json"),
    )


# ─── Login ────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=APIResponse)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> APIResponse:
    """
    Authenticate a user and issue JWT access + refresh tokens.

    # TODO: Add rate limiting (e.g. slowapi or a Redis-backed counter)
    #       to prevent brute-force attacks on this endpoint.

    Returns:
        access_token  – expires in ACCESS_TOKEN_EXPIRE_MINUTES
        refresh_token – expires in REFRESH_TOKEN_EXPIRE_DAYS
    """
    user = await UserService.get_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact an administrator.",
        )

    uid = str(user.id)
    tokens = TokenResponse(
        access_token=create_access_token(user.email, user.role.value, uid),
        refresh_token=create_refresh_token(user.email, user.role.value, uid),
    )
    return APIResponse(
        status="success",
        message="Login successful.",
        data=tokens.model_dump(),
    )


# ─── Refresh ──────────────────────────────────────────────────────────────────

@router.post("/refresh", response_model=APIResponse)
async def refresh_token(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> APIResponse:
    """
    Issue a new access token using a valid refresh token.

    - Rejects access tokens used in place of refresh tokens.
    - Returns 401 if the refresh token is invalid or blacklisted.
    """
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token_data = decode_token(payload.refresh_token)
    except JWTError:
        raise credentials_exc

    if token_data.get("type") != "refresh":
        raise credentials_exc

    user = await UserService.get_by_email(db, token_data["sub"])
    if not user or not user.is_active:
        raise credentials_exc

    uid = str(user.id)
    new_access = create_access_token(user.email, user.role.value, uid)
    return APIResponse(
        status="success",
        message="Token refreshed.",
        data={"access_token": new_access, "token_type": "bearer"},
    )


# ─── Logout ───────────────────────────────────────────────────────────────────

@router.post("/logout", response_model=APIResponse)
async def logout(
    payload: LogoutRequest,
    _: User = Depends(get_current_user),  # ensures caller is authenticated
) -> APIResponse:
    """
    Revoke the supplied access token (adds its JTI to the blacklist).

    The client is responsible for discarding the refresh token locally.
    """
    try:
        token_data = decode_token(payload.access_token)
        jti: str = token_data["jti"]
        blacklist_token(jti)
    except (JWTError, KeyError):
        # Even if token is invalid/expired, treat logout as success
        pass

    return APIResponse(status="success", message="Logged out successfully.", data=None)


# ─── Me ───────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=APIResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> APIResponse:
    """Return the profile of the currently authenticated user."""
    return APIResponse(
        status="success",
        message="Current user retrieved.",
        data=UserResponse.model_validate(current_user).model_dump(mode="json"),
    )
