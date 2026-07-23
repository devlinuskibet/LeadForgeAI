from pydantic import BaseModel, EmailStr
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    organization_id: UUID
    full_name: str | None = None

class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    organization_id: UUID
    full_name: str | None = None
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
