from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.redis import cache_get, cache_set
from app.services.price_service import price_service
from app.schemas.price import (
    PriceTodayResponse,
    PriceHistoryResponse,
    ChangeRateResponse,
)
import json

router = APIRouter(prefix="/prices", tags=["prices"])


@router.get("/today", response_model=PriceTodayResponse)
def get_today(db: Session = Depends(get_db)):
    """오늘 금/은 시세 (최신 1건씩)."""
    cache_key = "api:prices:today"
    cached = cache_get(cache_key)
    if cached:
        data = json.loads(cached)
        return PriceTodayResponse(**data)
    raw = price_service.get_today(db)
    out = PriceTodayResponse(gold=raw.get("gold"), silver=raw.get("silver"))
    cache_set(cache_key, out.model_dump_json())
    return out


@router.get("/history", response_model=PriceHistoryResponse)
def get_history(
    metal: str = Query(..., pattern="^(gold|silver)$"),
    days: int = Query(30, ge=1, le=90),
    db: Session = Depends(get_db),
):
    """기간별 시세 (metal=gold|silver, days=7|30 등)."""
    items = price_service.get_history(db, metal=metal, days=days)
    return PriceHistoryResponse(metal=metal, items=items)


@router.get("/change-rate", response_model=ChangeRateResponse)
def get_change_rate(db: Session = Depends(get_db)):
    """전일 대비 변동률."""
    cache_key = "api:prices:change-rate"
    cached = cache_get(cache_key)
    if cached:
        data = json.loads(cached)
        return ChangeRateResponse(**data)
    raw = price_service.get_change_rate(db)
    out = ChangeRateResponse(gold=raw.get("gold"), silver=raw.get("silver"))
    cache_set(cache_key, out.model_dump_json())
    return out
