import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal, engine
from models.base import Base
from models.user import User, UserRole
from models.organization import Organization
from models.company import Company, CompanyStatus
from models.contact import Contact
from models.pipeline_stage import PipelineStage
from models.custom_field import CustomField
from models.custom_field_value import CustomFieldValue
from models.ai_prompt import AIPrompt, AIPromptVersion
from core.security import get_password_hash
from faker import Faker
import random
import uuid

fake = Faker()

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Organization).first():
            print("Database already seeded.")
            return

        # 1. Create Organization
        org_id = uuid.uuid4()
        org = Organization(id=org_id, organization_id=org_id, name="Acme Corp")
        db.add(org)
        db.commit()

        # 2. Create Admin User
        admin_user = User(
            id=uuid.uuid4(),
            organization_id=org_id,
            email="admin@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="System Admin",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        
        # 3. Create Pipeline Stages
        stages = [
            "Discovered", "Analyzed", "Qualified", "Contacted",
            "Replied", "Meeting", "Proposal", "Negotiation", "Customer", "Lost"
        ]
        stage_objs = []
        for i, s in enumerate(stages):
            stage = PipelineStage(
                id=uuid.uuid4(),
                organization_id=org_id,
                name=s,
                order_index=i
            )
            db.add(stage)
            stage_objs.append(stage)
        db.commit()

        # 4. Create 20 Companies
        company_objs = []
        for _ in range(20):
            comp = Company(
                id=uuid.uuid4(),
                organization_id=org_id,
                name=fake.company(),
                website=fake.domain_name(),
                status=random.choice([CompanyStatus.ACTIVE, CompanyStatus.ACTIVE, CompanyStatus.PAUSED]),
                pipeline_stage_id=random.choice(stage_objs).id
            )
            db.add(comp)
            company_objs.append(comp)
        db.commit()

        # 5. Create 50 Contacts
        roles = ["Decision Maker", "Influencer", "Technical Contact", "Gatekeeper"]
        for _ in range(50):
            cont = Contact(
                id=uuid.uuid4(),
                organization_id=org_id,
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                email=fake.email(),
                phone=fake.phone_number(),
                role=random.choice(roles),
                company_id=random.choice(company_objs).id
            )
            db.add(cont)
        
        db.commit()
        
        # 6. Create AI Prompt for Email Outreach
        prompt_id = uuid.uuid4()
        outreach_prompt = AIPrompt(
            id=prompt_id,
            name="Email Outreach",
            description="Generates a personalized first-touch sales email based on company context.",
            feature="email_outreach"
        )
        db.add(outreach_prompt)
        db.commit()
        
        outreach_version = AIPromptVersion(
            id=uuid.uuid4(),
            prompt_id=prompt_id,
            version_number=1,
            template="You are an expert B2B sales representative.\nWrite a highly personalized, concise outreach email to the following company.\n\nContext:\n{{company_context}}\n\nThe email should have a compelling subject line, reference their context, and end with a soft call to action.",
            variables=["company_context"],
            model="mock-model-v1",
            temperature=0.7,
            max_tokens=500,
            is_active=True
        )
        db.add(outreach_version)

        follow_up_id = uuid.uuid4()
        follow_up_prompt = AIPrompt(
            id=follow_up_id,
            name="Follow-up Email",
            description="Generates context-aware follow-up emails based on previous outreach and statuses.",
            feature="follow_up_email"
        )
        db.add(follow_up_prompt)

        follow_up_version = AIPromptVersion(
            id=uuid.uuid4(),
            prompt_id=follow_up_id,
            version_number=1,
            template='''{
  "subject": "Quick follow-up on {{company_name}}",
  "body": "Hi {{contact_name}}, I wanted to follow up on my previous email regarding {{previous_topic}}. Many schools are preparing for the upcoming season, and I believe we can help you streamline operations. Let me know if you have 10 minutes this week."
}''',
            variables=["company_name", "contact_name", "previous_topic", "company_context"],
            model="mock-model-v1",
            temperature=0.7,
            is_active=True
        )
        db.add(follow_up_version)

        db.commit()

        # 7. Create AI Prompt for Website Analysis
        analysis_prompt_id = uuid.uuid4()
        analysis_prompt = AIPrompt(
            id=analysis_prompt_id,
            name="Website Analysis",
            description="Analyzes website text to extract business problems and recommended solutions.",
            feature="website_analysis"
        )
        db.add(analysis_prompt)
        db.commit()
        
        analysis_version = AIPromptVersion(
            id=uuid.uuid4(),
            prompt_id=analysis_prompt_id,
            version_number=1,
            template='''{
  "status": "success",
  "opportunity_score": 92,
  "priority_score": 96,
  "sales_coach_advice": "Their admissions season begins in two weeks. They lack an online portal.",
  "why_today": "Admissions season begins in two weeks. No outreach has been sent.",
  "inferred_problems": [
    {"problem": "No mobile app", "severity": "High"}
  ],
  "recommended_solutions": [
    {
      "solution": "Build React Native App",
      "business_impact": "Captures mobile users and increases engagement by 40%",
      "estimated_value": 4500,
      "confidence": "High"
    }
  ]
}''',
            variables=["website_text"],
            model="mock-model-v1",
            temperature=0.1,
            max_tokens=1000,
            is_active=True
        )
        db.add(analysis_version)
        db.commit()

        print("Successfully seeded database with Organization, Admin, 20 Companies, 50 Contacts, and AI Prompts.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
