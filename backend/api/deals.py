from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from services.deal_service import DealService
from services.proposal_service import ProposalService
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

router = APIRouter(prefix="/deals", tags=["deals"])

class DealCreate(BaseModel):
    name: str
    amount: float
    company_id: UUID
    status: Optional[str] = "OPEN"

class DealUpdate(BaseModel):
    status: str
    amount: Optional[float] = None
    name: Optional[str] = None

@router.get("/")
def get_deals(db: Session = Depends(get_db)):
    service = DealService(db)
    return service.get_all_deals()

@router.get("/metrics")
def get_deal_metrics(db: Session = Depends(get_db)):
    service = DealService(db)
    return service.get_pipeline_metrics()

@router.post("/")
def create_deal(payload: DealCreate, db: Session = Depends(get_db)):
    service = DealService(db)
    deal = service.create_deal(
        name=payload.name,
        amount=payload.amount,
        company_id=payload.company_id,
        status=payload.status or "OPEN"
    )
    return {
        "success": True,
        "deal_id": str(deal.id),
        "status": deal.status.value
    }

@router.put("/{deal_id}")
def update_deal(deal_id: UUID, payload: DealUpdate, db: Session = Depends(get_db)):
    service = DealService(db)
    try:
        deal = service.update_deal_status(deal_id=deal_id, status=payload.status, amount=payload.amount, name=payload.name)
        return {
            "success": True,
            "deal_id": str(deal.id),
            "status": deal.status.value
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{deal_id}")
def delete_deal(deal_id: UUID, db: Session = Depends(get_db)):
    service = DealService(db)
    try:
        service.delete_deal(deal_id)
        return {"success": True, "message": "Deal deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class DealNoteCreate(BaseModel):
    note: str

@router.post("/{deal_id}/notes")
def add_deal_note(deal_id: UUID, payload: DealNoteCreate, db: Session = Depends(get_db)):
    from models.deal import Deal
    from models.activity import Activity
    from models.organization import Organization
    import uuid

    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    org = db.query(Organization).first()
    act = Activity(
        organization_id=org.id if org else uuid.uuid4(),
        entity_type="company",
        entity_id=deal.company_id,
        type="note",
        title=f"Deal Note ({deal.name})",
        description=payload.note
    )
    db.add(act)
    db.commit()
    return {"success": True, "message": "Note logged to activity timeline"}

@router.post("/company/{company_id}/generate-proposal")
def generate_proposal(company_id: UUID, db: Session = Depends(get_db)):
    service = ProposalService(db)
    try:
        proposal = service.generate_proposal_for_company(company_id)
        return proposal
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
