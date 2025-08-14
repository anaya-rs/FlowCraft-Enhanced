from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime
from sqlalchemy import func
from pathlib import Path
from werkzeug.utils import secure_filename

from app.database import get_db
from app.models.document import Document, ProcessingStatus, DocumentType
from app.models.user import User
from app.core.security import get_current_user
from app.core.config import settings
from app.services.document_processor import DocumentProcessor
from app.schemas.document import (
    DocumentResponse,
    DocumentListResponse
)

router = APIRouter()
document_processor = DocumentProcessor()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a document for processing"""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
        file_path = str(upload_dir / filename)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        db_document = Document(
            user_id=current_user.id,
            filename=filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=len(content),
            mime_type=file.content_type or "application/octet-stream",
            processing_status=ProcessingStatus.UPLOADED
        )
        
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        background_tasks.add_task(
            process_document_background,
            str(db_document.id),
            file_path,
            db
        )
        
        return DocumentResponse(
            id=str(db_document.id),
            filename=db_document.filename,
            original_filename=db_document.original_filename,
            file_size=db_document.file_size,
            mime_type=db_document.mime_type,
            processing_status=db_document.processing_status,
            document_type=db_document.document_type.value if db_document.document_type else None,
            ocr_confidence=db_document.ocr_confidence,
            extracted_text=db_document.extracted_text,
            ai_analysis=db_document.ai_analysis,
            key_value_pairs=db_document.key_value_pairs,
            entities=db_document.entities,
            created_at=db_document.created_at,
            processed_at=db_document.processed_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/", response_model=DocumentListResponse)
async def get_documents(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's documents with pagination"""
    try:
        documents = db.query(Document).filter(
            Document.user_id == current_user.id
        ).offset(skip).limit(limit).all()
        
        total = db.query(Document).filter(
            Document.user_id == current_user.id
        ).count()
        
        return DocumentListResponse(
            documents=[
                DocumentResponse(
                    id=str(doc.id),
                    filename=doc.filename,
                    original_filename=doc.original_filename,
                    file_size=doc.file_size,
                    mime_type=doc.mime_type,
                    processing_status=doc.processing_status,
                    document_type=doc.document_type.value if doc.document_type else None,
                    ocr_confidence=doc.ocr_confidence,
                    extracted_text=doc.extracted_text,
                    ai_analysis=doc.ai_analysis,
                    key_value_pairs=doc.key_value_pairs,
                    entities=doc.entities,
                    created_at=doc.created_at,
                    processed_at=doc.processed_at
                )
                for doc in documents
            ],
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get documents: {str(e)}")

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific document by ID"""
    try:
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return DocumentResponse(
            id=str(document.id),
            filename=document.filename,
            original_filename=document.original_filename,
            file_size=document.file_size,
            mime_type=document.mime_type,
            processing_status=document.processing_status,
            document_type=document.document_type.value if document.document_type else None,
            ocr_confidence=document.ocr_confidence,
            extracted_text=document.extracted_text,
            ai_analysis=document.ai_analysis,
            key_value_pairs=document.key_value_pairs,
            entities=document.entities,
            created_at=document.created_at,
            processed_at=document.processed_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get document: {str(e)}")

@router.post("/{document_id}/process", response_model=DocumentResponse)
async def process_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process document with OCR and AI analysis"""
    try:
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document.processing_status = ProcessingStatus.PROCESSING
        db.commit()
        
        background_tasks.add_task(
            process_document_background,
            document_id,
            document.file_path,
            db
        )
        
        return DocumentResponse(
            id=str(document.id),
            filename=document.filename,
            original_filename=document.original_filename,
            file_size=document.file_size,
            mime_type=document.mime_type,
            processing_status=document.processing_status,
            document_type=document.document_type.value if document.document_type else None,
            ocr_confidence=document.ocr_confidence,
            extracted_text=document.extracted_text,
            ai_analysis=document.ai_analysis,
            key_value_pairs=document.key_value_pairs,
            entities=document.entities,
            created_at=document.created_at,
            processed_at=document.processed_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start processing: {str(e)}")

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete document"""
    try:
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
        
        db.delete(document)
        db.commit()
        
        return {"message": "Document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")

@router.get("/analytics")
async def get_document_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get document analytics for dashboard"""
    try:
        total = db.query(Document).filter(Document.user_id == current_user.id).count()
        
        processing = db.query(Document).filter(
            Document.user_id == current_user.id,
            Document.processing_status.in_([ProcessingStatus.PROCESSING, ProcessingStatus.OCR_COMPLETE, ProcessingStatus.AI_PROCESSING])
        ).count()
        
        completed = db.query(Document).filter(
            Document.user_id == current_user.id,
            Document.processing_status == ProcessingStatus.COMPLETED
        ).count()
        
        failed = db.query(Document).filter(
            Document.user_id == current_user.id,
            Document.processing_status == ProcessingStatus.FAILED
        ).count()
        
        success_rate = (completed / total * 100) if total > 0 else 0
        
        avg_confidence_result = db.query(func.avg(Document.ocr_confidence)).filter(
            Document.user_id == current_user.id,
            Document.processing_status == ProcessingStatus.COMPLETED,
            Document.ocr_confidence.isnot(None)
        ).scalar()
        
        avg_confidence = float(avg_confidence_result) if avg_confidence_result else 0
        
        storage_result = db.query(func.sum(Document.file_size)).filter(
            Document.user_id == current_user.id
        ).scalar()
        
        storage_used = int(storage_result) if storage_result else 0
        
        return {
            "total": total,
            "processing": processing,
            "completed": completed,
            "failed": failed,
            "successRate": round(success_rate, 1),
            "averageConfidence": round(avg_confidence * 100, 1),
            "storageUsed": storage_used
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")

async def process_document_background(document_id: str, file_path: str, db: Session):
    """Background task for document processing"""
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            return
        
        ocr_result = await document_processor.ocr_async(file_path)
        
        if not ocr_result.get("text") or len(ocr_result["text"].strip()) < 10:
            document.extracted_text = ocr_result.get("text", "")
            document.ocr_confidence = ocr_result.get("confidence", 0)
            document.processing_status = ProcessingStatus.COMPLETED
            document.processed_at = datetime.utcnow()
            db.commit()
            return
        
        ai_result = await document_processor.ai_analyze_async(ocr_result["text"])
        
        document.extracted_text = ocr_result["text"]
        document.ocr_confidence = ocr_result["confidence"]
        document.processing_status = ProcessingStatus.COMPLETED
        document.processed_at = datetime.utcnow()
        
        if ai_result.get("document_type"):
            try:
                document.document_type = DocumentType(ai_result["document_type"])
            except ValueError:
                document.document_type = DocumentType.GENERIC
        
        document.ai_analysis = ai_result
        document.key_value_pairs = ai_result.get("extracted_fields", {})
        document.entities = ai_result.get("entities", [])
        
        db.commit()
        
    except Exception as e:
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            document.processing_status = ProcessingStatus.FAILED
            db.commit()

@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent document activity for dashboard"""
    try:
        documents = db.query(Document).filter(
            Document.user_id == current_user.id
        ).order_by(Document.created_at.desc()).limit(limit).all()
        
        return [
            {
                "id": str(doc.id),
                "originalFilename": doc.original_filename,
                "status": doc.processing_status.value,
                "createdAt": doc.created_at.isoformat(),
                "ocrConfidence": doc.ocr_confidence,
                "aiAnalysis": doc.ai_analysis
            }
            for doc in documents
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch recent activity: {str(e)}")
