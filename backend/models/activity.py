from sqlalchemy import Column, String, ForeignKey
from models.base import Base
from models.compat import UUIDType, JSONType


class Activity(Base):
    __tablename__ = "activities"

    type = Column(String, index=True, nullable=False)  # e.g., 'note', 'email', 'status_change', 'meeting'
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)

    # Polymorphic association to link to Company, Contact, Deal, etc.
    entity_type = Column(String, index=True, nullable=False)
    entity_id = Column(UUIDType, index=True, nullable=False)

    metadata_json = Column(JSONType, nullable=True)
