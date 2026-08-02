from sqlalchemy import Column, String, ForeignKey, Text
from models.base import Base
from models.compat import UUIDType


class Note(Base):
    __tablename__ = "notes"

    content = Column(Text, nullable=False)

    # Polymorphic association
    entity_type = Column(String, index=True, nullable=False)
    entity_id = Column(UUIDType, index=True, nullable=False)
