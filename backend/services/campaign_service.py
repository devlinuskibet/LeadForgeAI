from sqlalchemy.orm import Session
from models.email_message import EmailMessage, EmailStatus
from models.company import Company
from models.activity import Activity
from datetime import datetime, timezone, timedelta
from uuid import UUID
from typing import List, Dict, Any

class CampaignService:
    def __init__(self, db: Session):
        self.db = db

    def evaluate_followups(self) -> List[Dict[str, Any]]:
        """
        Evaluates engaged emails (OPENED or DELIVERED) that have not been replied to,
        and generates automated follow-up drafts for companies.
        """
        # Find emails opened more than 2 minutes ago (or 3 days in prod) without reply
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=2)
        
        opened_emails = self.db.query(EmailMessage).filter(
            EmailMessage.status == EmailStatus.OPENED,
            EmailMessage.opened_at <= cutoff,
            EmailMessage.replied_at == None,
            EmailMessage.entity_type == "company"
        ).all()
        
        created_followups = []
        for email in opened_emails:
            # Check if follow-up draft already exists for this company
            existing_followup = self.db.query(EmailMessage).filter(
                EmailMessage.entity_type == "company",
                EmailMessage.entity_id == email.entity_id,
                EmailMessage.subject.like("%Follow-up%")
            ).first()
            
            if not existing_followup:
                company = self.db.query(Company).filter(Company.id == email.entity_id).first()
                company_name = company.name if company else "there"
                
                followup_subject = f"Re: {email.subject.replace('[AI Draft] ', '')}"
                followup_body = (
                    f"Hi {company_name} team,\n\n"
                    f"Following up on my previous note. Wanted to check if you had a moment to review "
                    f"our proposed technical solution?\n\n"
                    f"Best regards,\nLeadForge AI Team"
                )
                
                new_draft = EmailMessage(
                    organization_id=email.organization_id,
                    entity_type="company",
                    entity_id=email.entity_id,
                    subject=followup_subject,
                    body=followup_body,
                    sender=email.sender,
                    recipient=email.recipient,
                    status=EmailStatus.DRAFT
                )
                self.db.add(new_draft)
                self.db.commit()
                self.db.refresh(new_draft)
                
                # Log activity
                activity = Activity(
                    organization_id=email.organization_id,
                    entity_type="company",
                    entity_id=email.entity_id,
                    type="email",
                    title="Automated Follow-up Drafted",
                    description=f"Generated automated campaign follow-up draft for {company_name}."
                )
                self.db.add(activity)
                self.db.commit()
                
                created_followups.append({
                    "draft_id": str(new_draft.id),
                    "company_id": str(email.entity_id),
                    "subject": followup_subject
                })
                
        return created_followups
