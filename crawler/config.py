from pydantic_settings import BaseSettings


class CrawlerSettings(BaseSettings):
    """Crawler settings from env."""

    database_url: str = "postgresql://goldsilver:changeme@localhost:5432/goldsilver_now"
    crawl_interval_minutes: int = 5
    gold_source_url: str = ""
    silver_source_url: str = ""
    user_agent: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    request_timeout_sec: int = 10
    retry_count: int = 3

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = CrawlerSettings()
