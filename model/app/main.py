"""
FastAPI application entry point.

Registers:
  - All API routers under /api/v1
  - A /health liveness probe
  - CORS middleware (configurable via settings.ALLOWED_ORIGINS)
  - Global exception handlers for cleaner error envelopes
"""

from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import auth, users
from app.core.config import settings


# ─── Lifespan (startup / shutdown hooks) ──────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[type-arg]
    """Application lifespan: runs startup tasks, then yields, then teardown."""
    # Startup ──────────────────────────────────────────────────────────────────
    # NOTE: Table creation is handled by Alembic migrations.
    # If you want auto-create in dev, uncomment:
    #
    # from app.db.session import async_engine
    # from app.db.base import Base
    # async with async_engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown ─────────────────────────────────────────────────────────────────
    # Add any cleanup here (close Redis connections, etc.)


# ─── App instance ─────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Plant Disease Detection API with JWT authentication "
        "and Role-Based Access Control (RBAC)."
    ),
    contact={"name": "Platform Team"},
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ─── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Global exception handlers ────────────────────────────────────────────────

def _envelope(
    status_str: str, message: str, data: Any = None, http_status: int = 200
) -> JSONResponse:
    return JSONResponse(
        status_code=http_status,
        content={"status": status_str, "message": message, "data": data},
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception) -> JSONResponse:
    return _envelope("error", "Resource not found.", http_status=404)


@app.exception_handler(500)
async def server_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return _envelope("error", "Internal server error.", http_status=500)


# ─── Health check ─────────────────────────────────────────────────────────────

@app.get(
    "/health",
    tags=["Health"],
    summary="Liveness probe",
    response_description="Service status",
)
async def health_check() -> dict[str, str]:
    """
    Lightweight health check endpoint used by load balancers / orchestrators.

    Returns:
        JSON with *status* == "ok" when the service is reachable.
    """
    return {"status": "ok", "service": settings.APP_NAME, "version": settings.APP_VERSION}


# ─── Routes ───────────────────────────────────────────────────────────────────

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
