from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID, JSONB
from models.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    entity_name = Column(String, index=True, nullable=False) # e.g., 'Company'
    entity_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    action = Column(String, index=True, nullable=False) # 'CREATE', 'UPDATE', 'DELETE'
    
    old_value = Column(JSONB, nullable=True)
    new_value = Column(JSONB, nullable=True)
