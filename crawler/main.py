"""
진입점: 1회 크롤링 또는 스케줄러 실행.
사용법:
  python main.py          → 1회 수집 후 종료
  python main.py --schedule → 주기 수집 (APScheduler)
"""
import argparse
import logging

from crawler.scheduler import run_crawl, start_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


def main() -> None:
    parser = argparse.ArgumentParser(description="GoldSilver Now Crawler")
    parser.add_argument(
        "--schedule",
        action="store_true",
        help="Run scheduler (interval crawl) instead of one-shot",
    )
    args = parser.parse_args()
    if args.schedule:
        start_scheduler()
    else:
        run_crawl()


if __name__ == "__main__":
    main()
