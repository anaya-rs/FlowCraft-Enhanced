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
    document_type: Optional[str] = Field(None, description="Document type classification")
    extracted_text: Optional[str] = Field(None, description="Extracted text from OCR")
    ai_analysis: Optional[Dict[str, Any]] = Field(None, description="AI analysis results")
    key_value_pairs: Optional[Dict[str, Any]] = Field(None, description="Extracted key-value pairs")
    entities: Optional[List[Dict[str, Any]]] = Field(None, description="Recognized entities")
    created_at: datetime = Field(..., description="Creation timestamp")
    processed_at: Optional[datetime] = Field(None, description="Processing completion timestamp")

# Lightweight schema used by simple routers
class DocumentPublic(BaseModel):
    id: str
    user_id: str
    filename: str
    fileSize: int
    originalFilename: str
    mimeType: str
    extractedText: Optional[str] = None
    ocrConfidence: Optional[float] = None
    status: str
    documentType: Optional[str] = None
    aiAnalysis: Optional[Dict[str, Any]] = None
    keyValuePairs: Optional[Dict[str, Any]] = None
    entities: Optional[List[Dict[str, Any]]] = None
    createdAt: Optional[str] = None
    processedAt: Optional[str] = None

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

# Document Sharing Schemas
class DocumentShareCreate(BaseModel):
    document_id: str = Field(..., description="Document ID to share")
    recipient_email: Optional[str] = Field(None, description="Recipient email address")
    recipient_name: Optional[str] = Field(None, description="Recipient name")
    access_level: str = Field(default="view", description="Access level: view, comment, edit")
    expires_at: Optional[datetime] = Field(None, description="Expiration date for the share")
    message: Optional[str] = Field(None, description="Optional message to include with the share")
    public_link: bool = Field(default=False, description="Whether to create a public shareable link")
    
    # API Endpoint Configuration
    api_endpoint_enabled: Optional[bool] = Field(False, description="Whether to enable API endpoint access")
    api_permissions: Optional[Dict[str, Any]] = Field(None, description="API permissions and scopes")
    
    # Webhook Configuration
    webhook_url: Optional[str] = Field(None, description="Webhook URL for notifications")
    webhook_events: Optional[List[str]] = Field(None, description="Events that trigger webhooks")
    webhook_secret: Optional[str] = Field(None, description="Secret key for webhook security")
    
    # Export Configuration
    export_directory: Optional[str] = Field(None, description="Local directory for exports")
    export_format: Optional[str] = Field(None, description="Export format (json, csv, pdf, excel)")
    auto_export: Optional[bool] = Field(False, description="Whether to auto-export on access")
    compression: Optional[bool] = Field(True, description="Whether to compress exports")

class DocumentShareResponse(BaseModel):
    id: str = Field(..., description="Share ID")
    document_id: str = Field(..., description="Document ID")
    document_name: str = Field(..., description="Document name")
    shared_by: str = Field(..., description="User who shared the document")
    recipient_email: Optional[str] = Field(None, description="Recipient email")
    recipient_name: Optional[str] = Field(None, description="Recipient name")
    access_level: str = Field(..., description="Access level")
    share_link: Optional[str] = Field(None, description="Public share link if public_link is True")
    expires_at: Optional[datetime] = Field(None, description="Expiration date")
    message: Optional[str] = Field(None, description="Share message")
    
    # API Endpoint Configuration
    api_endpoint_enabled: bool = Field(..., description="Whether API endpoint access is enabled")
    api_key: Optional[str] = Field(None, description="API key for endpoint access")
    api_permissions: Optional[Dict[str, Any]] = Field(None, description="API permissions and scopes")
    
    # Webhook Configuration
    webhook_url: Optional[str] = Field(None, description="Webhook URL for notifications")
    webhook_events: Optional[List[str]] = Field(None, description="Events that trigger webhooks")
    webhook_secret: Optional[str] = Field(None, description="Secret key for webhook security")
    webhook_active: bool = Field(..., description="Whether webhook is active")
    
    # Export Configuration
    export_directory: Optional[str] = Field(None, description="Local directory for exports")
    export_format: Optional[str] = Field(None, description="Export format")
    auto_export: bool = Field(..., description="Whether to auto-export on access")
    compression: bool = Field(..., description="Whether to compress exports")
    
    created_at: datetime = Field(..., description="Share creation timestamp")
    is_active: bool = Field(..., description="Whether the share is still active")

class DocumentShareUpdate(BaseModel):
    access_level: Optional[str] = Field(None, description="New access level")
    expires_at: Optional[datetime] = Field(None, description="New expiration date")
    message: Optional[str] = Field(None, description="New message")
    is_active: Optional[bool] = Field(None, description="Whether to activate/deactivate the share")

class DocumentShareList(BaseModel):
    shares: List[DocumentShareResponse] = Field(..., description="List of document shares")
    total: int = Field(..., description="Total number of shares")
