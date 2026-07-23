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

                draft_subject = "[AI Draft] Opportunity with " + company.name
                draft_email = EmailMessage(
                    organization_id=org_id,
                    entity_type="company",
                    entity_id=company.id,
                    subject=draft_subject,
                    body=draft_text,
                    original_ai_subject=draft_subject,
                    original_ai_body=draft_text,
                    sender="copilot@leadforge.ai",
                    recipients=[company.website or "unknown@example.com"],
                    status="DRAFT"
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

    def run_discovery(self, job_id: str):
        job = self.db.query(OrchestrationJob).filter(OrchestrationJob.id == job_id).first()
        if not job:
            return

        import time
        from datetime import datetime, timezone
        import json
        import uuid
        from services.discovery_service import DiscoveryService
        from models.company import CompanyStatus, Company
        from workers.tasks import run_auto_prospect_task

        start_time = time.time()
        try:
            job.status = "in_progress"
            job.current_step = "discovering"
            job.started_at = datetime.now(timezone.utc)
            
            try:
                query_data = json.loads(job.error_message or "{}")
                business_type = query_data.get("business_type", "Business")
                location = query_data.get("location", "Location")
                max_results = query_data.get("max_results", 10)
                min_rating = query_data.get("min_rating", 0.0)
                has_website = query_data.get("has_website", False)
            except:
                business_type = "Unknown"
                location = "Unknown"
                max_results = 10
                min_rating = 0.0
                has_website = False
                
            job.error_message = None # Clear it so it doesn't look like an error
            
            logs = [f"Searching Google Places for {business_type} in {location}..."]
            job.logs = logs
            self.db.commit()

            search_start = time.time()
            discovery_service = DiscoveryService()
            results = discovery_service.search_businesses(
                business_type=business_type, 
                location=location, 
                max_results=max_results, 
                min_rating=min_rating, 
                has_website=has_website
            )
            search_duration = round(time.time() - search_start, 1)
            
            logs = list(job.logs) if job.logs else []
            logs.append(f"✓ {len(results)} businesses found")
            logs.append(f"{search_duration} seconds")
            logs.append("────────────────")
            logs.append("Checking websites...")
            job.logs = logs
            self.db.commit()

            check_start = time.time()
            org_id = job.organization_id
            
            # Create companies
            created_count = 0
            website_count = 0
            company_ids = []
            
            for result in results:
                # Check if company already exists by place ID or website
                existing = None
                if result.get("google_place_id"):
                    existing = self.db.query(Company).filter(Company.google_place_id == result["google_place_id"]).first()
                if not existing and result.get("website"):
                    existing = self.db.query(Company).filter(Company.website == result["website"]).first()
                    
                if not existing:
                    company = Company(
                        id=uuid.uuid4(),
                        organization_id=org_id,
                        name=result["name"],
                        website=result.get("website"),
                        status=CompanyStatus.ACTIVE,
                        google_place_id=result.get("google_place_id"),
                        rating=result.get("rating"),
                        review_count=result.get("review_count"),
                        business_status=result.get("business_status"),
                        latitude=result.get("latitude"),
                        longitude=result.get("longitude"),
                        discovered_at=datetime.now(timezone.utc),
                        discovery_source=result.get("discovery_source", "Google Places")
                    )
                    self.db.add(company)
                    created_count += 1
                    if company.website:
                        website_count += 1
                    company_ids.append(company.id)
            self.db.commit()
            
            check_duration = round(time.time() - check_start, 1)
            logs = list(job.logs) if job.logs else []
            logs.append(f"✓ {website_count} websites available")
            logs.append(f"{check_duration} seconds")
            logs.append("────────────────")
            logs.append("Analyzing...")
            logs.append(f"{created_count} queued")
            job.logs = logs
            self.db.commit()
            
            # Queue analysis jobs
            for cid in company_ids:
                analysis_job = OrchestrationJob(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    entity_type="company",
                    entity_id=cid,
                    workflow_type="auto_prospect",
                    status="pending",
                    parent_job_id=job.id # Link it!
                )
                self.db.add(analysis_job)
                self.db.commit()
                run_auto_prospect_task.delay(str(analysis_job.id))
                    
            job.status = "completed"
            job.current_step = "done"
            job.completed_at = datetime.now(timezone.utc)
            
            logs = list(job.logs) if job.logs else []
            logs.append("────────────────")
            logs.append(f"Generating outreach for {created_count} prospects in background")
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
