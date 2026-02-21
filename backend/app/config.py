from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from env."""

    # Database
    database_url: str = "postgresql://goldsilver:changeme@localhost:5432/goldsilver_now"

    # Redis (optional, for cache)
    redis_url: str = "redis://localhost:6379/0"
    cache_ttl_seconds: int = 300  # 5 min for today/change-rate

    # App
    app_name: str = "금은나우 API"
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
