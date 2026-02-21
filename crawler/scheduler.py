import logging
import time
from datetime import datetime, timezone

from apscheduler.schedulers.blocking import BlockingScheduler

from crawler.config import settings
from crawler.fetcher import get_page
from crawler.parser import parse_gold, parse_silver, PriceRecord
from crawler.normalizer import normalize
from crawler.repository import save_prices

logger = logging.getLogger(__name__)


def run_crawl() -> None:
    """한 사이클: 금/은 수집 → 정제 → 저장."""
    records: list[PriceRecord] = []
    now = datetime.now(timezone.utc)

    # Gold
    url_gold = settings.gold_source_url or ""
    html_gold = get_page(url_gold) if url_gold else None
    records.extend(parse_gold(html_gold, url_gold))
    if url_gold:
        time.sleep(1)

    # Silver
    url_silver = settings.silver_source_url or ""
    html_silver = get_page(url_silver) if url_silver else None
    records.extend(parse_silver(html_silver, url_silver))

    if not records:
        logger.warning("No records to save")
        return
    normalized = normalize(records)
    save_prices(normalized)


def start_scheduler() -> None:
    """APScheduler로 주기 크롤링 시작."""
    run_crawl()
    scheduler = BlockingScheduler()
    scheduler.add_job(
        run_crawl,
        "interval",
        minutes=settings.crawl_interval_minutes,
        id="crawl",
    )
    logger.info("Scheduler started (interval=%s min)", settings.crawl_interval_minutes)
    scheduler.start()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    start_scheduler()
