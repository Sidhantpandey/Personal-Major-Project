"""
One-time setup script: drops + recreates plant_disease_db, then runs Alembic.
Run with:  python create_db.py
Delete this file after setup is complete.
"""
import asyncio
import subprocess
import sys
import asyncpg


DB_NAME = "plant_disease_db"
PG_USER = "postgres"
PG_PASS = "Shivam@123"
PG_HOST = "localhost"
PG_PORT = 5432


async def recreate_database() -> None:
    print(f"Connecting to PostgreSQL at {PG_HOST}:{PG_PORT} ...")
    try:
        conn = await asyncpg.connect(
            host=PG_HOST,
            port=PG_PORT,
            user=PG_USER,
            password=PG_PASS,
            database="postgres",   # connect to maintenance DB
        )
    except Exception as e:
        print(f"\n❌  Could not connect to PostgreSQL: {e}")
        print(
            "\nMake sure:\n"
            "  1. PostgreSQL service is running\n"
            "  2. The password in this script matches your postgres user\n"
            "  3. Port 5432 is not blocked\n"
        )
        sys.exit(1)

    # Drop existing DB (terminate any open connections first)
    exists = await conn.fetchval(
        "SELECT 1 FROM pg_database WHERE datname = $1", DB_NAME
    )
    if exists:
        print(f"⚠️   Database '{DB_NAME}' exists — dropping it for a clean slate ...")
        # Terminate all active connections to target DB
        await conn.execute(
            f"""
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = '{DB_NAME}' AND pid <> pg_backend_pid()
            """
        )
        await conn.execute(f'DROP DATABASE "{DB_NAME}"')
        print(f"   Dropped '{DB_NAME}'.")

    await conn.execute(f'CREATE DATABASE "{DB_NAME}"')
    print(f"✅  Database '{DB_NAME}' created fresh.")
    await conn.close()


def run_migrations() -> None:
    print("\nRunning Alembic migrations ...")
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=".",
    )
    if result.returncode == 0:
        print("✅  All migrations applied successfully.")
    else:
        print("❌  Alembic migration failed. See error above.")
        sys.exit(result.returncode)


if __name__ == "__main__":
    asyncio.run(recreate_database())
    run_migrations()
    print(
        "\n🎉  Setup complete!\n"
        "    Run: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000\n"
        "    Docs: http://localhost:8000/docs"
    )
