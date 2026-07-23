from sqlalchemy import Column, String, Boolean
from models.base import Base

class FeatureFlag(Base):
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    is_enabled = Column(Boolean, default=False)
