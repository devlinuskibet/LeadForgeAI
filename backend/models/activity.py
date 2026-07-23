from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from models.base import Base

class Activity(Base):
    __tablename__ = "activities"

    type = Column(String, index=True, nullable=False) # e.g., 'note', 'email', 'status_change', 'meeting'
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    # Polymorphic association to link to Company, Contact, Deal, etc.
    entity_type = Column(String, index=True, nullable=False)
    entity_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    
    metadata_json = Column(JSONB, nullable=True)
