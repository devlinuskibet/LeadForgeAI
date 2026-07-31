from sqlalchemy.orm import Session
from models.company import Company
from models.company_analysis import CompanyAnalysis
from uuid import UUID
from typing import Dict, Any

class ProposalService:
    def __init__(self, db: Session):
        self.db = db

    def generate_proposal_for_company(self, company_id: UUID) -> Dict[str, Any]:
        company = self.db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise Exception("Company not found")

        analysis = self.db.query(CompanyAnalysis).filter(
            CompanyAnalysis.company_id == company_id
        ).order_by(CompanyAnalysis.created_at.desc()).first()

        problems = analysis.inferred_problems if analysis else []
        solutions = analysis.recommended_solutions if analysis else []

        proposal_title = f"Custom Solution Proposal for {company.name}"
        executive_summary = (
            f"Based on our automated website analysis of {company.website or company.name}, "
            f"we identified {len(problems)} key operational/technical optimization areas. "
            f"This proposal outlines an implementation roadmap to solve these challenges."
        )

        scope_items = []
        total_estimate = 0
        for sol in solutions:
            value = sol.get("estimated_value", 3500) if isinstance(sol, dict) else 3500
            total_estimate += value
            scope_items.append({
                "module": sol.get("solution", "Custom AI Solution Module") if isinstance(sol, dict) else str(sol),
                "confidence": sol.get("confidence", "High") if isinstance(sol, dict) else "High",
                "estimated_price": value
            })

        if not scope_items:
            scope_items = [
                {"module": "Website AI Conversational Agent", "confidence": "High", "estimated_price": 2500},
                {"module": "Automated CRM Lead Routing", "confidence": "High", "estimated_price": 1800}
            ]
            total_estimate = 4300

        return {
            "company_id": str(company_id),
            "company_name": company.name,
            "title": proposal_title,
            "executive_summary": executive_summary,
            "problems_addressed": problems,
            "scope_items": scope_items,
            "total_estimated_value": total_estimate,
            "currency": "USD"
        }
