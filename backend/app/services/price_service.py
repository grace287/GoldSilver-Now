from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Literal

from sqlalchemy import select, and_, func
from sqlalchemy.orm import Session

from app.models import Metal, Price
from app.schemas.price import (
    PriceTodayItem,
    PriceHistoryItem,
    ChangeRateItem,
)


class PriceService:
    """Today, history, change-rate for prices."""

    def get_today(self, db: Session) -> dict:
        """오늘 기준 최신 시세 (금/은 각 1건)."""
        result = {"gold": None, "silver": None}
        for name in ("gold", "silver"):
            row = (
                db.query(Price)
                .join(Metal, Price.metal_id == Metal.id)
                .where(Metal.name == name)
                .order_by(Price.created_at.desc())
                .limit(1)
                .first()
            )
            if row:
                result[name] = PriceTodayItem(
                    metal=name,
                    buy_price=int(row.buy_price),
                    sell_price=int(row.sell_price),
                    updated_at=row.created_at,
                )
        return result

    def get_history(
        self,
        db: Session,
        metal: Literal["gold", "silver"],
        days: int = 30,
    ) -> list[PriceHistoryItem]:
        """기간별 시세 (일별 1개 샘플: 해당 일 마지막 기록)."""
        since = date.today() - timedelta(days=days)
        subq = (
            db.query(
                Price.metal_id,
                func.date(Price.created_at).label("d"),
                func.max(Price.id).label("max_id"),
            )
            .join(Metal, Price.metal_id == Metal.id)
            .where(and_(Metal.name == metal, func.date(Price.created_at) >= since))
            .group_by(Price.metal_id, func.date(Price.created_at))
            .subquery()
        )
        rows = (
            db.query(Price)
            .join(subq, and_(Price.metal_id == subq.c.metal_id, Price.id == subq.c.max_id))
            .order_by(Price.created_at.asc())
            .all()
        )
        return [
            PriceHistoryItem(
                date=r.created_at.date().isoformat(),
                buy_price=r.buy_price,
                sell_price=r.sell_price,
            )
            for r in rows
        ]

    def get_change_rate(self, db: Session) -> dict:
        """전일 대비 변동률 (금/은)."""
        result = {"gold": None, "silver": None}
        for name in ("gold", "silver"):
            metal_row = db.query(Metal).where(Metal.name == name).first()
            if not metal_row:
                continue
            # 오늘 최신
            today_row = (
                db.query(Price)
                .where(Price.metal_id == metal_row.id)
                .order_by(Price.created_at.desc())
                .limit(1)
                .first()
            )
            if not today_row:
                continue
            # 전일 마지막
            yesterday = date.today() - timedelta(days=1)
            prev_row = (
                db.query(Price)
                .where(
                    and_(
                        Price.metal_id == metal_row.id,
                        func.date(Price.created_at) == yesterday,
                    )
                )
                .order_by(Price.created_at.desc())
                .limit(1)
                .first()
            )
            if not prev_row:
                result[name] = ChangeRateItem(
                    metal=name,
                    buy_change_percent=0.0,
                    sell_change_percent=0.0,
                    prev_buy=today_row.buy_price,
                    prev_sell=today_row.sell_price,
                    current_buy=today_row.buy_price,
                    current_sell=today_row.sell_price,
                )
                continue
            buy_pct = (
                float((today_row.buy_price - prev_row.buy_price) / prev_row.buy_price * 100)
                if prev_row.buy_price
                else 0.0
            )
            sell_pct = (
                float((today_row.sell_price - prev_row.sell_price) / prev_row.sell_price * 100)
                if prev_row.sell_price
                else 0.0
            )
            result[name] = ChangeRateItem(
                metal=name,
                buy_change_percent=round(buy_pct, 2),
                sell_change_percent=round(sell_pct, 2),
                prev_buy=prev_row.buy_price,
                prev_sell=prev_row.sell_price,
                current_buy=today_row.buy_price,
                current_sell=today_row.sell_price,
            )
        return result


price_service = PriceService()
