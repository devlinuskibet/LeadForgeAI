from sqlalchemy import Column, String, ForeignKey, Table
from models.base import Base
from models.compat import UUIDType


class Tag(Base):
    __tablename__ = "tags"

    name = Column(String, index=True, nullable=False)
    color = Column(String, nullable=True)  # Hex code


# Association table for polymorphic tagging (e.g. tagging a Company, Contact, etc.)
class EntityTag(Base):
    __tablename__ = "entity_tags"

    tag_id = Column(ForeignKey("tags.id"), nullable=False)
    entity_type = Column(String, index=True, nullable=False)
    entity_id = Column(UUIDType, index=True, nullable=False)
