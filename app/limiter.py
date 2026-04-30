from slowapi import Limiter
from slowapi.util import get_remote_address
from app.config import settings
import redis as redis_client
import logging

logger = logging.getLogger(__name__)

def _get_storage_uri() -> str:
    """Use Redis if available, otherwise fall back to in-memory storage."""
    try:
        client = redis_client.from_url(settings.redis_url, socket_connect_timeout=1)
        client.ping()
        logger.info(f"Rate limiter: using Redis at {settings.redis_url}")
        return settings.redis_url
    except Exception:
        logger.warning("Rate limiter: Redis unavailable, falling back to in-memory storage")
        return "memory://"

limiter = Limiter(key_func=get_remote_address, storage_uri=_get_storage_uri())

