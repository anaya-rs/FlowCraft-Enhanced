# Re-export commonly used models and enums
from .user import User, SubscriptionTier
from .ai_model import AIModel
from .document import Document, ProcessingStatus, DocumentType
from .processing_job import ProcessingJob
from .document_share import DocumentShare

# Tagging models co-located here for fast import paths
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text, Integer, Float, Boolean
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


import enum

class ExportFormat(str, enum.Enum):
    JSON = "json"
    CSV = "csv"
    TXT = "txt"
    PDF = "pdf"


class CustomModel(Base):
    __tablename__ = "custom_models"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    model_category = Column(String, nullable=False)  # classifier, extractor, summarizer
    config = Column(JSON)  # Model configuration
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="custom_models")


class DocumentTag(Base):
    __tablename__ = "document_tags"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    color = Column(String, default="#ff6b35")
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="tags")
    documents = relationship("Document", secondary="document_tag_association", back_populates="tags")


class DocumentTagAssociation(Base):
    __tablename__ = "document_tag_association"

    document_id = Column(String, ForeignKey("documents.id"), primary_key=True)
    tag_id = Column(String, ForeignKey("document_tags.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
