from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models import ProcessingStatus, DocumentType

class SearchRequest(BaseModel):
    query: Optional[str] = Field(None, description="Search query text")
    document_type: Optional[DocumentType] = Field(None, description="Filter by document type")
    processing_status: Optional[ProcessingStatus] = Field(None, description="Filter by processing status")
    min_confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Minimum confidence score")
    max_confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Maximum confidence score")
    date_from: Optional[datetime] = Field(None, description="Filter from date")
    date_to: Optional[datetime] = Field(None, description="Filter to date")
    min_file_size: Optional[int] = Field(None, ge=0, description="Minimum file size in bytes")
    max_file_size: Optional[int] = Field(None, ge=0, description="Maximum file size in bytes")
    tag_ids: Optional[List[str]] = Field(None, description="Filter by tag IDs")
    sort_by: str = Field("date", description="Sort field (date, name, size, confidence)")
    offset: Optional[int] = Field(None, ge=0, description="Pagination offset")
    limit: Optional[int] = Field(None, ge=1, le=100, description="Pagination limit")

class TagResponse(BaseModel):
    id: str = Field(..., description="Tag ID")
    name: str = Field(..., description="Tag name")
    color: str = Field(..., description="Tag color")
    description: Optional[str] = Field(None, description="Tag description")
    created_at: Optional[datetime] = Field(None, description="Tag creation timestamp")

class DocumentSearchResult(BaseModel):
    id: str = Field(..., description="Document ID")
    filename: str = Field(..., description="Document filename")
    original_filename: str = Field(..., description="Original filename")
    file_size: int = Field(..., description="File size in bytes")
    mime_type: str = Field(..., description="MIME type")
    processing_status: ProcessingStatus = Field(..., description="Processing status")
    document_type: DocumentType = Field(..., description="Document type")
    ocr_confidence: Optional[float] = Field(None, description="OCR confidence score")
    created_at: datetime = Field(..., description="Creation timestamp")
    processed_at: Optional[datetime] = Field(None, description="Processing completion timestamp")
    tags: List[TagResponse] = Field(default_factory=list, description="Document tags")
    key_value_pairs: Dict[str, Any] = Field(default_factory=dict, description="Extracted key-value pairs")
    entities: List[Dict[str, Any]] = Field(default_factory=list, description="Recognized entities")

class SearchResponse(BaseModel):
    results: List[DocumentSearchResult] = Field(..., description="Search results")
    total_count: int = Field(..., description="Total number of matching documents")
    query: Optional[str] = Field(None, description="Search query used")
    filters_applied: Dict[str, Any] = Field(..., description="Filters applied to search")

class TagCreate(BaseModel):
    name: str = Field(..., description="Tag name")
    color: Optional[str] = Field("#ff6b35", description="Tag color")
    description: Optional[str] = Field(None, description="Tag description")

class TagUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Tag name")
    color: Optional[str] = Field(None, description="Tag color")
    description: Optional[str] = Field(None, description="Tag description")

class BulkOperationRequest(BaseModel):
    document_ids: List[str] = Field(..., description="List of document IDs for bulk operation")
    operation: str = Field(..., description="Operation type (delete, reprocess, add_tags, remove_tags)")
    tag_ids: Optional[List[str]] = Field(None, description="Tag IDs for tag operations")

class BulkOperationResponse(BaseModel):
    operation: str = Field(..., description="Operation performed")
    total_documents: int = Field(..., description="Total documents processed")
    success_count: int = Field(..., description="Number of successful operations")
    failed_count: int = Field(..., description="Number of failed operations")
    errors: List[str] = Field(default_factory=list, description="Error messages")
