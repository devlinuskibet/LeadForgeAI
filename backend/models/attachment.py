from sqlalchemy import Column, String, Integer
from models.base import Base
from models.compat import UUIDType


class Attachment(Base):
    __tablename__ = "attachments"

    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    content_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)  # in bytes

    # Polymorphic association
    entity_type = Column(String, index=True, nullable=False)
    entity_id = Column(UUIDType, index=True, nullable=False)
