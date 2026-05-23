from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # LLM Config
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Search Tool
    TAVILY_API_KEY: str

    # Database
    DATABASE_URL: str

    # Vector DB
    CHROMA_PERSIST_DIR: str = "./vector_db/chroma_data"

    # Auth (JWT)
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"

    # Cloudinary Config
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # Optional OpenAI Whisper Config
    OPENAI_API_KEY: Optional[str] = None

    # App Config
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"
    REPORTS_DIR: str = "./reports"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

@lru_cache
def get_settings() -> Settings:
    return Settings()
