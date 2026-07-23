import logging
import uuid
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger("leadforge.audit")
logger.setLevel(logging.INFO)

class AuditLogger:
    @staticmethod
    def log_event(
        action: str,
        entity_type: str,
        entity_id: Optional[str] = None,
        user_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Formats and records structured audit log event.
        """
        audit_entry = {
            "audit_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "user_id": user_id,
            "metadata": metadata or {}
        }
        logger.info(f"AUDIT_EVENT: {audit_entry}")
        return audit_entry
