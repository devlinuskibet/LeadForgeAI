from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
import uuid
import json

from core.database import get_db, SessionLocal
from models.user import User
from models.organization import Organization
from models.orchestration_job import OrchestrationJob
from models.company import Company
from models.company_analysis import CompanyAnalysis
from utils.org import get_default_org

router = APIRouter(prefix="/discovery", tags=["discovery"])

class DiscoveryRequest(BaseModel):
    business_type: str
    location: str
    max_results: int = 10
    min_rating: float = 0.0
    has_website: bool = False

def run_discovery_in_background(job_id_str: str):
    """
    Background worker function for discovery search execution.
    """
    bg_db = SessionLocal()
    try:
        from services.supervisor_service import SupervisorService
        supervisor = SupervisorService(bg_db)
        supervisor.run_discovery(job_id_str)
    except Exception as err:
        print(f"Background discovery execution note: {err}")
    finally:
        bg_db.close()

@router.post("/start")
def start_discovery(request: DiscoveryRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Kicks off an autonomous discovery agent using structured search asynchronously.
    """
    org = get_default_org(db)
    
    # Create the top-level orchestration job for tracking
    job = OrchestrationJob(
        id=uuid.uuid4(),
        organization_id=org.id,
        entity_type="discovery",
        entity_id=uuid.uuid4(), # Dummy UUID for discovery
        workflow_type="discovery",
        status="pending",
        error_message=json.dumps(request.model_dump() if hasattr(request, "model_dump") else request.dict()) # Store structured query as JSON string
    )
    db.add(job)
    db.commit()
    
    # Schedule background execution so HTTP POST returns immediately with HTTP 200 OK
    background_tasks.add_task(run_discovery_in_background, str(job.id))
    
    return {"message": "Discovery agent launched", "job_id": str(job.id)}

@router.get("/job/{job_id}")
def get_discovery_job(job_id: str, db: Session = Depends(get_db)):
    org = get_default_org(db)
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
    org = get_default_org(db)
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
    from services.discovery_service import MEM_DISCOVERY_STATS
    try:
        r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True, socket_connect_timeout=0.5)
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
    except Exception:
        req = MEM_DISCOVERY_STATS["requests_made"]
        tot = MEM_DISCOVERY_STATS["total_time"]
        avg = round(tot / req, 2) if req > 0 else 0.0
        return {
            "requests_made": req,
            "cache_hits": MEM_DISCOVERY_STATS["cache_hits"],
            "cache_misses": MEM_DISCOVERY_STATS["cache_misses"],
            "average_time_seconds": avg
        }
