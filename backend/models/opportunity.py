from sqlalchemy import Column, String, Float, ForeignKey, Enum
from models.base import Base
import enum

class OpportunityStatus(str, enum.Enum):
    OPEN = "OPEN"
    WON = "WON"
    LOST = "LOST"

class Opportunity(Base):
    __tablename__ = "opportunities"

    name = Column(String, nullable=False)
    estimated_value = Column(Float, nullable=True)
    status = Column(Enum(OpportunityStatus), default=OpportunityStatus.OPEN, nullable=False)
    company_id = Column(ForeignKey("companies.id"), nullable=False)
