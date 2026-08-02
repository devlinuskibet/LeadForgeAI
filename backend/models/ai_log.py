from sqlalchemy import Column, String, ForeignKey, Integer, Float
from sqlalchemy.orm import relationship
from models.base import Base
from models.compat import UUIDType


class AIRequest(Base):
    __tablename__ = "ai_requests"

    prompt_version_id = Column(UUIDType, ForeignKey("ai_prompt_versions.id"), nullable=True)

    rendered_prompt = Column(String, nullable=False)
    raw_response = Column(String, nullable=True)

    provider = Column(String, nullable=False)  # e.g. "mimo", "mock", "openai"
    model = Column(String, nullable=False)

    latency_ms = Column(Integer, nullable=True)
    status = Column(String, nullable=False)  # e.g. "SUCCESS", "FAILED"

    usage = relationship("AIUsage", back_populates="request", uselist=False, cascade="all, delete-orphan")


class AIUsage(Base):
    __tablename__ = "ai_usages"

    request_id = Column(UUIDType, ForeignKey("ai_requests.id"), nullable=False, unique=True, index=True)

    input_tokens = Column(Integer, nullable=False, default=0)
    output_tokens = Column(Integer, nullable=False, default=0)
    total_tokens = Column(Integer, nullable=False, default=0)

    estimated_cost = Column(Float, nullable=False, default=0.0)

    request = relationship("AIRequest", back_populates="usage")
