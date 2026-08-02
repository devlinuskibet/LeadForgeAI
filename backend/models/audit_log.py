from sqlalchemy import Column, String
from models.base import Base
from models.compat import UUIDType, JSONType


class AuditLog(Base):
    __tablename__ = "audit_logs"

    entity_name = Column(String, index=True, nullable=False)  # e.g., 'Company'
    entity_id = Column(UUIDType, index=True, nullable=False)
    action = Column(String, index=True, nullable=False)  # 'CREATE', 'UPDATE', 'DELETE'

    old_value = Column(JSONType, nullable=True)
    new_value = Column(JSONType, nullable=True)
