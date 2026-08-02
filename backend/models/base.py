import uuid
from sqlalchemy import Column, DateTime, String, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base, declared_attr
from models.compat import UUIDType


class CustomBase:
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower() + "s"
    
    id = Column(UUIDType, primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUIDType, nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(UUIDType, nullable=True)
    updated_by = Column(UUIDType, nullable=True)
    
    # Soft delete fields
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

Base = declarative_base(cls=CustomBase)
