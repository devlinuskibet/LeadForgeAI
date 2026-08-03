import uuid
from sqlalchemy.orm import Session
from models.organization import Organization

def get_default_org(db: Session) -> Organization:
    """
    Retrieves the primary organization or auto-creates a default one if database is fresh.
    Ensures organization_id is populated with its own ID to satisfy Base NOT NULL constraints.
    """
    org = db.query(Organization).first()
    if not org:
        org_id = uuid.uuid4()
        org = Organization(id=org_id, organization_id=org_id, name="LeadForge Organization")
        db.add(org)
        db.commit()
        db.refresh(org)
    return org
