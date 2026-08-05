from sqlalchemy.orm import Session
from models.deal import Deal, DealStatus
from models.company import Company
from models.opportunity import Opportunity
from models.organization import Organization
from uuid import UUID
import uuid
from typing import List, Dict, Any

class DealService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_deals(self) -> List[Dict[str, Any]]:
        deals = self.db.query(Deal).all()
        results = []
        for d in deals:
            company = self.db.query(Company).filter(Company.id == d.company_id).first()
            results.append({
                "id": str(d.id),
                "name": d.name,
                "amount": d.amount or 0.0,
                "probability": getattr(d, "probability", 75.0) or 75.0,
                "status": d.status.value,
                "company_id": str(d.company_id),
                "company_name": company.name if company else "Unknown Company",
                "company_website": company.website if company else ""
            })
        return results

    def create_deal(self, name: str, amount: float, company_id: UUID, status: str = "OPEN") -> Deal:
        org = self.db.query(Organization).first()
        
        # Ensure opportunity exists
        opp = self.db.query(Opportunity).filter(Opportunity.company_id == company_id).first()
        if not opp:
            opp = Opportunity(
                id=uuid.uuid4(),
                organization_id=org.id if org else uuid.uuid4(),
                company_id=company_id,
                title=f"Opportunity - {name}",
                value=amount
            )
            self.db.add(opp)
            self.db.commit()
            self.db.refresh(opp)

        new_deal = Deal(
            id=uuid.uuid4(),
            organization_id=org.id if org else uuid.uuid4(),
            name=name,
            amount=amount,
            status=DealStatus(status),
            opportunity_id=opp.id,
            company_id=company_id
        )
        self.db.add(new_deal)
        self.db.commit()
        self.db.refresh(new_deal)
        return new_deal

    def update_deal_status(self, deal_id: UUID, status: str, amount: float = None, name: str = None) -> Deal:
        deal = self.db.query(Deal).filter(Deal.id == deal_id).first()
        if not deal:
            raise Exception("Deal not found")

        deal.status = DealStatus(status)
        if amount is not None:
            deal.amount = amount
        if name is not None and name.strip():
            deal.name = name.strip()
            
        self.db.commit()
        self.db.refresh(deal)
        return deal

    def delete_deal(self, deal_id: UUID) -> bool:
        deal = self.db.query(Deal).filter(Deal.id == deal_id).first()
        if not deal:
            raise Exception("Deal not found")
        self.db.delete(deal)
        self.db.commit()
        return True

    def get_pipeline_metrics(self) -> Dict[str, Any]:
        deals = self.db.query(Deal).all()
        total_open = sum(d.amount or 0 for d in deals if d.status == DealStatus.OPEN)
        total_weighted = sum((d.amount or 0) * ((getattr(d, "probability", 75.0) or 75.0) / 100.0) for d in deals if d.status == DealStatus.OPEN)
        total_won = sum(d.amount or 0 for d in deals if d.status == DealStatus.WON)
        total_lost = sum(d.amount or 0 for d in deals if d.status == DealStatus.LOST)
        
        won_count = sum(1 for d in deals if d.status == DealStatus.WON)
        total_closed = sum(1 for d in deals if d.status in [DealStatus.WON, DealStatus.LOST])
        win_rate = round((won_count / total_closed * 100), 1) if total_closed > 0 else 0.0

        return {
            "total_open_value": total_open,
            "total_weighted_value": round(total_weighted, 2),
            "total_won_value": total_won,
            "total_lost_value": total_lost,
            "total_deals_count": len(deals),
            "win_rate_percentage": win_rate
        }
