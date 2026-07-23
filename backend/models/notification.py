from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from models.base import Base

class Notification(Base):
    __tablename__ = "notifications"

    user_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    type = Column(String, nullable=False) # e.g., 'system', 'activity', 'alert'
    title = Column(String, nullable=False)
    body = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    
    # Optional link to entity
    entity_type = Column(String, nullable=True)
    entity_id = Column(UUID(as_uuid=True), nullable=True)
