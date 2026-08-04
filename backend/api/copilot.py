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
from datetime import datetime, timezone
import uuid
import json

router = APIRouter(prefix="/copilot", tags=["copilot"])

@router.post("/company/{company_id}/generate-outreach")
def generate_outreach(company_id: uuid.UUID, db: Session = Depends(get_db)):
    from models.email_message import EmailMessage, EmailStatus
    
    # 1. Validate Company
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    from utils.org import get_default_org
    org = get_default_org(db)
    org_id = org.id

    # 2. Get/Auto-provision prompt for 'email_outreach'
    prompt = db.query(AIPrompt).filter(AIPrompt.feature == "email_outreach").first()
    if not prompt:
        prompt = AIPrompt(
            id=uuid.uuid4(),
            organization_id=org_id,
            name="Email Outreach",
            feature="email_outreach",
            description="Generates personalized email outreach for target company"
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
            template="Write a persuasive, highly tailored sales outreach email for {{company_context}}. Highlight potential AI automation opportunities.",
            model="gemini-1.5-flash",
            temperature=0.7,
            max_tokens=1000,
            is_active=True
        )
        db.add(active_version)
        db.commit()

    # 3. Build Context
    context_builder = ContextBuilder(db)
    company_context = context_builder.build_company_context(company_id)
    variables = {"company_context": company_context}

    # 4. Generate with AI
    ai_service = AIService(db)
    generated_text = None
    try:
        generated_text = ai_service.execute_prompt(
            prompt_version=active_version,
            variables=variables,
            organization_id=org_id
        )
    except Exception as e:
        print(f"Outreach AI Exception: {str(e)}")

    if not generated_text:
        generated_text = f"Hi Team at {company.name},\n\nI noticed your website could benefit from an automated AI Booking Chatbot and Payment Portal. Our clients see a 35% increase in converted leads within 30 days.\n\nWould you be open to a quick 10-minute demo this week?\n\nBest regards,\nLeadForge AI Copilot"

    # 5. Save as a Draft Email in DB
    subject_line = f"Transforming Customer Operations for {company.name}"
    draft_email = db.query(EmailMessage).filter(
        EmailMessage.entity_type == "company",
        EmailMessage.entity_id == company_id,
        EmailMessage.status == EmailStatus.DRAFT
    ).first()

    if not draft_email:
        from core.config import settings
        from services.email_provider import load_smtp_config
        import os
        smtp_cfg = load_smtp_config()
        sender_addr = smtp_cfg.get("SMTP_USER") or getattr(settings, "DEFAULT_SENDER_EMAIL", None) or os.environ.get("DEFAULT_SENDER_EMAIL", "leadforge1.ai@gmail.com")
        draft_email = EmailMessage(
            id=uuid.uuid4(),
            organization_id=org_id,
            entity_type="company",
            entity_id=company_id,
            subject=subject_line,
            body=generated_text,
            sender=sender_addr,
            recipients=[company.website or "contact@example.com"],
            status=EmailStatus.DRAFT
        )
        db.add(draft_email)
    else:
        draft_email.subject = subject_line
        draft_email.body = generated_text
        draft_email.updated_at = datetime.now(timezone.utc)

    company.pipeline_stage = "Draft Ready"
    db.commit()

    return {
        "success": True,
        "draft_id": str(draft_email.id),
        "subject": draft_email.subject,
        "body": draft_email.body
    }

@router.post("/company/{company_id}/analyze")
def analyze_website(company_id: uuid.UUID, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    from utils.org import get_default_org
    org = get_default_org(db)
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
    inferred_problems = [{"problem": "Manual phone inquiries required for bookings", "severity": "HIGH"}]
    recommended_solutions = [{"solution": "AI Digital Booking & Admissions Portal", "estimated_value": 3500}]
    opportunity_score = 92
    sales_coach_advice = "Website lacks online admissions & payment portal. High priority for AI digital transformation package."

    try:
        response_text = ai_service.execute_prompt(
            prompt_version=active_version,
            variables={"website_text": website_text},
            organization_id=org_id
        )
        
        clean_text = (response_text or "").strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        elif clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        try:
            response_json = json.loads(clean_text)
            if "inferred_problems" in response_json:
                inferred_problems = response_json["inferred_problems"]
            if "recommended_solutions" in response_json:
                recommended_solutions = response_json["recommended_solutions"]
            if "opportunity_score" in response_json:
                opportunity_score = response_json["opportunity_score"]
            if "sales_coach_advice" in response_json:
                sales_coach_advice = response_json["sales_coach_advice"]
        except Exception:
            pass
    except Exception as e:
        print(f"AI Execution Note: {str(e)}")

    # 4. Save to Database
    from services.valuation_service import ValuationService
    val_engine = ValuationService()
    val_res = val_engine.calculate_valuation(
        business_type=company.name,
        location=company.location or company.address or "Kenya",
        has_website=bool(company.website),
        rating=company.rating or 4.2,
        review_count=company.review_count or 40
    )

    analysis = db.query(CompanyAnalysis).filter(CompanyAnalysis.company_id == company_id).first()
    if not analysis:
        analysis = CompanyAnalysis(
            id=uuid.uuid4(),
            organization_id=org_id,
            company_id=company_id
        )
        db.add(analysis)

    analysis.raw_scraped_text = website_text
    analysis.inferred_problems = val_res["inferred_problems"]
    analysis.recommended_solutions = val_res["recommended_solutions"]
    analysis.opportunity_score = val_res["opportunity_score"]
    analysis.priority_score = val_res["priority_score"]
    analysis.estimated_value = val_res["estimated_value_kes"]
    analysis.sales_coach_advice = val_res["sales_coach_advice"]
    analysis.why_today = val_res["why_today"]
    analysis.status = "completed"
    
    company.pipeline_stage = "Analyzed"
    db.commit()

    return {
        "success": True,
        "opportunity_score": opportunity_score,
        "inferred_problems": inferred_problems,
        "recommended_solutions": recommended_solutions,
        "sales_coach_advice": sales_coach_advice
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


