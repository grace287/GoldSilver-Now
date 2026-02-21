from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict


class PriceTodayItem(BaseModel):
    metal: Literal["gold", "silver"]
    buy_price: int
    sell_price: int
    updated_at: datetime


class PriceTodayResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    gold: PriceTodayItem | None = None
    silver: PriceTodayItem | None = None


class PriceHistoryItem(BaseModel):
    date: str
    buy_price: Decimal
    sell_price: Decimal


class PriceHistoryResponse(BaseModel):
    metal: Literal["gold", "silver"]
    items: list[PriceHistoryItem]


class ChangeRateItem(BaseModel):
    metal: Literal["gold", "silver"]
    buy_change_percent: float
    sell_change_percent: float
    prev_buy: Decimal
    prev_sell: Decimal
    current_buy: Decimal
    current_sell: Decimal


class ChangeRateResponse(BaseModel):
    gold: ChangeRateItem | None = None
    silver: ChangeRateItem | None = None
