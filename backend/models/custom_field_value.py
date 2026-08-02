from sqlalchemy import Column, String, ForeignKey
from models.base import Base
from models.compat import UUIDType


class CustomFieldValue(Base):
    __tablename__ = "custom_field_values"

    custom_field_id = Column(ForeignKey("custom_fields.id"), nullable=False)
    entity_id = Column(UUIDType, index=True, nullable=False)
    value = Column(String, nullable=True)
