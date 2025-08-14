from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from enum import Enum

class SubscriptionTier(str, Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserPublic(UserBase):
    id: str
    is_verified: bool
    subscription_tier: SubscriptionTier
    created_at: datetime
    updated_at: Optional[datetime]

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class DocumentBase(BaseModel):
    original_filename: str
    mime_type: str

class DocumentCreate(DocumentBase):
    pass

class DocumentPublic(DocumentBase):
    id: str
    user_id: str
    filename: str
    file_size: int
    extracted_text: Optional[str]
    ocr_confidence: Optional[float]
    created_at: datetime
    processed_at: Optional[datetime]

class CustomModelBase(BaseModel):
    name: str
    description: Optional[str]
    model_type: str
    config: Dict[str, Any]

class CustomModelCreate(CustomModelBase):
    pass

class CustomModelPublic(CustomModelBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime]

class ExportConfigBase(BaseModel):
    name: str
    config: Dict[str, Any]

class ExportConfigCreate(ExportConfigBase):
    pass

class ExportConfigPublic(ExportConfigBase):
    id: str
    user_id: str
    created_at: datetime
