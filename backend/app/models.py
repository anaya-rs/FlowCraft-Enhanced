import uuid
from sqlalchemy import Column, String, DateTime, Boolean, Enum, Integer, Text, Float, ForeignKey, BigInteger, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

# Enums
class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"

class ProcessingStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
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

class ExportFormat(str, enum.Enum):
    JSON = "json"
    CSV = "csv"
    TXT = "txt"
    PDF = "pdf"

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    subscription_tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")
    custom_models = relationship("CustomModel", back_populates="owner", cascade="all, delete-orphan")
    export_configs = relationship("ExportConfig", back_populates="owner", cascade="all, delete-orphan")
    tags = relationship("DocumentTag", back_populates="owner", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(BigInteger, nullable=False)
    mime_type = Column(String, nullable=False)
    extracted_text = Column(Text)
    ocr_confidence = Column(Float)
    processing_status = Column(Enum(ProcessingStatus), default=ProcessingStatus.UPLOADED)
    document_type = Column(Enum(DocumentType), default=DocumentType.GENERIC)
    ai_analysis = Column(JSON)  # Store AI analysis results
    key_value_pairs = Column(JSON)  # Store extracted key-value pairs
    entities = Column(JSON)  # Store recognized entities
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
    
    # Relationships
    owner = relationship("User", back_populates="documents")
    tags = relationship("DocumentTag", secondary="document_tag_association", back_populates="documents")
    export_configs = relationship("ExportConfig", back_populates="documents")

class CustomModel(Base):
    __tablename__ = "custom_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    model_type = Column(String, nullable=False)  # classifier, extractor, summarizer
    prompt_template = Column(Text, nullable=False)
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=1000)
    is_active = Column(Boolean, default=True)
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="custom_models")

class ExportConfig(Base):
    __tablename__ = "export_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    export_format = Column(Enum(ExportFormat), default=ExportFormat.JSON)
    template_config = Column(JSON)  # Export template configuration
    webhook_url = Column(String)  # For API webhook integration
    webhook_headers = Column(JSON)  # Custom headers for webhook
    auto_export = Column(Boolean, default=False)  # Auto-export on processing
    export_directory = Column(String)  # Local export directory
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="export_configs")
    documents = relationship("Document", back_populates="export_configs")

class DocumentTag(Base):
    __tablename__ = "document_tags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    color = Column(String, default="#ff6b35")  # Orange accent color
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="tags")
    documents = relationship("Document", secondary="document_tag_association", back_populates="tags")

# Association table for many-to-many relationship between documents and tags
class DocumentTagAssociation(Base):
    __tablename__ = "document_tag_association"
    
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), primary_key=True)
    tag_id = Column(UUID(as_uuid=True), ForeignKey("document_tags.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    job_type = Column(String, nullable=False)  # ocr, ai_analysis, export
    status = Column(String, default="queued")  # queued, processing, completed, failed
    progress = Column(Float, default=0.0)  # 0.0 to 1.0
    result = Column(JSON)  # Job result data
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    document = relationship("Document")
