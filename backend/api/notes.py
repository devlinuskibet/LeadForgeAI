from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from models.note import Note
from core.errors import AppException
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

router = APIRouter(prefix="/notes", tags=["notes"])

class NoteCreate(BaseModel):
    content: str
    entity_type: str
    entity_id: UUID

class NoteResponse(BaseModel):
    id: UUID
    content: str
    entity_type: str
    entity_id: UUID

    class Config:
        from_attributes = True

@router.get("/entity/{entity_type}/{entity_id}", response_model=List[NoteResponse])
def get_entity_notes(entity_type: str, entity_id: UUID, db: Session = Depends(get_db)):
    notes = db.query(Note).filter(
        Note.entity_type == entity_type,
        Note.entity_id == entity_id,
        Note.is_deleted == False
    ).order_by(Note.created_at.desc()).all()
    return notes

@router.post("/", response_model=NoteResponse)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    from models.organization import Organization
    org = db.query(Organization).first()
    if not org:
        raise AppException("NO_ORG", "No organization found.", 404)

    new_note = Note(
        organization_id=org.id,
        content=note.content,
        entity_type=note.entity_type,
        entity_id=note.entity_id
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    
    # Optional: Publish event to EventBus so an Activity is created automatically
    from core.events import event_bus
    event_bus.publish("note.created", note=new_note)
    
    return new_note
