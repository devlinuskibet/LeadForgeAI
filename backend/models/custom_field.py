from sqlalchemy import Column, String
from models.base import Base

class CustomField(Base):
    __tablename__ = "custom_fields"

    entity_type = Column(String, index=True, nullable=False) # e.g., 'company', 'contact'
    name = Column(String, nullable=False)
    field_type = Column(String, nullable=False) # e.g., 'string', 'number', 'date'
