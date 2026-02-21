"""Optional Redis client for caching. Use in-memory or no-op if Redis unavailable."""

from typing import Any, Optional

from app.config import settings

_redis_client: Any = None


def get_redis():
    """Lazy Redis connection. Returns None if redis not installed or connection fails."""
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    try:
        import redis
        _redis_client = redis.from_url(settings.redis_url, decode_responses=True)
        _redis_client.ping()
        return _redis_client
    except Exception:
        return None


def cache_get(key: str) -> Optional[str]:
    r = get_redis()
    if r is None:
        return None
    try:
        return r.get(key)
    except Exception:
        return None


def cache_set(key: str, value: str, ttl_seconds: int | None = None) -> None:
    r = get_redis()
    if r is None:
        return
    ttl = ttl_seconds or settings.cache_ttl_seconds
    try:
        r.setex(key, ttl, value)
    except Exception:
        pass
