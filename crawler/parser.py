"""
파서: HTML → PriceRecord 후보.
사이트 구조에 따라 이 모듈만 수정한다.
실제 URL/셀렉터 확정 전까지는 mock 데이터 반환 가능.
"""
import logging
from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime, timezone
from typing import List, Optional

from bs4 import BeautifulSoup

from crawler.config import settings

logger = logging.getLogger(__name__)


@dataclass
class PriceRecord:
    metal_id: int
    buy_price: Decimal
    sell_price: Decimal
    source: str
    crawled_at: datetime


def parse_gold(html: Optional[str], url: str) -> List[PriceRecord]:
    """
    금 시세 페이지 HTML 파싱.
    URL/HTML 구조 확정 후 셀렉터 채우기. 현재는 mock 반환.
    """
    if not html or not url:
        return _mock_gold()
    try:
        soup = BeautifulSoup(html, "lxml")
        # TODO: 실제 사이트 셀렉터 예시:
        # buy_el = soup.select_one(".buy-price")
        # sell_el = soup.select_one(".sell-price")
        # if buy_el and sell_el: return [PriceRecord(1, Decimal(buy_el.get_text().replace(",","")), ...)]
        return _mock_gold()
    except Exception as e:
        logger.warning("Parse gold failed: %s", e)
        return _mock_gold()


def parse_silver(html: Optional[str], url: str) -> List[PriceRecord]:
    """은 시세 페이지 파싱. 현재 mock."""
    if not html or not url:
        return _mock_silver()
    try:
        soup = BeautifulSoup(html, "lxml")
        # TODO: 실제 셀렉터
        return _mock_silver()
    except Exception as e:
        logger.warning("Parse silver failed: %s", e)
        return _mock_silver()


def _mock_gold() -> List[PriceRecord]:
    """개발/테스트용 금 mock (1돈 기준 대략적 원화)."""
    now = datetime.now(timezone.utc)
    return [
        PriceRecord(
            metal_id=1,
            buy_price=Decimal("385000"),
            sell_price=Decimal("378000"),
            source="mock",
            crawled_at=now,
        )
    ]


def _mock_silver() -> List[PriceRecord]:
    """개발/테스트용 은 mock (1g 기준)."""
    now = datetime.now(timezone.utc)
    return [
        PriceRecord(
            metal_id=2,
            buy_price=Decimal("4250"),
            sell_price=Decimal("4250"),
            source="mock",
            crawled_at=now,
        )
    ]
