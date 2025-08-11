from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models import ExportFormat

class ExportRequest(BaseModel):
    document_id: str = Field(..., description="ID of document to export")
    export_format: ExportFormat = Field(..., description="Export format")
    export_config_id: Optional[str] = Field(None, description="Export configuration ID")
    template_name: str = Field("standard", description="Export template name")

class ExportResponse(BaseModel):
    success: bool = Field(..., description="Export success status")
    export_id: str = Field(..., description="Unique export ID")
    file_path: Optional[str] = Field(None, description="Path to exported file")
    download_url: Optional[str] = Field(None, description="Download URL")
    format: ExportFormat = Field(..., description="Export format")
    status: Optional[str] = Field("completed", description="Export status")
    exported_at: datetime = Field(..., description="Export timestamp")

class ExportConfigCreate(BaseModel):
    name: str = Field(..., description="Configuration name")
    description: Optional[str] = Field(None, description="Configuration description")
    export_format: ExportFormat = Field(..., description="Default export format")
    template_config: Optional[Dict[str, Any]] = Field(None, description="Template configuration")
    webhook_url: Optional[str] = Field(None, description="Webhook URL for notifications")
    webhook_headers: Optional[Dict[str, str]] = Field(None, description="Custom webhook headers")
    auto_export: bool = Field(False, description="Auto-export on processing")
    export_directory: Optional[str] = Field(None, description="Local export directory")

class ExportConfigUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Configuration name")
    description: Optional[str] = Field(None, description="Configuration description")
    export_format: Optional[ExportFormat] = Field(None, description="Default export format")
    template_config: Optional[Dict[str, Any]] = Field(None, description="Template configuration")
    webhook_url: Optional[str] = Field(None, description="Webhook URL for notifications")
    webhook_headers: Optional[Dict[str, str]] = Field(None, description="Custom webhook headers")
    auto_export: Optional[bool] = Field(None, description="Auto-export on processing")
    export_directory: Optional[str] = Field(None, description="Local export directory")

class ExportConfigResponse(BaseModel):
    id: str = Field(..., description="Configuration ID")
    name: str = Field(..., description="Configuration name")
    description: Optional[str] = Field(None, description="Configuration description")
    export_format: ExportFormat = Field(..., description="Default export format")
    template_config: Optional[Dict[str, Any]] = Field(None, description="Template configuration")
    webhook_url: Optional[str] = Field(None, description="Webhook URL for notifications")
    auto_export: bool = Field(..., description="Auto-export on processing")
    export_directory: Optional[str] = Field(None, description="Local export directory")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

class BatchExportRequest(BaseModel):
    document_ids: List[str] = Field(..., description="List of document IDs to export")
    export_format: ExportFormat = Field(..., description="Export format")
    export_config_id: Optional[str] = Field(None, description="Export configuration ID")
    template_name: str = Field("standard", description="Export template name")

class WebhookConfig(BaseModel):
    url: str = Field(..., description="Webhook URL")
    headers: Optional[Dict[str, str]] = Field(None, description="Custom headers")
