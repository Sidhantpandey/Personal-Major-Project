"""
Async SQLAlchemy engine and session factory.

Provides:
    async_engine   – AsyncEngine connected to PostgreSQL via asyncpg
    AsyncSessionLocal – session factory for route handlers
    get_db         – FastAPI dependency that yields an AsyncSession
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

# ─── Engine ───────────────────────────────────────────────────────────────────

async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,     # SQL logging in debug mode
    pool_pre_ping=True,      # verify connection health before checkout
    pool_size=10,
    max_overflow=20,
)

# ─── Session factory ──────────────────────────────────────────────────────────

AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=async_engine,
    expire_on_commit=False,  # avoid lazy-load errors after commit
    autoflush=False,
    autocommit=False,
)


# ─── Dependency ───────────────────────────────────────────────────────────────

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an AsyncSession; roll back on error, always close on exit."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
