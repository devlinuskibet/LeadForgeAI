from core.celery_app import celery_app
from core.database import SessionLocal
from services.supervisor_service import SupervisorService
import logging

logger = logging.getLogger(__name__)

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
