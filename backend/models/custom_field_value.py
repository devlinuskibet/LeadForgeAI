from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from models.base import Base

class CustomFieldValue(Base):
    __tablename__ = "custom_field_values"

    custom_field_id = Column(ForeignKey("custom_fields.id"), nullable=False)
    entity_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    value = Column(String, nullable=True)
