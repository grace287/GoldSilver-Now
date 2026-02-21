from sqlalchemy import Column, DateTime, ForeignKey, Index, Numeric, Integer, String, func

from app.core.database import Base


class Price(Base):
    __tablename__ = "prices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    metal_id = Column(Integer, ForeignKey("metals.id", ondelete="RESTRICT"), nullable=False)
    buy_price = Column(Numeric(12, 2), nullable=False)
    sell_price = Column(Numeric(12, 2), nullable=False)
    source = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_prices_metal_created", "metal_id", "created_at"),
    )
