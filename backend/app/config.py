"""
SAVIAN — Application Configuration
Uses pydantic-settings for environment variable management.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file."""

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/savian.db"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    # Solver defaults
    SOLVER_DEFAULT_TIME_LIMIT_SEC: float = 8.0
    SOLVER_NUM_WORKERS: int = 8

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
