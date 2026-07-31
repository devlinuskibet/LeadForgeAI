from sqlalchemy.orm import Session
from models.email_message import EmailMessage, EmailStatus
from models.activity import Activity
from services.email_provider import EmailProviderInterface, MockEmailProvider
from datetime import datetime, timezone

class EmailService:
    def __init__(self, db: Session, use_mock: bool = True):
        self.db = db
        # For now, default to mock provider as per Phase 8 plan
        if use_mock:
            self.provider: EmailProviderInterface = MockEmailProvider()
        else:
            # Future: return SendGridEmailProvider() or similar
            self.provider: EmailProviderInterface = MockEmailProvider()

    def send_draft(self, email_id: str, user_id: str = None) -> EmailMessage:
        email = self.db.query(EmailMessage).filter(EmailMessage.id == email_id).first()
        if not email:
            raise Exception("Email not found")
        
        if email.status != EmailStatus.DRAFT:
            raise Exception("Only DRAFT emails can be sent")
            
        # 1. Update status to sending
        email.status = EmailStatus.SENDING
        self.db.commit()
        
        try:
            # 2. Call provider
            response = self.provider.send_email(
                to_addresses=email.recipients,
                subject=email.subject,
                body=email.body,
                sender=email.sender
            )
            
            # 3. Handle success
            email.status = EmailStatus(response.get("status", "SENT"))
            email.provider_message_id = response.get("provider_message_id")
            email.provider_name = response.get("provider_name", "MockProvider")
            email.provider_response = response
            email.sent_by_user_id = user_id
            email.sent_at = datetime.now(timezone.utc)
            
            # 4. Log detailed Activity timeline entry
            activity_desc = f"Subject:\n{email.subject}\n\nSent by:\n{'System/Copilot' if not user_id else 'User'}\n\nTime:\n{email.sent_at.strftime('%I:%M %p')}"
            
            activity = Activity(
                organization_id=email.organization_id,
                entity_type=email.entity_type,
                entity_id=email.entity_id,
                type="email",
                title="Outreach Email Sent",
                description=activity_desc,
                created_by_id=user_id
            )
            self.db.add(activity)
            self.db.commit()
            self.db.refresh(email)
            
            if email.provider_name == "MockProvider":
                from workers.tasks import simulate_email_events_task
                simulate_email_events_task.delay(email.provider_message_id)
                
            return email
            
        except Exception as e:
            # Handle failure
            email.status = EmailStatus.FAILED
            self.db.commit()
            raise Exception(f"Failed to send email: {str(e)}")

    def process_webhook_event(self, provider_name: str, payload: dict):
        provider_message_id = payload.get("provider_message_id")
        event = payload.get("event", "").upper()
        
        if not provider_message_id:
            raise Exception("provider_message_id is missing")
            
        email = self.db.query(EmailMessage).filter(EmailMessage.provider_message_id == provider_message_id).first()
        if not email:
            raise Exception("Email not found for provider_message_id")
            
        # Update email status and timestamps
        if event == "DELIVERED":
            email.status = EmailStatus.DELIVERED
            title = "Email Delivered"
            desc = "The email was successfully delivered to the recipient's inbox."
        elif event == "OPENED":
            email.status = EmailStatus.OPENED
            email.opened_at = datetime.now(timezone.utc)
            title = "Email Opened"
            desc = "The recipient opened the email."
        elif event == "REPLIED":
            email.status = EmailStatus.REPLIED
            email.replied_at = datetime.now(timezone.utc)
            title = "Email Replied"
            desc = "The recipient replied to the email."
        elif event == "BOUNCED":
            email.status = EmailStatus.BOUNCED
            title = "Email Bounced"
            desc = "The email could not be delivered (bounced)."
        else:
            # Log unknown event but don't change status
            return
            
        self.db.commit()
        
        # Add Activity to timeline
        activity = Activity(
            organization_id=email.organization_id,
            entity_type=email.entity_type,
            entity_id=email.entity_id,
            type="email",
            title=title,
            description=desc
        )
        self.db.add(activity)
        self.db.commit()
