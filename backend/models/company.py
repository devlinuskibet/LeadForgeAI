from sqlalchemy import Column, String, Integer, Enum, ForeignKey, DateTime, Boolean, Float
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
    
    last_contact_date = Column(DateTime, nullable=True)
    next_action_due = Column(DateTime, nullable=True)
    
    # AI Readiness Columns
    last_ai_analysis = Column(DateTime(timezone=True), nullable=True)
    ai_score = Column(Integer, nullable=True)
    ai_summary = Column(String, nullable=True)
    needs_reanalysis = Column(Boolean, default=False)
    
    # Discovery & Enrichment Columns
    location = Column(String, nullable=True)
    address = Column(String, nullable=True)
    google_place_id = Column(String, nullable=True, unique=True, index=True)
    rating = Column(Float, nullable=True)
    review_count = Column(Integer, nullable=True)
    business_status = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    discovered_at = Column(DateTime(timezone=True), nullable=True)
    discovery_source = Column(String, nullable=True) # e.g., "Google Places", "Manual", "CSV Import"
