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

from fastapi import Response
import base64
from datetime import datetime, timezone

TRANSPARENT_PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")

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
            "created_at": email.created_at.isoformat() if getattr(email, "created_at", None) else None,
            "sent_at": email.sent_at.isoformat() if email.sent_at else None,
            "delivered_at": email.delivered_at.isoformat() if getattr(email, "delivered_at", None) else (email.sent_at.isoformat() if email.sent_at else None),
            "opened_at": email.opened_at.isoformat() if email.opened_at else None,
            "opened_count": getattr(email, "opened_count", 0) or (1 if email.opened_at else 0),
            "provider_name": email.provider_name or "SMTP",
            "provider_message_id": email.provider_message_id
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

@router.delete("/{email_id}")
def delete_email(email_id: UUID, db: Session = Depends(get_db)):
    email = db.query(EmailMessage).filter(EmailMessage.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    db.delete(email)
    db.commit()
    return {"message": "Email record deleted successfully"}

@router.post("/{email_id}/send")
def send_email(email_id: UUID, db: Session = Depends(get_db)):
    service = EmailService(db)
    try:
        email = service.send_draft(str(email_id))
        return {"message": "Email sent", "status": email.status.value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{email_id}/resend")
def resend_email(email_id: UUID, db: Session = Depends(get_db)):
    service = EmailService(db)
    try:
        email = service.send_draft(str(email_id))
        return {"message": "Email resent successfully", "status": email.status.value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{email_id}/pixel.png")
def track_email_open(email_id: UUID, db: Session = Depends(get_db)):
    """
    1x1 Transparent Tracking Pixel embedded in outgoing HTML emails.
    Automatically records recipient open event, timestamp, and increments open count.
    """
    email = db.query(EmailMessage).filter(EmailMessage.id == email_id).first()
    if email:
        from models.email_message import EmailStatus
        email.status = EmailStatus.OPENED
        email.opened_at = datetime.now(timezone.utc)
        email.opened_count = (getattr(email, "opened_count", 0) or 0) + 1
        db.commit()
    return Response(content=TRANSPARENT_PNG, media_type="image/png")

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
