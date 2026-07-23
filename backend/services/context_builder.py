import json
from sqlalchemy.orm import Session
from models.company import Company
from models.contact import Contact
from models.note import Note
from models.activity import Activity
import uuid

class ContextBuilder:
    def __init__(self, db: Session, char_limit: int = 15000):
        self.db = db
        # 15000 chars roughly equals ~3000-4000 tokens as a safety net
        self.char_limit = char_limit

    def build_company_context(self, company_id: uuid.UUID) -> str:
        """Assembles comprehensive company data into a JSON string context, truncating if necessary."""
        company = self.db.query(Company).filter(Company.id == company_id).first()
        if not company:
            return "{}"

        # Fetch contacts
        contacts = self.db.query(Contact).filter(Contact.company_id == company_id, Contact.is_deleted == False).all()
        contact_data = [{"name": f"{c.first_name} {c.last_name}", "role": c.role} for c in contacts]

        # Fetch recent notes
        notes = self.db.query(Note).filter(Note.entity_type == "company", Note.entity_id == company_id).order_by(Note.created_at.desc()).limit(5).all()
        note_data = [{"content": n.content, "date": str(n.created_at)} for n in notes]

        context_obj = {
            "company_name": company.name,
            "website": company.website,
            "status": company.status,
            "contacts": contact_data,
            "recent_notes": note_data,
            # Add custom fields or tags here later
        }

        context_str = json.dumps(context_obj, indent=2)
        
        # Enforce hard limit to save tokens/prevent LLM context overflow
        if len(context_str) > self.char_limit:
            context_str = context_str[:self.char_limit] + "\n... [TRUNCATED]"
            
        return context_str
