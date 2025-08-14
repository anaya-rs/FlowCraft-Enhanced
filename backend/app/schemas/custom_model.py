from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class CustomModelBase(BaseModel):
    name: str = Field(..., description="Model name")
    description: Optional[str] = Field(None, description="Model description")
    model_type: str = Field(..., description="Model type (classifier, extractor, summarizer)")
    config: Optional[Dict[str, Any]] = Field(None, description="Model configuration")

class CustomModelCreate(CustomModelBase):
    pass

class CustomModelUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Model name")
    description: Optional[str] = Field(None, description="Model description")
    model_type: Optional[str] = Field(None, description="Model type")
    config: Optional[Dict[str, Any]] = Field(None, description="Model configuration")

class CustomModelPublic(CustomModelBase):
    id: str = Field(..., description="Model ID")
    user_id: str = Field(..., description="User ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    class Config:
        from_attributes = True
