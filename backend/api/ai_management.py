from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from core.database import get_db
from models.ai_prompt import AIPrompt, AIPromptVersion
from models.ai_log import AIRequest, AIUsage
from services.ai_service import AIService
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from uuid import UUID

router = APIRouter(prefix="/ai", tags=["ai"])

class PromptVersionCreate(BaseModel):
    template: str
    variables: List[str] = []
    model: str = "default-model"
    temperature: float = 0.7
    max_tokens: int = 1000

class PromptCreate(BaseModel):
    name: str
    description: Optional[str] = None
    feature: str
    version: PromptVersionCreate

class PlaygroundRequest(BaseModel):
    prompt_version_id: UUID
    variables: Dict[str, Any]

@router.get("/prompts")
def get_prompts(db: Session = Depends(get_db)):
    prompts = db.query(AIPrompt).all()
    # Serialize manually for simplicity in MVP
    result = []
    for p in prompts:
        active_version = next((v for v in p.versions if v.is_active), None)
        result.append({
            "id": str(p.id),
            "name": p.name,
            "feature": p.feature,
            "active_version": active_version.version_number if active_version else None,
            "template": active_version.template if active_version else None,
            "active_version_id": str(active_version.id) if active_version else None,
            "variables": active_version.variables if active_version else []
        })
    return result

@router.post("/prompts")
def create_prompt(payload: PromptCreate, db: Session = Depends(get_db)):
    prompt = AIPrompt(name=payload.name, description=payload.description, feature=payload.feature)
    db.add(prompt)
    db.flush()
    
    version = AIPromptVersion(
        prompt_id=prompt.id,
        version_number=1,
        template=payload.version.template,
        variables=payload.version.variables,
        model=payload.version.model,
        temperature=payload.version.temperature,
        max_tokens=payload.version.max_tokens,
        is_active=True
    )
    db.add(version)
    db.commit()
    return {"message": "Prompt created successfully", "id": prompt.id}

@router.post("/playground/generate")
def playground_generate(payload: PlaygroundRequest, db: Session = Depends(get_db)):
    version = db.query(AIPromptVersion).filter(AIPromptVersion.id == payload.prompt_version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Prompt version not found")

    from models.organization import Organization
    org = db.query(Organization).first()
    
    ai_service = AIService(db)
    
    try:
        response_text = ai_service.execute_prompt(
            prompt_version=version,
            variables=payload.variables,
            organization_id=org.id if org else None
        )
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/usage")
def get_usage(db: Session = Depends(get_db)):
    total_cost = db.query(func.sum(AIUsage.estimated_cost)).scalar() or 0.0
    total_tokens = db.query(func.sum(AIUsage.total_tokens)).scalar() or 0
    total_requests = db.query(func.count(AIRequest.id)).scalar() or 0
    
    return {
        "total_cost": round(total_cost, 4),
        "total_tokens": total_tokens,
        "total_requests": total_requests
    }
