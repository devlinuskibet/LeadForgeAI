from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from models.contact import Contact
from models.organization import Organization
from core.errors import AppException
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

router = APIRouter(prefix="/contacts", tags=["contacts"])

class ContactCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    company_id: UUID

class ContactResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: Optional[str]
    phone: Optional[str]
    role: Optional[str]
    company_id: UUID

    class Config:
        from_attributes = True

class BulkContactCreateResponse(BaseModel):
    imported_count: int
    contacts: List[ContactResponse]

@router.get("/", response_model=List[ContactResponse])
def get_contacts(db: Session = Depends(get_db)):
    contacts = db.query(Contact).filter(Contact.is_deleted == False).all()
    return contacts

@router.post("/", response_model=ContactResponse)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    org = db.query(Organization).first()
    if not org:
        raise AppException("NO_ORG", "No organization found. Please run seed script.")

    new_contact = Contact(
        organization_id=org.id,
        first_name=contact.first_name,
        last_name=contact.last_name,
        email=contact.email,
        phone=contact.phone,
        role=contact.role,
        company_id=contact.company_id
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact

@router.post("/batch", response_model=BulkContactCreateResponse)
def bulk_create_contacts(contacts_list: List[ContactCreate], db: Session = Depends(get_db)):
    """
    Bulk import multiple contact records in a single transactional batch.
    """
    if not contacts_list:
        return BulkContactCreateResponse(imported_count=0, contacts=[])

    org = db.query(Organization).first()
    if not org:
        raise AppException("NO_ORG", "No organization found. Please run seed script.")

    created_contacts = []
    for c in contacts_list:
        contact_obj = Contact(
            organization_id=org.id,
            first_name=c.first_name,
            last_name=c.last_name,
            email=c.email,
            phone=c.phone,
            role=c.role,
            company_id=c.company_id
        )
        db.add(contact_obj)
        created_contacts.append(contact_obj)

    db.commit()
    for contact_obj in created_contacts:
        db.refresh(contact_obj)

    return BulkContactCreateResponse(
        imported_count=len(created_contacts),
        contacts=created_contacts
    )
