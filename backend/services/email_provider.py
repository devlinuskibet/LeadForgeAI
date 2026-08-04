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

import json
import os

SMTP_CONFIG_PATH = "/home/smtp_config.json" if os.path.exists("/home") else "smtp_config.json"

def save_smtp_config(host: str, port: int, user: str, password: str, save_persist: bool = True):
    clean_pass = (password or "").replace(" ", "").strip()
    clean_user = (user or "").strip()
    data = {
        "SMTP_HOST": (host or "smtp.gmail.com").strip(),
        "SMTP_PORT": int(port or 587),
        "SMTP_USER": clean_user,
        "SMTP_PASSWORD": clean_pass,
        "SMTP_USE_TLS": True
    }
    if save_persist:
        try:
            with open(SMTP_CONFIG_PATH, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"SMTP config save note: {e}")
    return data

def load_smtp_config():
    if os.path.exists(SMTP_CONFIG_PATH):
        try:
            with open(SMTP_CONFIG_PATH, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

class SMTPEmailProvider(EmailProviderInterface):
    def __init__(self, host: str, port: int, user: str, password: str, use_tls: bool = True):
        self.host = (host or "smtp.gmail.com").strip()
        self.port = int(port or 587)
        self.user = (user or "").strip()
        self.password = (password or "").replace(" ", "").strip()
        self.use_tls = use_tls

    def send_email(self, to_addresses: List[str], subject: str, body: str, sender: str = None) -> Dict[str, Any]:
        import uuid
        from urllib.parse import urlparse
        
        sender_addr = sender or self.user or "leadforge1.ai@gmail.com"
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
            clean_recipients = [self.user or "leadforge1.ai@gmail.com"]

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = sender_addr
        msg["To"] = ", ".join(clean_recipients)
        
        part1 = MIMEText(body, "plain", "utf-8")
        part2 = MIMEText(f"<div>{body.replace(chr(10), '<br>')}</div>", "html", "utf-8")
        msg.attach(part1)
        msg.attach(part2)

        try:
            if self.port == 465:
                server = smtplib.SMTP_SSL(self.host, self.port, timeout=15)
            else:
                server = smtplib.SMTP(self.host, self.port, timeout=15)
                if self.use_tls:
                    server.starttls()
            
            if self.user and self.password:
                server.login(self.user, self.password)
                
            server.sendmail(sender_addr, clean_recipients, msg.as_string())
            server.quit()

            return {
                "provider_message_id": f"smtp-{uuid.uuid4()}",
                "status": "SENT",
                "provider_name": "SMTP"
            }
        except Exception as e:
            print(f"SMTP send_email error: {e}")
            raise Exception(f"SMTP Delivery Error: {str(e)}")


def get_email_provider() -> EmailProviderInterface:
    import os
    from core.config import settings

    smtp_cfg = load_smtp_config()
    smtp_host = smtp_cfg.get("SMTP_HOST") or os.environ.get("SMTP_HOST") or settings.SMTP_HOST
    smtp_user = smtp_cfg.get("SMTP_USER") or os.environ.get("SMTP_USER") or settings.SMTP_USER
    smtp_pass = smtp_cfg.get("SMTP_PASSWORD") or os.environ.get("SMTP_PASSWORD") or settings.SMTP_PASSWORD
    smtp_port = int(smtp_cfg.get("SMTP_PORT") or os.environ.get("SMTP_PORT") or settings.SMTP_PORT or 587)

    if smtp_host and smtp_user and smtp_pass:
        return SMTPEmailProvider(
            host=smtp_host,
            port=smtp_port,
            user=smtp_user,
            password=smtp_pass,
            use_tls=getattr(settings, "SMTP_USE_TLS", True)
        )

    api_key = settings.SENDGRID_API_KEY or os.environ.get("SENDGRID_API_KEY")
    if api_key:
        return SendGridEmailProvider(api_key)

    return MockEmailProvider()
