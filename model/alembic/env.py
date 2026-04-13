"""
Alembic environment script for async SQLAlchemy migrations.

Supports both offline (SQL script) and online (live DB) migration modes.
DATABASE_URL is read from the .env file via app.core.config.settings.
"""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.db.base import Base          # registers all ORM models

# ─── Alembic Config ───────────────────────────────────────────────────────────
config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ─── Offline migrations (generates SQL script) ───────────────────────────────

def run_migrations_offline() -> None:
    """Run migrations without a live DB connection."""
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ─── Online migrations (applies to live DB) ──────────────────────────────────

def do_run_migrations(connection):  # type: ignore[no-untyped-def]
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations with an async engine."""
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await engine.dispose()


# ─── Entry point ──────────────────────────────────────────────────────────────

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
