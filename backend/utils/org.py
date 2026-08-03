import uuid
from sqlalchemy.orm import Session
from models.organization import Organization

def get_default_org(db: Session) -> Organization:
    """
    Retrieves the primary organization or auto-creates a default one if database is fresh.
    """
    org = db.query(Organization).first()
    if not org:
        org = Organization(id=uuid.uuid4(), name="LeadForge Organization")
        db.add(org)
        db.commit()
        db.refresh(org)
    return org
