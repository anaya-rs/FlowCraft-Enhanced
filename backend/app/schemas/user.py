from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import SubscriptionTier


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserInDB(UserBase):
    id: str
    is_verified: bool
    subscription_tier: SubscriptionTier
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class UserPublic(UserBase):
    id: str
    is_verified: bool
    subscription_tier: SubscriptionTier
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
