import uuid
import enum
from sqlalchemy import Boolean, Column, String, DateTime, Enum, Integer, Text, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class ModelType(str, enum.Enum):
    INTERPRETER = "interpreter"
    SUMMARIZER = "summarizer"
    EXTRACTOR = "extractor"
    QA = "qa"
    TRANSLATOR = "translator"
    CUSTOM = "custom"


class ResponseFormat(str, enum.Enum):
    TEXT = "text"
    JSON = "json"
    STRUCTURED = "structured"


class AIModel(Base):
    __tablename__ = "ai_models"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    model_type = Column(Enum(ModelType), nullable=False)
    prompt_template = Column(Text, nullable=False)
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=1000)
    response_format = Column(Enum(ResponseFormat), default=ResponseFormat.TEXT)
    is_active = Column(Boolean, default=True)
    is_draft = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="ai_models")
    processing_jobs = relationship("ProcessingJob", back_populates="ai_model")
