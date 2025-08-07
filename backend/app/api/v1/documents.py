from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document, ProcessingStatus
from app.models.processing_job import ProcessingJob, JobStatus
from app.models.ai_model import AIModel
from app.schemas.document import DocumentCreate, DocumentPublic, DocumentProcess
from app.services.storage_service import StorageService
from app.services.ocr_service import OCRService
from app.workers.document_processor import process_document_task
import uuid
import os

router = APIRouter()


@router.post("/upload", response_model=DocumentPublic)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file
    if file.size > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large"
        )
    
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'text/plain']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not supported"
        )
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    stored_filename = f"{file_id}{file_extension}"
    
    # Save file
    storage_service = StorageService()
    file_path = await storage_service.save_file(file, stored_filename)
    
    # Create document record
    document = Document(
        id=uuid.uuid4(),
        user_id=current_user.id,
        filename=stored_filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size=file.size,
        mime_type=file.content_type,
        processing_status=ProcessingStatus.UPLOADED
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Queue OCR processing
    background_tasks.add_task(process_ocr_task, str(document.id))
    
    return document


async def process_ocr_task(document_id: str):
    """Background task to process OCR"""
    from app.core.database import SessionLocal
    
    db = SessionLocal()
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            return
        
        document.processing_status = ProcessingStatus.PROCESSING
        db.commit()
        
        # Extract text using OCR
        text, confidence = OCRService.extract_text(document.file_path, document.mime_type)
        
        # Update document
        document.extracted_text = text
        document.ocr_confidence = confidence
        document.processing_status = ProcessingStatus.COMPLETED
        
        db.commit()
        
    except Exception as e:
        if document:
            document.processing_status = ProcessingStatus.FAILED
            db.commit()
        
    finally:
        db.close()


@router.get("/", response_model=List[DocumentPublic])
async def list_documents(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    documents = db.query(Document)\
        .filter(Document.user_id == current_user.id)\
        .offset(skip)\
        .limit(limit)\
        .all()
    return documents


@router.get("/{document_id}", response_model=DocumentPublic)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document)\
        .filter(Document.id == document_id, Document.user_id == current_user.id)\
        .first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document


@router.post("/{document_id}/process")
async def process_document(
    document_id: str,
    process_request: DocumentProcess,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify document exists and belongs to user
    document = db.query(Document)\
        .filter(Document.id == document_id, Document.user_id == current_user.id)\
        .first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Verify AI model exists and belongs to user
    ai_model = db.query(AIModel)\
        .filter(AIModel.id == process_request.ai_model_id, AIModel.user_id == current_user.id)\
        .first()
    
    if not ai_model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI model not found"
        )
    
    # Create processing job
    job = ProcessingJob(
        id=uuid.uuid4(),
        user_id=current_user.id,
        document_id=document.id,
        ai_model_id=ai_model.id,
        status=JobStatus.QUEUED,
        input_data=process_request.additional_context
    )
    
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Queue processing task
    background_tasks.add_task(process_document_task, str(job.id))
    
    return {"job_id": str(job.id), "status": "queued"}


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document)\
        .filter(Document.id == document_id, Document.user_id == current_user.id)\
        .first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete file from storage
    storage_service = StorageService()
    await storage_service.delete_file(document.file_path)
    
    # Delete from database
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}
