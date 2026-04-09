"""
PostgreSQL connection placeholder. The API currently uses `MemoryStore`; keep `DATABASE_URL` ready
for SQLAlchemy/asyncpg when persisting to Postgres.
"""

from app.config import settings


def describe_data_backend() -> str:
    if settings.database_url:
        return "postgres_configured_not_wired"
    return "memory"


async def check_database_connectivity() -> bool:
    """Return True when a real DSN is set (connectivity check not implemented yet)."""
    return bool(settings.database_url)
