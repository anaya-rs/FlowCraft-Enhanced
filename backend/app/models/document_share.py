import uuid
from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class DocumentShare(Base):
    __tablename__ = "document_shares"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    shared_by = Column(String, ForeignKey("users.id"), nullable=False)
    recipient_email = Column(String, nullable=True)  
    recipient_name = Column(String, nullable=True)
    access_level = Column(String, default="view") 
    share_token = Column(String, unique=True, index=True, nullable=False)  
    share_link = Column(String, nullable=True)  
    expires_at = Column(DateTime(timezone=True), nullable=True)
    message = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # API Endpoint Configuration
    api_endpoint_enabled = Column(Boolean, default=False)
    api_key = Column(String, nullable=True)
    api_permissions = Column(JSON, nullable=True)
    
    # Webhook Configuration
    webhook_url = Column(String, nullable=True)
    webhook_events = Column(JSON, nullable=True)
    webhook_secret = Column(String, nullable=True)
    webhook_active = Column(Boolean, default=False)
    
    # Export Configuration
    export_directory = Column(String, nullable=True)
    export_format = Column(String, nullable=True)
    auto_export = Column(Boolean, default=False)
    compression = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    document = relationship("Document")
    shared_by_user = relationship("User")
