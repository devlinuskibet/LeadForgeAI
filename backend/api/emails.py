from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from pydantic import BaseModel

from core.database import get_db
from models.email_message import EmailMessage
from services.email_service import EmailService

router = APIRouter(prefix="/emails", tags=["Emails"])

class EmailUpdate(BaseModel):
    subject: str
    body: str
    recipient: Optional[str] = None
    sender: Optional[str] = None

@router.get("/{entity_type}/{entity_id}")
def get_emails_for_entity(entity_type: str, entity_id: UUID, db: Session = Depends(get_db)):
    emails = db.query(EmailMessage).filter(
        EmailMessage.entity_type == entity_type,
        EmailMessage.entity_id == entity_id
    ).order_by(EmailMessage.created_at.desc()).all()
    
    return [
        {
            "id": str(email.id),
            "subject": email.subject,
            "body": email.body,
            "original_ai_subject": email.original_ai_subject,
            "original_ai_body": email.original_ai_body,
            "sender": email.sender,
            "recipients": email.recipients,
            "status": email.status.value,
            "sent_at": email.sent_at.isoformat() if email.sent_at else None
        }
        for email in emails
    ]

@router.put("/{email_id}")
def update_email_draft(email_id: UUID, update: EmailUpdate, db: Session = Depends(get_db)):
    email = db.query(EmailMessage).filter(EmailMessage.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
        
    email.subject = update.subject
    email.body = update.body
    if update.recipient:
        email.recipients = [update.recipient]
    if update.sender:
        email.sender = update.sender
    from models.email_message import EmailStatus
    email.status = EmailStatus.DRAFT
    db.commit()
    db.refresh(email)
    
    return {"message": "Draft updated"}

@router.post("/{email_id}/send")
def send_email(email_id: UUID, db: Session = Depends(get_db)):
    service = EmailService(db)
    try:
        # Pass user_id if we had auth middleware, skipping for now
        email = service.send_draft(str(email_id))
        return {"message": "Email sent", "status": email.status.value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class WebhookPayload(BaseModel):
    provider_message_id: str
    event: str
    timestamp: str

@router.post("/webhook/{provider_name}")
def receive_webhook(provider_name: str, payload: WebhookPayload, db: Session = Depends(get_db)):
    """
    Ingests provider webhook delivery and engagement events (DELIVERED, OPENED, REPLIED, BOUNCED).
    Updates EmailMessage status and appends timeline activity events.
    """
    service = EmailService(db)
    try:
        service.process_webhook_event(provider_name, payload.dict())
        return {"message": "Event processed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class SMTPTestPayload(BaseModel):
    host: str = "smtp.gmail.com"
    port: int = 587
    user: str
    password: str
    recipient: str

@router.post("/test-smtp")
def test_smtp_connection(payload: SMTPTestPayload):
    from services.email_provider import SMTPEmailProvider, save_smtp_config
    provider = SMTPEmailProvider(
        host=payload.host,
        port=payload.port,
        user=payload.user,
        password=payload.password
    )
    try:
        res = provider.send_email(
            to_addresses=[payload.recipient],
            subject="LeadForge AI Custom SMTP Connection Test",
            body="Congratulations! Your custom SMTP sales inbox is active and successfully delivering emails.",
            sender=payload.user
        )
        save_smtp_config(
            host=payload.host,
            port=payload.port,
            user=payload.user,
            password=payload.password
        )
        return {"status": "SUCCESS", "details": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/smtp-config")
def get_smtp_status():
    from services.email_provider import load_smtp_config
    cfg = load_smtp_config()
    if cfg.get("SMTP_USER") and cfg.get("SMTP_PASSWORD"):
        return {
            "connected": True,
            "host": cfg.get("SMTP_HOST", "smtp.gmail.com"),
            "port": cfg.get("SMTP_PORT", 587),
            "user": cfg.get("SMTP_USER")
        }
    return {"connected": False}
