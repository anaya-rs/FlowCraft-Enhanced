import uuid
import enum
from sqlalchemy import Boolean, Column, String, DateTime, Enum, Integer, Text, Float, ForeignKey, BigInteger, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class ProcessingStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    OCR_COMPLETE = "ocr_complete"
    AI_PROCESSING = "ai_processing"
    COMPLETED = "completed"
    FAILED = "failed"

class DocumentType(str, enum.Enum):
    INVOICE = "invoice"
    CONTRACT = "contract"
    FORM = "form"
    RECEIPT = "receipt"
    LETTER = "letter"
    REPORT = "report"
    GENERIC = "generic"


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(BigInteger, nullable=False)
    mime_type = Column(String, nullable=False)
    extracted_text = Column(Text)
    ocr_confidence = Column(Float)
    processing_status = Column(Enum(ProcessingStatus), default=ProcessingStatus.UPLOADED)
    document_type = Column(Enum(DocumentType), default=DocumentType.GENERIC)
    ai_analysis = Column(JSON)
    key_value_pairs = Column(JSON)
    entities = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
    
    # Relationships
    owner = relationship("User", back_populates="documents")
    processing_jobs = relationship("ProcessingJob", back_populates="document")
    # Many-to-many with tags
    tags = relationship("DocumentTag", secondary="document_tag_association", back_populates="documents")
