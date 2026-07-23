from sqlalchemy import Column, String, Boolean, Enum
from models.base import Base
import enum

class UserRole(str, enum.Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    SALES = "SALES"
    MANAGER = "MANAGER"
    VIEWER = "VIEWER"

class User(Base):
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    full_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.VIEWER, nullable=False)
