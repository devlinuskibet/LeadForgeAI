from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from models.base import Base

class OrchestrationJob(Base):
    __tablename__ = "orchestration_jobs"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    entity_type = Column(String, nullable=False) # e.g., "company"
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    parent_job_id = Column(UUID(as_uuid=True), ForeignKey("orchestration_jobs.id"), nullable=True)
    
    workflow_type = Column(String, nullable=False) # e.g., "auto_prospect"
    status = Column(String, nullable=False, default="pending") # "pending", "in_progress", "completed", "failed"
    current_step = Column(String, nullable=True) # "analyzing", "drafting", "done"
    error_message = Column(String, nullable=True)
    logs = Column(JSONB, nullable=True, default=[]) # Array of strings or objects describing steps
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
