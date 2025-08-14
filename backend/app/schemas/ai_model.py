from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AIModelBase(BaseModel):
    name: str = Field(..., description="Model name")
    description: Optional[str] = Field(None, description="Model description")
    model_type: str = Field(..., description="Model type (classifier, extractor, summarizer)")
    prompt_template: str = Field(..., description="Prompt template for the model")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Model temperature")
    max_tokens: int = Field(1000, ge=1, le=4000, description="Maximum tokens for response")

class AIModelCreate(AIModelBase):
    pass

class AIModelUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Model name")
    description: Optional[str] = Field(None, description="Model description")
    model_type: Optional[str] = Field(None, description="Model type")
    prompt_template: Optional[str] = Field(None, description="Prompt template")
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0, description="Model temperature")
    max_tokens: Optional[int] = Field(None, ge=1, le=4000, description="Maximum tokens")
    is_active: Optional[bool] = Field(None, description="Model active status")

class AIModelResponse(AIModelBase):
    id: str = Field(..., description="Model ID")
    is_active: bool = Field(..., description="Model active status")
    usage_count: int = Field(..., description="Number of times model was used")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

class AIModelListResponse(BaseModel):
    models: List[AIModelResponse] = Field(..., description="List of AI models")
    total: int = Field(..., description="Total number of models")
    skip: int = Field(..., description="Pagination offset")
    limit: int = Field(..., description="Pagination limit")

class AIModelTemplate(BaseModel):
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    prompt_template: str = Field(..., description="Default prompt template")
    temperature: float = Field(..., description="Default temperature")
    max_tokens: int = Field(..., description="Default max tokens")

class AIModelUsage(BaseModel):
    model_id: str = Field(..., description="Model ID")
    document_id: str = Field(..., description="Document ID")
    input_tokens: int = Field(..., description="Input tokens used")
    output_tokens: int = Field(..., description="Output tokens generated")
    processing_time: float = Field(..., description="Processing time in seconds")
    success: bool = Field(..., description="Processing success status")
    timestamp: datetime = Field(..., description="Usage timestamp")
