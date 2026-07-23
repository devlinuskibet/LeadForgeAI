from sqlalchemy import Column, String, Float, ForeignKey, Enum
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
    status = Column(Enum(DealStatus), default=DealStatus.OPEN, nullable=False)
    opportunity_id = Column(ForeignKey("opportunities.id"), nullable=False)
    company_id = Column(ForeignKey("companies.id"), nullable=False)
