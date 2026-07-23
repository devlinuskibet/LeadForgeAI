import os
import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from core.database import get_db

router = APIRouter(prefix="/health", tags=["system"])

START_TIME = time.time()

@router.get("")
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint returning system status, database connectivity, and uptime.
    """
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    uptime_seconds = int(time.time() - START_TIME)
    
    return {
        "status": "ok" if db_status == "healthy" else "degraded",
        "service": "LeadForgeAI API",
        "version": "0.1.0",
        "uptime_seconds": uptime_seconds,
        "database": db_status,
        "environment": os.getenv("ENVIRONMENT", "development")
    }
