from fastapi import APIRouter, Depends, HTTPException, status, Header
from app.models import User
from app.schemas.user import UserPublic
from app.core.database import get_db
from app.core import security
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/me", response_model=UserPublic)
def get_me(Authorization: str = Header(...), db: Session = Depends(get_db)):
    if not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token header")
    token = Authorization.split(" ", 1)[1]
    payload = security.verify_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublic(
        id=str(user.id),
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_active=user.is_active,
        is_verified=user.is_verified,
        subscription_tier=user.subscription_tier,
        created_at=user.created_at,
    )
