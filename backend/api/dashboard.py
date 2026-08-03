from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from core.database import get_db
from models.company import Company
from models.company_analysis import CompanyAnalysis
from models.email_message import EmailMessage, EmailStatus

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/daily-briefing")
def get_daily_briefing(db: Session = Depends(get_db)):
    # Calculate Pipeline Value
    pipeline_value = db.query(func.sum(CompanyAnalysis.estimated_value)).scalar() or 0
    
    # Calculate Expected Revenue (assuming 40% win rate for now)
    expected_revenue = pipeline_value * 0.4
    
    # Get total companies with drafts ready
    drafts_ready = db.query(EmailMessage).filter(EmailMessage.status == EmailStatus.DRAFT).count()
    
    emails_sent = db.query(EmailMessage).filter(EmailMessage.status.in_([EmailStatus.SENT, EmailStatus.DELIVERED, EmailStatus.OPENED, EmailStatus.REPLIED])).count()
    emails_opened = db.query(EmailMessage).filter(EmailMessage.status.in_([EmailStatus.OPENED, EmailStatus.REPLIED])).count()
    emails_replied = db.query(EmailMessage).filter(EmailMessage.status == EmailStatus.REPLIED).count()
    
    follow_ups_due = 5
    
    # Top Priorities (using priority_score)
    top_priorities = db.query(CompanyAnalysis).order_by(CompanyAnalysis.priority_score.desc().nulls_last()).limit(3).all()
    
    priorities_list = []
    for p in top_priorities:
        if p.company:
            priorities_list.append({
                "company_id": str(p.company.id),
                "company_name": p.company.name,
                "opportunity_score": p.opportunity_score,
                "priority_score": p.priority_score,
                "estimated_value": p.estimated_value,
                "sales_coach_advice": p.sales_coach_advice,
                "why_today": p.why_today
            })
        
    return {
        "pipeline_value": pipeline_value,
        "expected_revenue": expected_revenue,
        "drafts_ready": drafts_ready,
        "emails_sent": emails_sent,
        "emails_opened": emails_opened,
        "emails_replied": emails_replied,
        "follow_ups_due": follow_ups_due,
        "top_priorities": priorities_list
    }
