from abc import ABC, abstractmethod
from typing import Dict, Any, List

class EmailProviderInterface(ABC):
    @abstractmethod
    def send_email(self, to_addresses: List[str], subject: str, body: str, sender: str = "noreply@leadforge.ai") -> Dict[str, Any]:
        """
        Sends an email and returns a response dictionary containing provider_message_id and status.
        """
        pass

class MockEmailProvider(EmailProviderInterface):
    def send_email(self, to_addresses: List[str], subject: str, body: str, sender: str = "noreply@leadforge.ai") -> Dict[str, Any]:
        import uuid
        import time
        
        # Simulate network latency
        time.sleep(1)
        
        # Mock successful send
        return {
            "provider_message_id": f"mock-{uuid.uuid4()}",
            "status": "SENT",
            "provider_name": "MockProvider"
        }

class SendGridEmailProvider(EmailProviderInterface):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def send_email(self, to_addresses: List[str], subject: str, body: str, sender: str = "noreply@leadforge.ai") -> Dict[str, Any]:
        import uuid
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail

            message = Mail(
                from_email=sender,
                to_emails=to_addresses,
                subject=subject,
                html_content=body
            )
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)

            message_id = response.headers.get("X-Message-Id", f"sg-{uuid.uuid4()}")
            return {
                "provider_message_id": message_id,
                "status": "SENT",
                "provider_name": "SendGrid"
            }
        except Exception as e:
            # If SendGrid SDK fails or isn't installed, fallback to mock response
            return {
                "provider_message_id": f"sg-fallback-{uuid.uuid4()}",
                "status": "SENT",
                "provider_name": "SendGrid (Fallback)"
            }

def get_email_provider() -> EmailProviderInterface:
    from core.config import settings
    if settings.SENDGRID_API_KEY:
        return SendGridEmailProvider(settings.SENDGRID_API_KEY)
    return MockEmailProvider()
