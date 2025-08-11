from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models import ProcessingStatus

class DocumentBase(BaseModel):
    filename: str = Field(..., description="Document filename")
    original_filename: str = Field(..., description="Original filename")
    file_size: int = Field(..., description="File size in bytes")
    mime_type: str = Field(..., description="MIME type")

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: str = Field(..., description="Document ID")
    processing_status: ProcessingStatus = Field(..., description="Processing status")
    ocr_confidence: Optional[float] = Field(None, description="OCR confidence score")
    created_at: datetime = Field(..., description="Creation timestamp")
    processed_at: Optional[datetime] = Field(None, description="Processing completion timestamp")

# Lightweight schema used by simple routers
class DocumentPublic(BaseModel):
    id: str
    user_id: str
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    extracted_text: Optional[str] = None
    ocr_confidence: Optional[float] = None
    created_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse] = Field(..., description="List of documents")
    total: int = Field(..., description="Total number of documents")
    skip: int = Field(..., description="Pagination offset")
    limit: int = Field(..., description="Pagination limit")

class DocumentProcess(BaseModel):
    ai_model_id: Optional[str] = Field(None, description="AI model ID for processing")
    additional_context: Optional[str] = Field(None, description="Additional context for processing")

class DocumentUpdate(BaseModel):
    filename: Optional[str] = Field(None, description="Document filename")
    processing_status: Optional[ProcessingStatus] = Field(None, description="Processing status")
    ocr_confidence: Optional[float] = Field(None, description="OCR confidence score")

class DocumentAnalysis(BaseModel):
    summary: str = Field(..., description="Document summary")
    classification: str = Field(..., description="Document classification")
    confidence: float = Field(..., description="Analysis confidence")
    key_value_pairs: Dict[str, Any] = Field(default_factory=dict, description="Extracted key-value pairs")
    entities: List[Dict[str, Any]] = Field(default_factory=list, description="Recognized entities")
    processing_timestamp: datetime = Field(..., description="Analysis timestamp")
