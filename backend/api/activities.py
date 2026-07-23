from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from models.activity import Activity
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import UUID

router = APIRouter(prefix="/activities", tags=["activities"])

class ActivityCreate(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    entity_type: str
    entity_id: UUID
    metadata_json: Optional[Dict[str, Any]] = None

class ActivityResponse(BaseModel):
    id: UUID
    type: str
    title: str
    description: Optional[str]
    entity_type: str
    entity_id: UUID

    class Config:
        from_attributes = True

@router.get("/entity/{entity_type}/{entity_id}", response_model=List[ActivityResponse])
def get_entity_activities(entity_type: str, entity_id: UUID, db: Session = Depends(get_db)):
    activities = db.query(Activity).filter(
        Activity.entity_type == entity_type,
        Activity.entity_id == entity_id,
        Activity.is_deleted == False
    ).order_by(Activity.created_at.desc()).all()
    return activities

@router.post("/", response_model=ActivityResponse)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    # Assuming organization_id is retrieved from context. Use dummy for now
    from models.organization import Organization
    from core.errors import AppException
    org = db.query(Organization).first()
    if not org:
        raise AppException("NO_ORG", "No organization found.", 404)

    new_act = Activity(
        organization_id=org.id,
        type=activity.type,
        title=activity.title,
        description=activity.description,
        entity_type=activity.entity_type,
        entity_id=activity.entity_id,
        metadata_json=activity.metadata_json
    )
    db.add(new_act)
    db.commit()
    db.refresh(new_act)
    return new_act
