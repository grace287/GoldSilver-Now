import logging
from typing import List

import psycopg2
from psycopg2.extras import execute_values

from crawler.config import settings
from crawler.parser import PriceRecord

logger = logging.getLogger(__name__)


def save_prices(records: List[PriceRecord]) -> bool:
    """Insert price records into DB. Returns True on success."""
    if not records:
        return True
    try:
        conn = psycopg2.connect(settings.database_url)
        cur = conn.cursor()
        execute_values(
            cur,
            """
            INSERT INTO prices (metal_id, buy_price, sell_price, source, created_at)
            VALUES %s
            """,
            [
                (
                    r.metal_id,
                    float(r.buy_price),
                    float(r.sell_price),
                    r.source,
                    r.crawled_at,
                )
                for r in records
            ],
        )
        conn.commit()
        cur.close()
        conn.close()
        logger.info("Saved %s price records", len(records))
        return True
    except Exception as e:
        logger.error("Save prices failed: %s", e)
        return False
