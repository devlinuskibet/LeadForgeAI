from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum
from models.base import Base
import enum

class DealStatus(str, enum.Enum):
    OPEN = "OPEN"
    WON = "WON"
    LOST = "LOST"

class Deal(Base):
    __tablename__ = "deals"

    name = Column(String, nullable=False)
    amount = Column(Float, nullable=True)
    probability = Column(Float, default=75.0, nullable=True)
    target_close_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(DealStatus), default=DealStatus.OPEN, nullable=False)
    opportunity_id = Column(ForeignKey("opportunities.id"), nullable=False)
    company_id = Column(ForeignKey("companies.id"), nullable=False)
