from sqlalchemy import Column, DateTime, Integer, String, func

from app.core.database import Base


class Metal(Base):
    __tablename__ = "metals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(32), nullable=False, unique=True)
    symbol = Column(String(8), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
