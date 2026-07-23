from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.company import Company
from models.organization import Organization
from models.orchestration_job import OrchestrationJob
from workers.tasks import run_auto_prospect_task
from pydantic import BaseModel
from typing import List
import uuid

router = APIRouter(prefix="/prospecting", tags=["prospecting"])

class BulkImportItem(BaseModel):
    name: str
    website: str

@router.post("/bulk-import")
def bulk_import_prospects(items: List[BulkImportItem], db: Session = Depends(get_db)):
    org = db.query(Organization).first()
    if not org:
        raise HTTPException(status_code=400, detail="No organization found.")

    created_companies = []
    for item in items:
        company_id = uuid.uuid4()
        company = Company(
            id=company_id,
            organization_id=org.id,
            name=item.name,
            website=item.website,
            status="ACTIVE",
            industry="Unknown",
            description="",
            pipeline_stage_id=None # We will let auto-prospect push it forward
        )
        db.add(company)
        db.flush() # flush to get the company in session
        
        job_id = uuid.uuid4()
        job = OrchestrationJob(
            id=job_id,
            organization_id=org.id,
            entity_type="company",
            entity_id=company.id,
            workflow_type="auto_prospect",
            status="pending"
        )
        db.add(job)
        db.flush()

        # Trigger Celery Task
        run_auto_prospect_task.delay(str(job_id))
        
        created_companies.append({"company_id": str(company.id), "job_id": str(job_id)})

    db.commit()

    return {
        "success": True,
        "message": f"Successfully imported {len(items)} prospects and started analysis.",
        "jobs": created_companies
    }
