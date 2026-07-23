from sqlalchemy.orm import Session
from models.orchestration_job import OrchestrationJob
from models.company import Company
from models.company_analysis import CompanyAnalysis
from models.email_message import EmailMessage
from models.ai_prompt import AIPrompt
from services.scraping_service import ScrapingService
from services.ai_service import AIService
from services.context_builder import ContextBuilder
import json
from datetime import datetime, timezone

class SupervisorService:
    def __init__(self, db: Session):
        self.db = db

    def run_auto_prospect(self, job_id: str):
        job = self.db.query(OrchestrationJob).filter(OrchestrationJob.id == job_id).first()
        if not job:
            return

        try:
            job.status = "in_progress"
            job.current_step = "analyzing"
            job.started_at = datetime.now(timezone.utc)
            job.logs = ["Workflow started", "Analyzing website..."]
            self.db.commit()

            company = self.db.query(Company).filter(Company.id == job.entity_id).first()
            if not company:
                raise Exception("Company not found")

            org_id = job.organization_id

            # Step 1: Analyze Website
            scraper = ScrapingService()
            website_text = scraper.scrape_url(company.website or "http://example.com")

            analysis_prompt = self.db.query(AIPrompt).filter(AIPrompt.feature == "website_analysis").first()
            analysis_version = next((v for v in analysis_prompt.versions if v.is_active), None) if analysis_prompt else None
            
            ai_service = AIService(self.db)
            if analysis_version:
                response_text = ai_service.execute_prompt(
                    prompt_version=analysis_version,
                    variables={"website_text": website_text},
                    organization_id=org_id
                )
                response_json = json.loads(response_text)
                
                analysis = self.db.query(CompanyAnalysis).filter(CompanyAnalysis.company_id == company.id).first()
                if not analysis:
                    analysis = CompanyAnalysis(organization_id=org_id, company_id=company.id)
                    self.db.add(analysis)
                
                analysis.raw_scraped_text = website_text
                analysis.inferred_problems = response_json.get("inferred_problems", [])
                analysis.recommended_solutions = response_json.get("recommended_solutions", [])
                analysis.status = "completed"
                
                logs = list(job.logs) if job.logs else []
                logs.append("✓ Website analyzed")
                logs.append("✓ Problems identified")
                logs.append("✓ Solutions recommended")
                job.logs = logs
                self.db.commit()

            # Step 2: Generate Outreach Draft
            job.current_step = "drafting"
            logs = list(job.logs) if job.logs else []
            logs.append("Drafting email...")
            job.logs = logs
            self.db.commit()

            outreach_prompt = self.db.query(AIPrompt).filter(AIPrompt.feature == "email_outreach").first()
            outreach_version = next((v for v in outreach_prompt.versions if v.is_active), None) if outreach_prompt else None

            if outreach_version:
                context_builder = ContextBuilder(self.db)
                company_context = context_builder.build_company_context(company.id)
                
                draft_text = ai_service.execute_prompt(
                    prompt_version=outreach_version,
                    variables={"company_context": company_context},
                    organization_id=org_id
                )

                draft_email = EmailMessage(
                    organization_id=org_id,
                    entity_type="company",
                    entity_id=company.id,
                    subject="[AI Draft] Opportunity with " + company.name,
                    body=draft_text,
                    sender="copilot@leadforge.ai",
                    recipient="",
                    status="draft"
                )
                self.db.add(draft_email)
                
                logs = list(job.logs) if job.logs else []
                logs.append("✓ Email drafted")
                logs.append("✓ Draft saved")
                job.logs = logs
                self.db.commit()

            job.status = "completed"
            job.current_step = "done"
            job.completed_at = datetime.now(timezone.utc)
            
            if job.started_at and job.completed_at:
                duration = (job.completed_at - job.started_at).total_seconds()
                logs = list(job.logs) if job.logs else []
                logs.append(f"Completed in {int(duration)} seconds")
                job.logs = logs
                
            self.db.commit()

        except Exception as e:
            self.db.rollback()
            job.status = "failed"
            job.error_message = str(e)
            job.completed_at = datetime.now(timezone.utc)
            
            logs = list(job.logs) if job.logs else []
            logs.append(f"❌ Error: {str(e)}")
            job.logs = logs
            self.db.commit()
