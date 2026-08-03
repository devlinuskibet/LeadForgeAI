import uuid
import json
import time
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models.orchestration_job import OrchestrationJob
from models.company import Company, CompanyStatus
from models.company_analysis import CompanyAnalysis
from models.email_message import EmailMessage
from models.ai_prompt import AIPrompt, AIPromptVersion
from services.scraping_service import ScrapingService
from services.ai_service import AIService
from services.context_builder import ContextBuilder

class SupervisorService:
    def __init__(self, db: Session):
        self.db = db

    def run_auto_prospect(self, job_id: str):
        job_uuid = uuid.UUID(str(job_id)) if not isinstance(job_id, uuid.UUID) else job_id
        job = self.db.query(OrchestrationJob).filter(OrchestrationJob.id == job_uuid).first()
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
            if not analysis_prompt:
                analysis_prompt = AIPrompt(
                    id=uuid.uuid4(),
                    organization_id=org_id or uuid.uuid4(),
                    name="Website Analysis",
                    feature="website_analysis",
                    description="Analyzes target website text for operational & tech issues"
                )
                self.db.add(analysis_prompt)
                self.db.commit()

            analysis_version = next((v for v in analysis_prompt.versions if v.is_active), None) if analysis_prompt.versions else None
            if not analysis_version:
                analysis_version = AIPromptVersion(
                    id=uuid.uuid4(),
                    prompt_id=analysis_prompt.id,
                    organization_id=org_id or uuid.uuid4(),
                    version_number=1,
                    template="Analyze this website text: {{website_text}}. Identify inferred problems and recommended solutions as JSON.",
                    model="gemini-1.5-flash",
                    temperature=0.3,
                    max_tokens=1000,
                    is_active=True
                )
                self.db.add(analysis_version)
                self.db.commit()
            
            def clean_and_parse_json(text: str) -> dict:
                if not text: return {}
                t = text.strip()
                if "```" in t:
                    for part in t.split("```"):
                        p = part.strip()
                        if p.startswith("json"): p = p[4:].strip()
                        if p.startswith("{") and p.endswith("}"):
                            t = p; break
                try: return json.loads(t)
                except Exception:
                    import re
                    m = re.search(r'\{.*\}', text, re.DOTALL)
                    if m:
                        try: return json.loads(m.group(0))
                        except Exception: pass
                    return {}

            ai_service = AIService(self.db)
            response_json = {}
            if analysis_version:
                try:
                    response_text = ai_service.execute_prompt(
                        prompt_version=analysis_version,
                        variables={"website_text": website_text},
                        organization_id=org_id
                    )
                    response_json = clean_and_parse_json(response_text)
                except Exception as ex:
                    print(f"Website analysis parsing warning: {ex}")
                
                from services.valuation_service import ValuationService
                val_engine = ValuationService()
                val_res = val_engine.calculate_valuation(
                    business_type=company.name,
                    location=company.location or company.address or "Kenya",
                    has_website=bool(company.website),
                    rating=company.rating or 4.2,
                    review_count=company.review_count or 40
                )

                analysis = self.db.query(CompanyAnalysis).filter(CompanyAnalysis.company_id == company.id).first()
                if not analysis:
                    analysis = CompanyAnalysis(organization_id=org_id, company_id=company.id)
                    self.db.add(analysis)
                
                analysis.raw_scraped_text = website_text
                analysis.inferred_problems = val_res["inferred_problems"]
                analysis.recommended_solutions = val_res["recommended_solutions"]
                analysis.opportunity_score = val_res["opportunity_score"]
                analysis.priority_score = val_res["priority_score"]
                analysis.estimated_value = val_res["estimated_value_kes"]
                analysis.sales_coach_advice = val_res["sales_coach_advice"]
                analysis.why_today = val_res["why_today"]
                analysis.status = "completed"
                
                logs = list(job.logs) if job.logs else []
                logs.append("Website analyzed")
                logs.append("Problems identified")
                logs.append("Solutions recommended")
                job.logs = logs
                self.db.commit()

            # Step 2: Generate Outreach Draft
            job.current_step = "drafting"
            logs = list(job.logs) if job.logs else []
            logs.append("Drafting email...")
            job.logs = logs
            self.db.commit()

            outreach_prompt = self.db.query(AIPrompt).filter(AIPrompt.feature == "email_outreach").first()
            if not outreach_prompt:
                outreach_prompt = AIPrompt(
                    id=uuid.uuid4(),
                    organization_id=org_id or uuid.uuid4(),
                    name="Email Outreach",
                    feature="email_outreach",
                    description="Generates cold outreach email drafts based on company analysis"
                )
                self.db.add(outreach_prompt)
                self.db.commit()

            outreach_version = next((v for v in outreach_prompt.versions if v.is_active), None) if outreach_prompt.versions else None
            if not outreach_version:
                rich_template = (
                    "Write a highly personalized, compelling 3-paragraph B2B cold outreach email to {{company_name}} in {{company_location}}.\n\n"
                    "Prospect Details:\n"
                    "- Company: {{company_name}}\n"
                    "- Location: {{company_location}}\n"
                    "- Website: {{company_website}}\n"
                    "- Key Challenges: {{inferred_problems}}\n"
                    "- Tailored Solution: {{recommended_solutions}}\n\n"
                    "Email Structure:\n"
                    "1. Opening: Address {{company_name}} directly and reference their business operations in {{company_location}}.\n"
                    "2. Pitch: Explain how {{recommended_solutions}} addresses {{inferred_problems}} to capture more leads and boost revenue.\n"
                    "3. CTA: Request a brief 15-minute discovery call this week.\n\n"
                    "Sign off professionally as 'Linus, LeadForgeAI Team'."
                )
                outreach_version = AIPromptVersion(
                    id=uuid.uuid4(),
                    prompt_id=outreach_prompt.id,
                    organization_id=org_id or uuid.uuid4(),
                    version_number=1,
                    template=rich_template,
                    model="gemini-1.5-flash",
                    temperature=0.7,
                    max_tokens=1000,
                    is_active=True
                )
                self.db.add(outreach_version)
                self.db.commit()

            if outreach_version:
                context_builder = ContextBuilder(self.db)
                company_context = context_builder.build_company_context(company.id)
                
                draft_text = ai_service.execute_prompt(
                    prompt_version=outreach_version,
                    variables={
                        "company_name": company.name,
                        "company_location": company.location or company.address or "Kenya",
                        "company_website": company.website or "N/A",
                        "inferred_problems": ", ".join(val_res["inferred_problems"]),
                        "recommended_solutions": val_res["recommended_solutions"][0]["name"] if val_res["recommended_solutions"] else "Lead Capture Automation",
                        "company_context": company_context
                    },
                    organization_id=org_id
                )

                draft_subject = f"Digital Intake & Growth Opportunity for {company.name}"
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
                logs.append("Email drafted")
                logs.append("Draft saved")
                job.logs = logs
                self.db.commit()

            job.status = "completed"
            job.current_step = "done"
            job.completed_at = datetime.now(timezone.utc)
            
            if job.started_at and job.completed_at:
                started = job.started_at.replace(tzinfo=timezone.utc) if job.started_at.tzinfo is None else job.started_at
                completed = job.completed_at.replace(tzinfo=timezone.utc) if job.completed_at.tzinfo is None else job.completed_at
                duration = (completed - started).total_seconds()
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
            logs.append(f"Error: {str(e)}")
            job.logs = logs
            self.db.commit()

    def run_discovery(self, job_id: str):
        job_uuid = uuid.UUID(str(job_id)) if not isinstance(job_id, uuid.UUID) else job_id
        job = self.db.query(OrchestrationJob).filter(OrchestrationJob.id == job_uuid).first()
        if not job:
            return


        # Lazy imports to avoid circular dependency (workers.tasks -> supervisor_service)
        from services.discovery_service import DiscoveryService
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
            logs.append(f"{len(results)} businesses found")
            logs.append(f"{search_duration} seconds")
            logs.append("----------------")
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
                        location=result.get("location") or result.get("address"),
                        address=result.get("address") or result.get("location"),
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
            logs.append(f"{website_count} websites available")
            logs.append(f"{check_duration} seconds")
            logs.append("----------------")
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
                self.run_auto_prospect(str(analysis_job.id))
                    
            job.status = "completed"
            job.current_step = "done"
            job.completed_at = datetime.now(timezone.utc)
            
            logs = list(job.logs) if job.logs else []
            logs.append("----------------")
            logs.append(f"Generating outreach for {created_count} prospects in background")
            job.logs = logs
            self.db.commit()

        except Exception as e:
            self.db.rollback()
            job.status = "failed"
            job.error_message = str(e)
            job.completed_at = datetime.now(timezone.utc)
            
            logs = list(job.logs) if job.logs else []
            logs.append(f"Error: {str(e)}")
            job.logs = logs
            self.db.commit()
