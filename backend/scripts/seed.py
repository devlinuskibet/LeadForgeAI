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
        print("Successfully seeded database with Organization, Admin, 20 Companies, and 50 Contacts.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
