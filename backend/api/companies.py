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

@router.get("/", response_model=List[CompanyResponse])
def get_companies(db: Session = Depends(get_db)):
    # In a real app, organization_id would come from the current_user
    companies = db.query(Company).filter(Company.is_deleted == False).all()
    return companies

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

@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(company_id: UUID, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id, Company.is_deleted == False).first()
    if not company:
        raise AppException("COMPANY_NOT_FOUND", "Company not found", 404)
    return company
