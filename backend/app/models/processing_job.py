import uuid
import enum
from sqlalchemy import Boolean, Column, String, DateTime, Enum, Integer, Text, Float, ForeignKey
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class JobStatus(str, enum.Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    ai_model_id = Column(String, ForeignKey("ai_models.id"), nullable=False)
    status = Column(Enum(JobStatus), default=JobStatus.QUEUED)
    input_data = Column(JSON)
    result_data = Column(JSON)
    error_message = Column(Text)
    processing_time = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="processing_jobs")
    document = relationship("Document", back_populates="processing_jobs")
    ai_model = relationship("AIModel", back_populates="processing_jobs")
