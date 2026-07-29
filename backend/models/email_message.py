from sqlalchemy import Column, String, ForeignKey, Text, DateTime, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from models.base import Base
import enum

class EmailStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    QUEUED = "QUEUED"
    SENDING = "SENDING"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    OPENED = "OPENED"
    REPLIED = "REPLIED"
    FAILED = "FAILED"
    BOUNCED = "BOUNCED"

class EmailMessage(Base):
    __tablename__ = "email_messages"

    subject = Column(String, nullable=True)
    body = Column(Text, nullable=True)
    
    # Store original AI generation
    original_ai_subject = Column(String, nullable=True)
    original_ai_body = Column(Text, nullable=True)
    
    sender = Column(String, nullable=False)
    recipients = Column(ARRAY(String), nullable=False)
    status = Column(Enum(EmailStatus), default=EmailStatus.DRAFT, nullable=False)
    
    # Provider metadata
    provider_name = Column(String, nullable=True)
    provider_message_id = Column(String, nullable=True)
    provider_response = Column(JSON, nullable=True)
    
    # Future-proofing for attachments (e.g., proposal PDFs)
    attachments = Column(JSON, nullable=True) # Array of attachment metadata dicts
    
    sent_by_user_id = Column(UUID(as_uuid=True), nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    opened_at = Column(DateTime(timezone=True), nullable=True)
    replied_at = Column(DateTime(timezone=True), nullable=True)
    thread_id = Column(String, nullable=True)
    
    # Polymorphic association
    entity_type = Column(String, index=True, nullable=False)
    entity_id = Column(UUID(as_uuid=True), index=True, nullable=False)
