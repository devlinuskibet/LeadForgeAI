from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.ai_prompt import AIPrompt, AIPromptVersion
from models.email_message import EmailMessage
from models.company import Company
from models.organization import Organization
from models.company_analysis import CompanyAnalysis
from models.orchestration_job import OrchestrationJob
from services.ai_service import AIService
from services.context_builder import ContextBuilder
from services.scraping_service import ScrapingService
from workers.tasks import run_auto_prospect_task
import uuid
import json

router = APIRouter(prefix="/copilot", tags=["copilot"])

@router.post("/company/{company_id}/generate-outreach")
def generate_outreach(company_id: uuid.UUID, db: Session = Depends(get_db)):
    # 1. Validate Company
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    org = db.query(Organization).first()

    # 2. Get the active prompt for 'email_outreach'
    prompt = db.query(AIPrompt).filter(AIPrompt.feature == "email_outreach").first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Email outreach prompt not found")
        
    active_version = next((v for v in prompt.versions if v.is_active), None)
    if not active_version:
        raise HTTPException(status_code=404, detail="No active version for email outreach prompt")

    # 3. Build Context
    context_builder = ContextBuilder(db)
    company_context = context_builder.build_company_context(company_id)
    variables = {"company_context": company_context}

    # 4. Generate with AI
    ai_service = AIService(db)
    try:
        response_text = ai_service.execute_prompt(
            prompt_version=active_version,
            variables=variables,
            organization_id=org.id if org else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 5. Save as a Draft Email in the timeline
    draft_email = EmailMessage(
        organization_id=org.id if org else None,
        entity_type="company",
        entity_id=company_id,
        subject="[AI Draft] Opportunity with Acme", # We'll let the user edit this
        body=response_text,
        sender="copilot@leadforge.ai",
        recipient="",
        status="draft"
    )
    db.add(draft_email)
    db.commit()
    db.refresh(draft_email)

    return {
        "success": True,
        "draft_id": draft_email.id,
        "message": "Outreach drafted successfully."
    }

@router.post("/company/{company_id}/analyze")
def analyze_website(company_id: uuid.UUID, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    org = db.query(Organization).first()
    if not org:
        org = Organization(id=uuid.uuid4(), organization_id=uuid.uuid4(), name="Default Org")
        db.add(org)
        db.commit()
    org_id = org.id

    # 1. Scrape Website
    scraper = ScrapingService()
    website_url = company.website or "http://example.com"
    website_text = scraper.scrape_url(website_url)

    # 2. Get AI Prompt
    prompt = db.query(AIPrompt).filter(AIPrompt.feature == "website_analysis").first()
    if not prompt:
        prompt = AIPrompt(
            id=uuid.uuid4(),
            organization_id=org_id,
            name="Website Analysis",
            feature="website_analysis",
            description="Analyzes target website text for operational & tech issues"
        )
        db.add(prompt)
        db.commit()

    active_version = next((v for v in prompt.versions if v.is_active), None) if prompt.versions else None
    if not active_version:
        active_version = AIPromptVersion(
            id=uuid.uuid4(),
            prompt_id=prompt.id,
            organization_id=org_id,
            version_number=1,
            template="Analyze this website text: {{website_text}}. Identify inferred problems and recommended solutions as JSON.",
            model="gemini-1.5-flash",
            temperature=0.3,
            max_tokens=1000,
            is_active=True
        )
        db.add(active_version)
        db.commit()

    # 3. Analyze with AI
    ai_service = AIService(db)
    try:
        response_text = ai_service.execute_prompt(
            prompt_version=active_version,
            variables={"website_text": website_text},
            organization_id=org.id if org else None
        )
        
        # We expect a JSON response from our mock or real AI model
        response_json = json.loads(response_text)
        inferred_problems = response_json.get("inferred_problems", [])
        recommended_solutions = response_json.get("recommended_solutions", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI execution failed: {str(e)}")

    # 4. Save to Database
    analysis = db.query(CompanyAnalysis).filter(CompanyAnalysis.company_id == company_id).first()
    if not analysis:
        analysis = CompanyAnalysis(
            organization_id=org.id if org else None,
            company_id=company_id,
        )
        db.add(analysis)

    analysis.raw_scraped_text = website_text
    analysis.inferred_problems = inferred_problems
    analysis.recommended_solutions = recommended_solutions
    analysis.status = "completed"

    db.commit()

    return {
        "success": True,
        "inferred_problems": inferred_problems,
        "recommended_solutions": recommended_solutions
    }

@router.post("/company/{company_id}/auto-prospect")
def auto_prospect(company_id: uuid.UUID, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    org = db.query(Organization).first()

    job_id = uuid.uuid4()
    job = OrchestrationJob(
        id=job_id,
        organization_id=org.id if org else None,
        entity_type="company",
        entity_id=company_id,
        workflow_type="auto_prospect",
        status="pending"
    )
    db.add(job)
    db.commit()

    # Trigger Celery Task (or fallback to direct execution)
    try:
        run_auto_prospect_task.delay(str(job_id))
    except Exception:
        from services.supervisor_service import SupervisorService
        supervisor = SupervisorService(db)
        supervisor.run_auto_prospect(str(job_id))

    return {
        "success": True,
        "job_id": str(job_id),
        "message": "Auto-prospecting started in background"
    }

@router.get("/job/{job_id}")
def get_job_status(job_id: uuid.UUID, db: Session = Depends(get_db)):
    job = db.query(OrchestrationJob).filter(OrchestrationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "id": str(job.id),
        "status": job.status,
        "current_step": job.current_step,
        "error_message": job.error_message,
        "logs": job.logs
    }

@router.get("/company/{company_id}/jobs")
def get_company_jobs(company_id: uuid.UUID, db: Session = Depends(get_db)):
    jobs = db.query(OrchestrationJob).filter(OrchestrationJob.entity_id == company_id).order_by(OrchestrationJob.created_at.desc()).all()
    return [{
        "id": str(job.id),
        "workflow_type": job.workflow_type,
        "status": job.status,
        "logs": job.logs,
        "started_at": job.started_at.isoformat() if job.started_at else None,
        "completed_at": job.completed_at.isoformat() if job.completed_at else None
    } for job in jobs]


