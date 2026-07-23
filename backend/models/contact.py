from sqlalchemy import Column, String, ForeignKey
from models.base import Base

class Contact(Base):
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    role = Column(String, nullable=True) # e.g. Decision Maker, Influencer
    company_id = Column(ForeignKey("companies.id"), nullable=False)
