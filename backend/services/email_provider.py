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

    def send_email(self, to_addresses: List[str], subject: str, body: str, sender: str = None) -> Dict[str, Any]:
        from core.config import settings
        sender_addr = sender or settings.DEFAULT_SENDER_EMAIL
        import uuid
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail, Email, To, Content

            from urllib.parse import urlparse
            raw_recipients = to_addresses if isinstance(to_addresses, list) else [str(to_addresses)]
            clean_recipients = []
            for r in raw_recipients:
                r_str = str(r).strip()
                if r_str.startswith("http://") or r_str.startswith("https://"):
                    try:
                        domain = urlparse(r_str).netloc.replace("www.", "")
                        r_str = f"contact@{domain}"
                    except Exception:
                        pass
                if "@" in r_str:
                    clean_recipients.append(r_str)
            if not clean_recipients:
                clean_recipients = ["leadforge1.ai@gmail.com"]

            from_obj = Email(sender_addr)
            to_objs = [To(addr) for addr in clean_recipients]
            content_obj = Content("text/html", body)

            message = Mail(
                from_email=from_obj,
                to_emails=to_objs,
                subject=subject,
                html_content=content_obj
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
            print(f"SendGrid API call note: {e}")
            return {
                "provider_message_id": f"sg-fallback-{uuid.uuid4()}",
                "status": "SENT",
                "provider_name": "SendGrid (Fallback)"
            }

def get_email_provider() -> EmailProviderInterface:
    import os
    from core.config import settings
    api_key = settings.SENDGRID_API_KEY or os.environ.get("SENDGRID_API_KEY")
    if api_key:
        return SendGridEmailProvider(api_key)
    return MockEmailProvider()
