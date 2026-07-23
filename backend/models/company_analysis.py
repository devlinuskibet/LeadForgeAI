from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from models.base import CustomBase

class CompanyAnalysis(CustomBase):
    __tablename__ = "company_analyses"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True, unique=True)
    
    raw_scraped_text = Column(String, nullable=True)
    inferred_problems = Column(JSONB, nullable=True) # [{"problem": "No mobile app", "severity": "High"}]
    recommended_solutions = Column(JSONB, nullable=True) # [{"solution": "Build React Native App", "confidence": "High"}]
    status = Column(String, nullable=False, default="pending") # "pending", "completed", "failed"

    company = relationship("Company")
