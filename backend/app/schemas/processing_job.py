from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from app.models.processing_job import JobStatus


class ProcessingJobBase(BaseModel):
    status: JobStatus


class ProcessingJobCreate(ProcessingJobBase):
    document_id: str
    ai_model_id: str
    input_data: Optional[Dict[str, Any]] = None


class ProcessingJobPublic(ProcessingJobBase):
    id: str
    user_id: str
    document_id: str
    ai_model_id: str
    input_data: Optional[Dict[str, Any]]
    result_data: Optional[Dict[str, Any]]
    error_message: Optional[str]
    processing_time: Optional[float]
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class ProcessingJobResult(BaseModel):
    job_id: str
    status: JobStatus
    result_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    processing_time: Optional[float] = None


class DashboardStats(BaseModel):
    total_documents: int
    total_models: int
    total_processing_jobs: int
    recent_uploads: int
    processing_queue_size: int
    avg_processing_time: Optional[float] = None


class RecentActivity(BaseModel):
    id: str
    type: str  # upload, process, create_model, etc.
    description: str
    timestamp: datetime
    
    class Config:
        from_attributes = True
