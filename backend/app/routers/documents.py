from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status, Header
from app.models import Document
from app.schemas import DocumentPublic
from app.database import get_db
from app.core import security
from app.services.document_processor import DocumentProcessor
from sqlalchemy.orm import Session
import os, uuid, aiofiles

router = APIRouter()
doc_processor = DocumentProcessor()
UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Helper: get user from JWT

def get_user_from_token(Authorization: str, db: Session):
    if not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token header")
    token = Authorization.split(" ", 1)[1]
    payload = security.verify_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(Document.owner.property.mapper.class_).filter_by(id=payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/upload", response_model=DocumentPublic)
async def upload_document(
    file: UploadFile = File(...),
    Authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    user = get_user_from_token(Authorization, db)
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    stored_filename = f"{file_id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    doc = Document(
        id=file_id,
        user_id=user.id,
        filename=stored_filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size=len(content),
        mime_type=file.content_type,
        created_at=None,
        processed_at=None
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return DocumentPublic(
        id=str(doc.id),
        user_id=str(doc.user_id),
        filename=doc.filename,
        file_size=doc.file_size,
        original_filename=doc.original_filename,
        mime_type=doc.mime_type,
        extracted_text=doc.extracted_text,
        ocr_confidence=doc.ocr_confidence,
        created_at=doc.created_at,
        processed_at=doc.processed_at
    )

@router.post("/{doc_id}/ocr")
def ocr_document(doc_id: str, Authorization: str = Header(...), db: Session = Depends(get_db)):
    user = get_user_from_token(Authorization, db)
    doc = db.query(Document).filter_by(id=doc_id, user_id=user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    text = doc_processor.ocr_text(doc.file_path)
    doc.extracted_text = text
    db.commit()
    return {"extracted_text": text}

@router.post("/{doc_id}/ocr-handwritten")
def ocr_handwritten(doc_id: str, Authorization: str = Header(...), db: Session = Depends(get_db)):
    user = get_user_from_token(Authorization, db)
    doc = db.query(Document).filter_by(id=doc_id, user_id=user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    text = doc_processor.ocr_handwritten(doc.file_path)
    doc.extracted_text = text
    db.commit()
    return {"extracted_text": text}

@router.post("/{doc_id}/ai")
def ai_analyze(doc_id: str, Authorization: str = Header(...), db: Session = Depends(get_db)):
    user = get_user_from_token(Authorization, db)
    doc = db.query(Document).filter_by(id=doc_id, user_id=user.id).first()
    if not doc or not doc.extracted_text:
        raise HTTPException(status_code=404, detail="Document not found or not OCR'd yet")
    ai_result = doc_processor.ai_analyze(doc.extracted_text)
    return {"ai_result": ai_result}

@router.post("/{doc_id}/key-values")
def key_value_extract(doc_id: str, Authorization: str = Header(...), db: Session = Depends(get_db)):
    user = get_user_from_token(Authorization, db)
    doc = db.query(Document).filter_by(id=doc_id, user_id=user.id).first()
    if not doc or not doc.extracted_text:
        raise HTTPException(status_code=404, detail="Document not found or not OCR'd yet")
    kv = doc_processor.key_value_extract(doc.extracted_text)
    return {"key_values": kv}

@router.post("/{doc_id}/export")
def export_config(doc_id: str, Authorization: str = Header(...), db: Session = Depends(get_db)):
    user = get_user_from_token(Authorization, db)
    doc = db.query(Document).filter_by(id=doc_id, user_id=user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # Stub: just return JSON for now
    return {"export": {
        "filename": doc.filename,
        "text": doc.extracted_text
    }}
