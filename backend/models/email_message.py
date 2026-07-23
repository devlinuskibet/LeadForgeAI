from sqlalchemy import Column, String, ForeignKey, Text, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from models.base import Base
import enum

class EmailStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SCHEDULED = "SCHEDULED"
    SENT = "SENT"
    FAILED = "FAILED"

class EmailMessage(Base):
    __tablename__ = "email_messages"

    subject = Column(String, nullable=True)
    body = Column(Text, nullable=True)
    sender = Column(String, nullable=False)
    recipients = Column(ARRAY(String), nullable=False)
    status = Column(Enum(EmailStatus), default=EmailStatus.DRAFT, nullable=False)
    
    sent_at = Column(DateTime(timezone=True), nullable=True)
    thread_id = Column(String, nullable=True)
    provider_message_id = Column(String, nullable=True)
    
    # Polymorphic association
    entity_type = Column(String, index=True, nullable=False)
    entity_id = Column(UUID(as_uuid=True), index=True, nullable=False)
