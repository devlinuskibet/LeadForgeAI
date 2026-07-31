from core.celery_app import celery_app
from core.database import SessionLocal
from services.supervisor_service import SupervisorService
import logging

logger = logging.getLogger(__name__)
import time
import requests
from datetime import datetime, timezone

@celery_app.task(name="auto_prospect_task")
def run_auto_prospect_task(job_id: str):
    db = SessionLocal()
    try:
        logger.info(f"Starting auto-prospect workflow for job_id: {job_id}")
        supervisor = SupervisorService(db)
        supervisor.run_auto_prospect(job_id)
        logger.info(f"Completed auto-prospect workflow for job_id: {job_id}")
    except Exception as e:
        logger.error(f"Failed auto-prospect workflow for job_id {job_id}: {str(e)}")
    finally:
        db.close()

@celery_app.task(name="discovery_task")
def run_discovery_task(job_id: str):
    db = SessionLocal()
    try:
        logger.info(f"Starting discovery workflow for job_id: {job_id}")
        supervisor = SupervisorService(db)
        supervisor.run_discovery(job_id)
        logger.info(f"Completed discovery workflow for job_id: {job_id}")
    except Exception as e:
        logger.error(f"Failed discovery workflow for job_id {job_id}: {str(e)}")
    finally:
        db.close()

@celery_app.task(name="simulate_email_events_task")
def simulate_email_events_task(provider_message_id: str):
    logger.info(f"Simulating events for message {provider_message_id}")
    webhook_url = "http://127.0.0.1:8000/api/emails/webhook/mock"
    
    # 1. Simulate DELIVERED after 10 seconds
    time.sleep(10)
    try:
        requests.post(webhook_url, json={
            "provider_message_id": provider_message_id,
            "event": "DELIVERED",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Simulated DELIVERED for {provider_message_id}")
    except Exception as e:
        logger.error(f"Failed to simulate DELIVERED: {e}")
        
    # 2. Simulate OPENED after 30 seconds
    time.sleep(30)
    try:
        requests.post(webhook_url, json={
            "provider_message_id": provider_message_id,
            "event": "OPENED",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Simulated OPENED for {provider_message_id}")
    except Exception as e:
        logger.error(f"Failed to simulate OPENED: {e}")

@celery_app.task(name="evaluate_campaign_followups_task")
def evaluate_campaign_followups_task():
    logger.info("Evaluating multi-touch campaign follow-up rules...")
    db = SessionLocal()
    try:
        from services.campaign_service import CampaignService
        service = CampaignService(db)
        followups = service.evaluate_followups()
        logger.info(f"Evaluated campaign follow-ups: created {len(followups)} drafts")
        return {"created_count": len(followups), "followups": followups}
    except Exception as e:
        logger.error(f"Error evaluating campaign follow-ups: {e}")
        return {"error": str(e)}
    finally:
        db.close()

