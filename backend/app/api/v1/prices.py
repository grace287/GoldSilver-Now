import json

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.core.database import get_db
from app.core.redis import cache_get, cache_set
from app.services.price_service import price_service
from app.schemas.price import (
    PriceTodayResponse,
    PriceHistoryResponse,
    ChangeRateResponse,
)

router = APIRouter(prefix="/prices", tags=["prices"])

# 크롤링 반영을 위해 today/change-rate는 짧은 TTL 사용
CACHE_TTL_TODAY = getattr(settings, "cache_ttl_today_seconds", 60)

# 클라이언트/프록시 캐시 방지 (항상 최신 조회)
NO_CACHE_HEADERS = {"Cache-Control": "max-age=0, no-store"}


@router.get("/today", response_model=PriceTodayResponse)
def get_today(db: Session = Depends(get_db)):
    """오늘 금/은 시세 (최신 1건씩)."""
    cache_key = "api:prices:today"
    cached = cache_get(cache_key)
    if cached:
        data = json.loads(cached)
        return JSONResponse(
            content=data,
            headers=NO_CACHE_HEADERS,
        )
    raw = price_service.get_today(db)
    out = PriceTodayResponse(gold=raw.get("gold"), silver=raw.get("silver"))
    if out.gold is not None or out.silver is not None:
        cache_set(cache_key, out.model_dump_json(), ttl_seconds=CACHE_TTL_TODAY)
    return JSONResponse(
        content=out.model_dump(mode="json"),
        headers=NO_CACHE_HEADERS,
    )


@router.get("/history", response_model=PriceHistoryResponse)
def get_history(
    metal: str = Query(..., pattern="^(gold|silver)$"),
    days: int = Query(30, ge=1, le=1825),
    db: Session = Depends(get_db),
):
    """기간별 시세 (metal=gold|silver, days=7~1825, 최대 5년)."""
    items = price_service.get_history(db, metal=metal, days=days)
    out = PriceHistoryResponse(metal=metal, items=items)
    return JSONResponse(
        content=out.model_dump(mode="json"),
        headers=NO_CACHE_HEADERS,
    )


@router.get("/change-rate", response_model=ChangeRateResponse)
def get_change_rate(db: Session = Depends(get_db)):
    """전일 대비 변동률."""
    cache_key = "api:prices:change-rate"
    cached = cache_get(cache_key)
    if cached:
        data = json.loads(cached)
        return JSONResponse(content=data, headers=NO_CACHE_HEADERS)
    raw = price_service.get_change_rate(db)
    out = ChangeRateResponse(gold=raw.get("gold"), silver=raw.get("silver"))
    if out.gold is not None or out.silver is not None:
        cache_set(cache_key, out.model_dump_json(), ttl_seconds=CACHE_TTL_TODAY)
    return JSONResponse(
        content=out.model_dump(mode="json"),
        headers=NO_CACHE_HEADERS,
    )
