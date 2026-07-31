from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from models.company import Company, CompanyStatus
from core.errors import AppException
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/companies", tags=["companies"])

class CompanyCreate(BaseModel):
    name: str
    website: Optional[str] = None
    status: str = "ACTIVE"
    pipeline_stage_id: Optional[UUID] = None

class CompanyResponse(BaseModel):
    id: UUID
    name: str
    website: Optional[str]
    status: CompanyStatus
    pipeline_stage_id: Optional[UUID]
    last_ai_analysis: Optional[datetime]
    ai_score: Optional[int]
    ai_summary: Optional[str]
    needs_reanalysis: bool

    class Config:
        from_attributes = True

@router.get("/")
def get_companies(db: Session = Depends(get_db)):
    from models.company_analysis import CompanyAnalysis
    # In a real app, organization_id would come from the current_user
    companies = db.query(Company).filter(Company.is_deleted == False).order_by(Company.created_at.desc()).all()
    
    results = []
    for c in companies:
        analysis = db.query(CompanyAnalysis).filter(CompanyAnalysis.company_id == c.id).order_by(CompanyAnalysis.created_at.desc()).first()
        results.append({
            "id": str(c.id),
            "name": c.name,
            "website": c.website,
            "status": c.status,
            "location": c.location or c.address or "Location unavailable",
            "address": c.address or c.location or "Location unavailable",
            "opportunity_score": analysis.opportunity_score if analysis else 0,
            "estimated_value": analysis.estimated_value if analysis else 0,
            "discovery_source": c.discovery_source
        })
    return results

@router.post("/", response_model=CompanyResponse)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    from models.organization import Organization
    org = db.query(Organization).first()
    if not org:
        raise AppException("NO_ORG", "No organization found. Please run seed script.")

    new_comp = Company(
        organization_id=org.id,
        name=company.name,
        website=company.website,
        status=company.status,
        pipeline_stage_id=company.pipeline_stage_id
    )
    db.add(new_comp)
    db.commit()
    db.refresh(new_comp)
    return new_comp

@router.get("/{company_id}")
def get_company(company_id: UUID, db: Session = Depends(get_db)):
    from models.company_analysis import CompanyAnalysis
    from models.email_message import EmailMessage
    
    company = db.query(Company).filter(Company.id == company_id, Company.is_deleted == False).first()
    if not company:
        raise AppException("COMPANY_NOT_FOUND", "Company not found", 404)
        
    analysis = db.query(CompanyAnalysis).filter(CompanyAnalysis.company_id == company.id).order_by(CompanyAnalysis.created_at.desc()).first()
    email = db.query(EmailMessage).filter(
        EmailMessage.entity_type == "company",
        EmailMessage.entity_id == company.id
    ).order_by(EmailMessage.created_at.desc()).first()
    
    return {
        "id": str(company.id),
        "name": company.name,
        "website": company.website,
        "status": company.status,
        "location": company.location or company.address or "Location unavailable",
        "address": company.address or company.location or "Location unavailable",
        "description": company.ai_summary or "No summary available.",
        "industry": "Unknown",
        "rating": company.rating,
        "review_count": company.review_count,
        "business_status": company.business_status,
        "discovery_source": company.discovery_source,
        "insights": {
            "opportunity_score": analysis.opportunity_score if analysis else 0,
            "estimated_value": analysis.estimated_value if analysis else 0,
            "inferred_problems": analysis.inferred_problems if analysis else [],
            "recommended_solutions": analysis.recommended_solutions if analysis else [],
            "sales_coach_advice": analysis.sales_coach_advice if analysis else "No advice generated yet."
        } if analysis else None,
        "draft_email": {
            "id": str(email.id),
            "subject": email.subject,
            "body": email.body,
            "status": email.status.value
        } if email else None
    }
