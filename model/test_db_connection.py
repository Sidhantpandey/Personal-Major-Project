"""
Quick connectivity test – run once, then delete.
  python test_db_connection.py
"""
import asyncio
import asyncpg


async def main() -> None:
    conn = await asyncpg.connect(
        "postgresql://postgres:m9kug2zs@18@db.pyrhxvxqgaupayywethq.supabase.co:5432/postgres",
        ssl="require",
    )
    version = await conn.fetchval("SELECT version();")
    await conn.close()
    print("✅  Connected to Supabase!")
    print("   PostgreSQL version:", version)


if __name__ == "__main__":
    asyncio.run(main())
