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
            "status": "SENT"
        }
