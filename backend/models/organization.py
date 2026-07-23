from sqlalchemy import Column, String
from models.base import Base

class Organization(Base):
    name = Column(String, index=True, nullable=False)
