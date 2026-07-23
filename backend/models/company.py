from sqlalchemy import Column, String, Integer, Enum, ForeignKey, DateTime, Boolean
from models.base import Base
import enum

class CompanyStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    ARCHIVED = "ARCHIVED"

class Company(Base):
    __tablename__ = "companies"

    name = Column(String, index=True, nullable=False)
    website = Column(String, nullable=True)
    status = Column(Enum(CompanyStatus), default=CompanyStatus.ACTIVE, nullable=False)
    pipeline_stage_id = Column(ForeignKey("pipeline_stages.id"), nullable=True)
    
    # AI Readiness Columns
    last_ai_analysis = Column(DateTime(timezone=True), nullable=True)
    ai_score = Column(Integer, nullable=True)
    ai_summary = Column(String, nullable=True)
    needs_reanalysis = Column(Boolean, default=False)
