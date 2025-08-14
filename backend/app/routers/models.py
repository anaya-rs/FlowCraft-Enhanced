from fastapi import APIRouter, Depends, HTTPException, status, Header
from app.models import CustomModel
from app.schemas import CustomModelCreate, CustomModelPublic
from app.database import get_db
from app.core import security
from sqlalchemy.orm import Session
import uuid

router = APIRouter()

# Helper: get user from JWT
def get_user_from_token(Authorization: str, db: Session):
    if not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token header")
    token = Authorization.split(" ", 1)[1]
    payload = security.verify_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(CustomModel.owner.property.mapper.class_).filter_by(id=payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=list[CustomModelPublic])
def list_models(Authorization: str = Header(...), db: Session = Depends(get_db)):
    user = get_user_from_token(Authorization, db)
    models = db.query(CustomModel).filter_by(user_id=user.id).all()
    return [CustomModelPublic(
        id=str(m.id),
        user_id=str(m.user_id),
        name=m.name,
        description=m.description,
        model_type=m.model_type,
        config=m.config,
        created_at=m.created_at,
        updated_at=m.updated_at
    ) for m in models]

@router.post("/", response_model=CustomModelPublic)
def create_model(model: CustomModelCreate, Authorization: str = Header(...), db: Session = Depends(get_db)):
    user = get_user_from_token(Authorization, db)
    db_model = CustomModel(
        id=uuid.uuid4(),
        user_id=user.id,
        name=model.name,
        description=model.description,
        model_type=model.model_type,
        config=model.config,
        created_at=None,
        updated_at=None
    )
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return CustomModelPublic(
        id=str(db_model.id),
        user_id=str(db_model.user_id),
        name=db_model.name,
        description=db_model.description,
        model_type=db_model.model_type,
        config=db_model.config,
        created_at=db_model.created_at,
        updated_at=db_model.updated_at
    )

@router.get("/{model_id}", response_model=CustomModelPublic)
def get_model(model_id: str, Authorization: str = Header(...), db: Session = Depends(get_db)):
    user = get_user_from_token(Authorization, db)
    m = db.query(CustomModel).filter_by(id=model_id, user_id=user.id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Model not found")
    return CustomModelPublic(
        id=str(m.id),
        user_id=str(m.user_id),
        name=m.name,
        description=m.description,
        model_type=m.model_type,
        config=m.config,
        created_at=m.created_at,
        updated_at=m.updated_at
    )

@router.put("/{model_id}", response_model=CustomModelPublic)
def update_model(model_id: str, model: CustomModelCreate, Authorization: str = Header(...), db: Session = Depends(get_db)):
    user = get_user_from_token(Authorization, db)
    m = db.query(CustomModel).filter_by(id=model_id, user_id=user.id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Model not found")
    m.name = model.name
    m.description = model.description
    m.model_type = model.model_type
    m.config = model.config
    db.commit()
    db.refresh(m)
    return CustomModelPublic(
        id=str(m.id),
        user_id=str(m.user_id),
        name=m.name,
        description=m.description,
        model_type=m.model_type,
        config=m.config,
        created_at=m.created_at,
        updated_at=m.updated_at
    )

@router.delete("/{model_id}")
def delete_model(model_id: str, Authorization: str = Header(...), db: Session = Depends(get_db)):
    user = get_user_from_token(Authorization, db)
    m = db.query(CustomModel).filter_by(id=model_id, user_id=user.id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Model not found")
    db.delete(m)
    db.commit()
    return {"message": "Model deleted"}
