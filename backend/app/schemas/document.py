from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.document import ProcessingStatus


class DocumentBase(BaseModel):
    original_filename: str
    mime_type: str


class DocumentCreate(DocumentBase):
    pass


class DocumentPublic(DocumentBase):
    id: str
    user_id: str
    filename: str
    file_size: int
    extracted_text: Optional[str]
    ocr_confidence: Optional[float]
    processing_status: ProcessingStatus
    created_at: datetime
    processed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class DocumentProcess(BaseModel):
    ai_model_id: str
    additional_context: Optional[Dict[str, Any]] = None


class DocumentBatchProcess(BaseModel):
    document_ids: List[str] = Field(..., min_items=1, max_items=50)
    ai_model_id: str
    additional_context: Optional[Dict[str, Any]] = None


class DocumentSearch(BaseModel):
    query: Optional[str] = None
    mime_type: Optional[str] = None
    processing_status: Optional[ProcessingStatus] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
