from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.sql import func
from models.base import Base
from models.compat import JSONType


class Analytics(Base):
    event_name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    value_int = Column(Integer, nullable=True)
    value_float = Column(Float, nullable=True)
    metadata_json = Column(JSONType, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
