from sqlalchemy import Column, String, Integer
from models.base import Base

class PipelineStage(Base):
    __tablename__ = "pipeline_stages"
    name = Column(String, index=True, nullable=False)
    order_index = Column(Integer, default=0)
