from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.ai_model import AIModel
from app.schemas.ai_model import (
    AIModelCreate, AIModelUpdate, AIModelPublic, 
    AIModelDuplicate, ModelTemplate
)
from app.services.ai_service import AIService
import uuid

router = APIRouter()


@router.get("/", response_model=List[AIModelPublic])
async def list_models(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    models = db.query(AIModel)\
        .filter(AIModel.user_id == current_user.id)\
        .offset(skip)\
        .limit(limit)\
        .all()
    return models


@router.post("/", response_model=AIModelPublic)
async def create_model(
    model_create: AIModelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if model name already exists for user
    existing_model = db.query(AIModel)\
        .filter(AIModel.user_id == current_user.id, AIModel.name == model_create.name)\
        .first()
    
    if existing_model:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Model with this name already exists"
        )
    
    model = AIModel(
        id=uuid.uuid4(),
        user_id=current_user.id,
        **model_create.dict()
    )
    
    db.add(model)
    db.commit()
    db.refresh(model)
    
    return model


@router.get("/{model_id}", response_model=AIModelPublic)
async def get_model(
    model_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    model = db.query(AIModel)\
        .filter(AIModel.id == model_id, AIModel.user_id == current_user.id)\
        .first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    return model


@router.put("/{model_id}", response_model=AIModelPublic)
async def update_model(
    model_id: str,
    model_update: AIModelUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    model = db.query(AIModel)\
        .filter(AIModel.id == model_id, AIModel.user_id == current_user.id)\
        .first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    # Update model fields
    update_data = model_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(model, field, value)
    
    db.commit()
    db.refresh(model)
    
    return model


@router.delete("/{model_id}")
async def delete_model(
    model_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    model = db.query(AIModel)\
        .filter(AIModel.id == model_id, AIModel.user_id == current_user.id)\
        .first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    db.delete(model)
    db.commit()
    
    return {"message": "Model deleted successfully"}


@router.post("/{model_id}/duplicate", response_model=AIModelPublic)
async def duplicate_model(
    model_id: str,
    duplicate_data: AIModelDuplicate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    original_model = db.query(AIModel)\
        .filter(AIModel.id == model_id, AIModel.user_id == current_user.id)\
        .first()
    
    if not original_model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    # Check if new name already exists
    existing_model = db.query(AIModel)\
        .filter(AIModel.user_id == current_user.id, AIModel.name == duplicate_data.name)\
        .first()
    
    if existing_model:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Model with this name already exists"
        )
    
    # Create duplicate
    new_model = AIModel(
        id=uuid.uuid4(),
        user_id=current_user.id,
        name=duplicate_data.name,
        description=duplicate_data.description or original_model.description,
        model_type=original_model.model_type,
        prompt_template=original_model.prompt_template,
        temperature=original_model.temperature,
        max_tokens=original_model.max_tokens,
        response_format=original_model.response_format,
        is_active=True,
        is_draft=True
    )
    
    db.add(new_model)
    db.commit()
    db.refresh(new_model)
    
    return new_model


@router.get("/templates/", response_model=Dict[str, ModelTemplate])
async def get_model_templates():
    return AIService.get_model_templates()
