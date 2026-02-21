import logging
import time
from typing import Optional

import requests

from crawler.config import settings

logger = logging.getLogger(__name__)


def get_page(url: str) -> Optional[str]:
    """
    Fetch HTML from url. Retries with exponential backoff on failure.
    Returns None on failure.
    """
    headers = {"User-Agent": settings.user_agent}
    last_error = None
    for attempt in range(settings.retry_count):
        try:
            resp = requests.get(
                url,
                headers=headers,
                timeout=settings.request_timeout_sec,
            )
            resp.raise_for_status()
            return resp.text
        except requests.RequestException as e:
            last_error = e
            logger.warning("Fetch failed (attempt %s/%s): %s", attempt + 1, settings.retry_count, e)
            if attempt < settings.retry_count - 1:
                time.sleep(2**attempt)
    logger.error("Fetch failed after retries: %s", last_error)
    return None
