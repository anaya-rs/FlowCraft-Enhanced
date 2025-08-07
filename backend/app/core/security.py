from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.core.config import settings
import time
from typing import Dict, Any
import hashlib

security = HTTPBearer()


def create_verification_token(email: str) -> str:
    """Create email verification token"""
    payload = {
        "email": email,
        "exp": time.time() + (24 * 3600),  # 24 hours
        "type": "verification"
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_reset_token(email: str) -> str:
    """Create password reset token"""
    payload = {
        "email": email,
        "exp": time.time() + (3600),  # 1 hour
        "type": "reset"
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_verification_token(token: str) -> str:
    """Verify email verification token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("email")
        token_type = payload.get("type")
        
        if email is None or token_type != "verification":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token"
            )
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )


def verify_reset_token(token: str) -> str:
    """Verify password reset token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("email")
        token_type = payload.get("type")
        
        if email is None or token_type != "reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )


def generate_api_key(user_id: str) -> str:
    """Generate API key for user"""
    data = f"{user_id}-{time.time()}-{settings.SECRET_KEY}"
    return hashlib.sha256(data.encode()).hexdigest()
