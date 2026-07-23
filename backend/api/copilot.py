from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.ai_prompt import AIPrompt, AIPromptVersion
from models.email_message import EmailMessage
from models.company import Company
from models.organization import Organization
from services.ai_service import AIService
from services.context_builder import ContextBuilder
import uuid

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
