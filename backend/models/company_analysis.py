from sqlalchemy import Column, String, ForeignKey, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from models.base import CustomBase

class CompanyAnalysis(CustomBase):
    __tablename__ = "company_analyses"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True, unique=True)
    
    raw_scraped_text = Column(String, nullable=True)
    inferred_problems = Column(JSONB, nullable=True) # [{"problem": "No mobile app", "severity": "High"}]
    recommended_solutions = Column(JSONB, nullable=True) # [{"solution": "Build React Native App", "confidence": "High", "business_impact": "...", "estimated_value": 3000}]
    status = Column(String, nullable=False, default="pending") # "pending", "completed", "failed"
    
    opportunity_score = Column(Integer, nullable=True) # 0 - 100
    estimated_value = Column(Integer, nullable=True) # Total estimated value
    website_hash = Column(String, nullable=True)
    last_analysis_date = Column(DateTime, nullable=True)
    
    priority_score = Column(Integer, nullable=True) # Opportunity * Value * Urgency
    sales_coach_advice = Column(String, nullable=True)
    why_today = Column(String, nullable=True)

    company = relationship("Company")
