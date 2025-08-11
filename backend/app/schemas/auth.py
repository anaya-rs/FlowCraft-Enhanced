from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from app.models import SubscriptionTier

class UserCreate(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password")
    first_name: str = Field(..., description="User first name")
    last_name: str = Field(..., description="User last name")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

class Token(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field("bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")

class RefreshToken(BaseModel):
    refresh_token: str = Field(..., description="JWT refresh token")

class UserResponse(BaseModel):
    id: str = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    first_name: str = Field(..., description="User first name")
    last_name: str = Field(..., description="User last name")
    is_active: bool = Field(..., description="User active status")
    is_verified: bool = Field(..., description="User verification status")
    subscription_tier: SubscriptionTier = Field(..., description="User subscription tier")
    created_at: datetime = Field(..., description="User creation timestamp")

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, description="User first name")
    last_name: Optional[str] = Field(None, description="User last name")
    password: Optional[str] = Field(None, min_length=8, description="User password")
