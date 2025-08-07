from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.ai_model import ModelType, ResponseFormat


class AIModelBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    model_type: ModelType
    prompt_template: str = Field(..., min_length=1)
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)
    max_tokens: int = Field(default=1000, ge=1, le=4000)
    response_format: ResponseFormat = ResponseFormat.TEXT


class AIModelCreate(AIModelBase):
    pass


class AIModelUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    prompt_template: Optional[str] = Field(None, min_length=1)
    temperature: Optional[float] = Field(None, ge=0.0, le=1.0)
    max_tokens: Optional[int] = Field(None, ge=1, le=4000)
    response_format: Optional[ResponseFormat] = None
    is_active: Optional[bool] = None


class AIModelPublic(AIModelBase):
    id: str
    user_id: str
    is_active: bool
    is_draft: bool
    usage_count: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class AIModelDuplicate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class ModelTemplate(BaseModel):
    name: str
    description: str
    model_type: ModelType
    prompt_template: str
    temperature: float
    max_tokens: int
    response_format: ResponseFormat
