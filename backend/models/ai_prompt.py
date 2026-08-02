from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, Float
from sqlalchemy.orm import relationship
from models.base import Base
from models.compat import UUIDType, JSONType


class AIPrompt(Base):
    __tablename__ = "ai_prompts"

    name = Column(String, index=True, nullable=False, unique=True)
    description = Column(String, nullable=True)
    feature = Column(String, index=True, nullable=False)  # e.g. "email_outreach", "website_analysis"

    versions = relationship("AIPromptVersion", back_populates="prompt", cascade="all, delete-orphan")


class AIPromptVersion(Base):
    __tablename__ = "ai_prompt_versions"

    prompt_id = Column(UUIDType, ForeignKey("ai_prompts.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)

    template = Column(String, nullable=False)  # The actual prompt text with {{ variables }}
    variables = Column(JSONType, nullable=True)  # List of expected variable names e.g. ["company_name", "context"]

    model = Column(String, nullable=False, default="default-model")
    temperature = Column(Float, nullable=False, default=0.7)
    max_tokens = Column(Integer, nullable=False, default=1000)

    is_active = Column(Boolean, default=False, nullable=False)

    prompt = relationship("AIPrompt", back_populates="versions")
