from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
import uuid
import json

from core.database import get_db
from models.user import User
from models.organization import Organization
from models.orchestration_job import OrchestrationJob
from models.company import Company
from models.company_analysis import CompanyAnalysis
from workers.tasks import run_discovery_task

router = APIRouter(prefix="/discovery", tags=["discovery"])

class DiscoveryRequest(BaseModel):
    business_type: str
    location: str
    max_results: int = 10
    min_rating: float = 0.0
    has_website: bool = False

@router.post("/start")
def start_discovery(request: DiscoveryRequest, db: Session = Depends(get_db)):
    """
    Kicks off an autonomous discovery agent using structured search.
    """
    org = db.query(Organization).first()
    
    # Create the top-level orchestration job for tracking
    job = OrchestrationJob(
        id=uuid.uuid4(),
        organization_id=org.id,
        entity_type="discovery",
        entity_id=uuid.uuid4(), # Dummy UUID for discovery
        workflow_type="discovery",
        status="pending",
        error_message=json.dumps(request.dict()) # Store structured query as JSON string temporarily
    )
    db.add(job)
    db.commit()
    
    # Try to launch via Celery, fallback to direct execution if Celery worker is offline
    try:
        run_discovery_task.delay(str(job.id))
    except Exception:
        from services.supervisor_service import SupervisorService
        supervisor = SupervisorService(db)
        supervisor.run_discovery(str(job.id))
    
    return {"message": "Discovery agent launched", "job_id": str(job.id)}

@router.get("/job/{job_id}")
def get_discovery_job(job_id: str, db: Session = Depends(get_db)):
    org = db.query(Organization).first()
    job = db.query(OrchestrationJob).filter(
        OrchestrationJob.id == job_id,
        OrchestrationJob.organization_id == org.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return {
        "id": str(job.id),
        "status": job.status,
        "current_step": job.current_step,
        "logs": job.logs
    }

@router.get("/job/{job_id}/summary")
def get_discovery_summary(job_id: str, db: Session = Depends(get_db)):
    org = db.query(Organization).first()
    job = db.query(OrchestrationJob).filter(
        OrchestrationJob.id == job_id,
        OrchestrationJob.organization_id == org.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # Aggregate stats from all child analysis jobs
    child_jobs = db.query(OrchestrationJob).filter(
        OrchestrationJob.parent_job_id == job.id
    ).all()
    
    company_ids = [j.entity_id for j in child_jobs if j.entity_type == "company"]
    
    businesses_found = len(company_ids)
    
    companies = db.query(Company).filter(Company.id.in_(company_ids)).all() if company_ids else []
    websites_found = sum(1 for c in companies if c.website)
    
    analyses = db.query(CompanyAnalysis).filter(CompanyAnalysis.company_id.in_(company_ids)).all() if company_ids else []
    
    high_opp = sum(1 for a in analyses if a.opportunity_score and a.opportunity_score >= 80)
    medium_opp = sum(1 for a in analyses if a.opportunity_score and 50 <= a.opportunity_score < 80)
    low_opp = sum(1 for a in analyses if a.opportunity_score and a.opportunity_score < 50)
    
    potential_revenue = sum(a.estimated_value or 0 for a in analyses)
    avg_opp_score = sum(a.opportunity_score or 0 for a in analyses) / len(analyses) if analyses else 0
    avg_deal_size = potential_revenue / len(analyses) if analyses else 0
    
    ready_for_outreach = sum(1 for c in companies if c.status == "ACTIVE") # Assuming "ACTIVE" means drafted
    
    return {
        "businesses_found": businesses_found,
        "websites_found": websites_found,
        "high_opportunity": high_opp,
        "medium_opportunity": medium_opp,
        "low_opportunity": low_opp,
        "potential_revenue": potential_revenue,
        "average_opportunity_score": round(avg_opp_score),
        "average_deal_size": round(avg_deal_size),
        "ready_for_outreach": ready_for_outreach,
        "estimated_outreach_time_mins": businesses_found * 0.3 # Roughly 20 seconds per email to review
    }

@router.get("/stats")
def get_discovery_stats():
    import redis
    try:
        r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
        requests = int(r.get("discovery_stats:requests_made") or 0)
        hits = int(r.get("discovery_stats:cache_hits") or 0)
        misses = int(r.get("discovery_stats:cache_misses") or 0)
        total_time = float(r.get("discovery_stats:total_time") or 0)
        
        avg_time = round(total_time / requests, 2) if requests > 0 else 0
        
        return {
            "requests_made": requests,
            "cache_hits": hits,
            "cache_misses": misses,
            "average_time_seconds": avg_time
        }
    except Exception as e:
        return {
            "requests_made": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "average_time_seconds": 0
        }
