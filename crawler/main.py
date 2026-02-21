"""
진입점: 1회 크롤링 또는 스케줄러 실행.
사용법 (프로젝트 루트에서):
  python -m crawler.main           → 1회 수집 후 종료
  python -m crawler.main --schedule → 주기 수집 (APScheduler)
crawler 폴더에서 실행할 때: python main.py (상위 경로 자동 추가)
"""
import argparse
import logging
import os
import sys

# crawler/ 폴더에서 python main.py 로 실행해도 패키지 인식되도록
if __name__ == "__main__" and __package__ is None:
    _root = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
    if _root not in sys.path:
        sys.path.insert(0, _root)
    __package__ = "crawler"

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
