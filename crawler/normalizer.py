from decimal import Decimal
from typing import List

from crawler.parser import PriceRecord


def normalize(records: List[PriceRecord]) -> List[PriceRecord]:
    """
    단위/소수 통일. 현재는 소수 2자리로 반올림만 적용.
    원/kg 등 → 원/1돈 변환은 사이트 단위에 따라 추가.
    """
    out = []
    for r in records:
        out.append(
            PriceRecord(
                metal_id=r.metal_id,
                buy_price=round(r.buy_price, 2),
                sell_price=round(r.sell_price, 2),
                source=r.source,
                crawled_at=r.crawled_at,
            )
        )
    return out
