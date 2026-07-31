from sqlalchemy.orm import Session
from models.company import Company
from models.contact import Contact
from core.errors import AppException
from uuid import UUID

class CRMService:
    def __init__(self, db: Session):
        self.db = db

    def get_company(self, company_id: UUID, organization_id: UUID) -> Company:
        company = self.db.query(Company).filter(
            Company.id == company_id,
            Company.organization_id == organization_id,
            Company.is_deleted == False
        ).first()
        if not company:
            raise AppException(code="COMPANY_NOT_FOUND", message="Company does not exist.", status_code=404)
        return company

    def advance_pipeline_stage(self, company_id: UUID, stage_name: str):
        from models.pipeline_stage import PipelineStage
        company = self.db.query(Company).filter(Company.id == company_id, Company.is_deleted == False).first()
        if not company:
            return
            
        stage = self.db.query(PipelineStage).filter(PipelineStage.name.ilike(f"%{stage_name}%")).first()
        if stage:
            company.pipeline_stage_id = stage.id
            self.db.commit()
            self.db.refresh(company)
