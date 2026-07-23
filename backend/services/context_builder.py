import json
import uuid
from typing import Dict, Any
from sqlalchemy.orm import Session
from models.company import Company
from models.contact import Contact
from models.note import Note

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

        # Fetch contacts safely
        contacts = self.db.query(Contact).filter(Contact.company_id == company_id).all()
        contact_data = [
            {
                "name": f"{getattr(c, 'first_name', '')} {getattr(c, 'last_name', '')}".strip(),
                "role": getattr(c, "role", None),
                "email": getattr(c, "email", None)
            }
            for c in contacts
        ]

        # Fetch recent notes
        notes = (
            self.db.query(Note)
            .filter(Note.entity_type == "company", Note.entity_id == company_id)
            .order_by(Note.created_at.desc())
            .limit(5)
            .all()
        )
        note_data = [{"content": n.content, "date": str(getattr(n, "created_at", ""))} for n in notes]

        # Fetch Company Analysis if exists
        analysis_data = None
        try:
            from models.company_analysis import CompanyAnalysis
            analysis = self.db.query(CompanyAnalysis).filter(CompanyAnalysis.company_id == company_id).first()
            if analysis and getattr(analysis, "status", "") == "completed":
                analysis_data = {
                    "inferred_problems": getattr(analysis, "inferred_problems", []),
                    "recommended_solutions": getattr(analysis, "recommended_solutions", [])
                }
        except Exception:
            pass

        # Build structured company context payload
        data: Dict[str, Any] = {
            "id": str(company.id),
            "name": getattr(company, "name", ""),
            "website": getattr(company, "website", None),
            "domain": getattr(company, "domain", None),
            "industry": getattr(company, "industry", None),
            "employee_count": getattr(company, "employee_count", None),
            "description": getattr(company, "description", None),
            "contacts": contact_data,
            "recent_notes": note_data
        }

        if analysis_data:
            data["ai_insights"] = analysis_data

        context_str = json.dumps(data, indent=2)
        
        # Enforce hard limit to save tokens/prevent LLM context overflow
        if len(context_str) > self.char_limit:
            context_str = context_str[:self.char_limit] + "\n... [TRUNCATED]"
            
        return context_str

    def build_executive_summary_context(self, company_name: str, industry: str, notes_summary: str) -> str:
        """Helper to create concise executive context for AI outreach generation."""
        summary = {
            "target_company": company_name,
            "target_industry": industry,
            "key_notes": notes_summary
        }
        return json.dumps(summary, indent=2)
