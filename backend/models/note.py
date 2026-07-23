from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from models.base import Base

class Note(Base):
    __tablename__ = "notes"

    content = Column(Text, nullable=False)
    
    # Polymorphic association
    entity_type = Column(String, index=True, nullable=False)
    entity_id = Column(UUID(as_uuid=True), index=True, nullable=False)
