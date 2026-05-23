import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from backend.config import get_settings

settings = get_settings()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/startup_consultant")
DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://")

from sqlalchemy.pool import NullPool

connect_args = {}
if settings.ENVIRONMENT == "development":
    connect_args["ssl"] = False

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    future=True,
    poolclass=NullPool,
    connect_args=connect_args
)

# Async session maker
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db() -> None:
    # This will be imported after all models are loaded to avoid circular imports
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
