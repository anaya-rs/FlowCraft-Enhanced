from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models import User
from app.core.security import (
    get_current_user, 
    authenticate_user, 
    create_access_token, 
    create_refresh_token,
    get_password_hash,
    authenticate_mock_user,
    create_mock_tokens
)
from app.schemas.auth import (
    UserCreate, 
    UserLogin, 
    Token, 
    UserResponse, 
    UserUpdate,
    RefreshToken
)

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register new user"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            password_hash=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return UserResponse(
            id=str(db_user.id),
            email=db_user.email,
            first_name=db_user.first_name,
            last_name=db_user.last_name,
            is_active=db_user.is_active,
            is_verified=db_user.is_verified,
            subscription_tier=db_user.subscription_tier,
            created_at=db_user.created_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login_json(
    user_credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Login user with email and password (JSON format)"""
    return await _perform_login(user_credentials.email, user_credentials.password, db)

@router.post("/login-form", response_model=Token)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user with email and password (Form format)"""
    return await _perform_login(form_data.username, form_data.password, db)

async def _perform_login(email: str, password: str, db: Session):
    """Shared login logic"""
    try:
        # Try database authentication first
        user = authenticate_user(db, email, password)
        
        if user:
            # Real user authentication
            access_token = create_access_token(data={"sub": str(user.id)})
            refresh_token = create_refresh_token(data={"sub": str(user.id)})
            
            return Token(
                access_token=access_token,
                refresh_token=refresh_token,
                token_type="bearer",
                expires_in=3600  # 1 hour
            )
        
        # Fallback to mock authentication for development
        mock_user = authenticate_mock_user(email, password)
        
        if mock_user:
            tokens = create_mock_tokens(mock_user)
            return Token(**tokens)
        
        # Authentication failed
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token_data: RefreshToken,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    try:
        from app.core.security import verify_token
        
        # Verify refresh token
        payload = verify_token(refresh_token_data.refresh_token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Check if it's a refresh token
        token_type = payload.get("type")
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Create new access token
        access_token = create_access_token(data={"sub": user_id})
        new_refresh_token = create_refresh_token(data={"sub": user_id})
        
        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=3600
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        subscription_tier=current_user.subscription_tier,
        created_at=current_user.created_at
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    try:
        # Update fields
        for field, value in user_update.dict(exclude_unset=True).items():
            if field == "password":
                # Hash new password
                setattr(current_user, "password_hash", get_password_hash(value))
            else:
                setattr(current_user, field, value)
        
        current_user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(current_user)
        
        return UserResponse(
            id=str(current_user.id),
            email=current_user.email,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            is_active=current_user.is_active,
            is_verified=current_user.is_verified,
            subscription_tier=current_user.subscription_tier,
            created_at=current_user.created_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile update failed: {str(e)}"
        )

@router.post("/logout")
async def logout():
    """Logout user (client should discard tokens)"""
    return {"message": "Successfully logged out"}

@router.post("/test-token")
async def test_token(current_user: User = Depends(get_current_user)):
    """Test if current token is valid"""
    return {
        "valid": True,
        "user_id": str(current_user.id),
        "email": current_user.email
    }

@router.get("/test")
async def test_endpoint():
    """Test endpoint for CORS validation"""
    return {"message": "CORS test successful"}


