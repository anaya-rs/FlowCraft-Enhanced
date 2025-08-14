from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import User, CustomModel
from app.core.security import get_current_user
from app.schemas.ai_model import (
    AIModelCreate, 
    AIModelUpdate, 
    AIModelResponse,
    AIModelListResponse
)

router = APIRouter()

@router.get("/", response_model=AIModelListResponse)
async def get_ai_models(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's AI models with pagination"""
    try:
        models = db.query(CustomModel).filter(
            CustomModel.user_id == current_user.id
        ).offset(skip).limit(limit).all()
        
        total = db.query(CustomModel).filter(
            CustomModel.user_id == current_user.id
        ).count()
        
        return AIModelListResponse(
            models=[
                AIModelResponse(
                    id=str(model.id),
                    name=model.name,
                    description=model.description,
                    model_type=model.model_type,
                    prompt_template=model.prompt_template,
                    temperature=model.temperature,
                    max_tokens=model.max_tokens,
                    is_active=model.is_active,
                    usage_count=model.usage_count,
                    created_at=model.created_at,
                    updated_at=model.updated_at
                )
                for model in models
            ],
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI models: {str(e)}"
        )

@router.post("/", response_model=AIModelResponse)
async def create_ai_model(
    model_data: AIModelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new AI model"""
    try:
        db_model = CustomModel(
            user_id=current_user.id,
            name=model_data.name,
            description=model_data.description,
            model_type=model_data.model_type,
            prompt_template=model_data.prompt_template,
            temperature=model_data.temperature,
            max_tokens=model_data.max_tokens
        )
        
        db.add(db_model)
        db.commit()
        db.refresh(db_model)
        
        return AIModelResponse(
            id=str(db_model.id),
            name=db_model.name,
            description=db_model.description,
            model_type=db_model.model_type,
            prompt_template=db_model.prompt_template,
            temperature=db_model.temperature,
            max_tokens=db_model.max_tokens,
            is_active=db_model.is_active,
            usage_count=db_model.usage_count,
            created_at=db_model.created_at,
            updated_at=db_model.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create AI model: {str(e)}"
        )

@router.get("/{model_id}", response_model=AIModelResponse)
async def get_ai_model(
    model_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific AI model by ID"""
    try:
        model = db.query(CustomModel).filter(
            CustomModel.id == model_id,
            CustomModel.user_id == current_user.id
        ).first()
        
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="AI model not found"
            )
        
        return AIModelResponse(
            id=str(model.id),
            name=model.name,
            description=model.description,
            model_type=model.model_type,
            prompt_template=model.prompt_template,
            temperature=model.temperature,
            max_tokens=model.max_tokens,
            is_active=model.is_active,
            usage_count=model.usage_count,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI model: {str(e)}"
        )

@router.put("/{model_id}", response_model=AIModelResponse)
async def update_ai_model(
    model_id: str,
    model_update: AIModelUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update AI model"""
    try:
        model = db.query(CustomModel).filter(
            CustomModel.id == model_id,
            CustomModel.user_id == current_user.id
        ).first()
        
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="AI model not found"
            )
        
        # Update fields
        for field, value in model_update.dict(exclude_unset=True).items():
            setattr(model, field, value)
        
        model.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(model)
        
        return AIModelResponse(
            id=str(model.id),
            name=model.name,
            description=model.description,
            model_type=model.model_type,
            prompt_template=model.prompt_template,
            temperature=model.temperature,
            max_tokens=model.max_tokens,
            is_active=model.is_active,
            usage_count=model.usage_count,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update AI model: {str(e)}"
        )

@router.delete("/{model_id}")
async def delete_ai_model(
    model_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete AI model"""
    try:
        model = db.query(CustomModel).filter(
            CustomModel.id == model_id,
            CustomModel.user_id == current_user.id
        ).first()
        
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="AI model not found"
            )
        
        db.delete(model)
        db.commit()
        
        return {"message": "AI model deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete AI model: {str(e)}"
        )

@router.post("/{model_id}/duplicate", response_model=AIModelResponse)
async def duplicate_ai_model(
    model_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Duplicate existing AI model"""
    try:
        original_model = db.query(CustomModel).filter(
            CustomModel.id == model_id,
            CustomModel.user_id == current_user.id
        ).first()
        
        if not original_model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="AI model not found"
            )
        
        # Create duplicate
        duplicated_model = CustomModel(
            user_id=current_user.id,
            name=f"{original_model.name} (Copy)",
            description=original_model.description,
            model_type=original_model.model_type,
            prompt_template=original_model.prompt_template,
            temperature=original_model.temperature,
            max_tokens=original_model.max_tokens
        )
        
        db.add(duplicated_model)
        db.commit()
        db.refresh(duplicated_model)
        
        return AIModelResponse(
            id=str(duplicated_model.id),
            name=duplicated_model.name,
            description=duplicated_model.description,
            model_type=duplicated_model.model_type,
            prompt_template=duplicated_model.prompt_template,
            temperature=duplicated_model.temperature,
            max_tokens=duplicated_model.max_tokens,
            is_active=duplicated_model.is_active,
            usage_count=duplicated_model.usage_count,
            created_at=duplicated_model.created_at,
            updated_at=duplicated_model.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to duplicate AI model: {str(e)}"
        )

@router.get("/templates/")
async def get_model_templates():
    """Get available AI model templates"""
    templates = {
        "classifier": {
            "name": "Document Classifier",
            "description": "Classify documents into categories",
            "prompt_template": "Classify the following document into one of these categories: {categories}. Document content: {content}",
            "temperature": 0.3,
            "max_tokens": 100
        },
        "extractor": {
            "name": "Information Extractor",
            "description": "Extract key information from documents",
            "prompt_template": "Extract the following information from this document: {fields}. Document content: {content}",
            "temperature": 0.1,
            "max_tokens": 200
        },
        "summarizer": {
            "name": "Document Summarizer",
            "description": "Generate concise summaries of documents",
            "prompt_template": "Summarize the following document in {max_words} words or less: {content}",
            "temperature": 0.5,
            "max_tokens": 150
        }
    }
    
    return {"templates": templates}
