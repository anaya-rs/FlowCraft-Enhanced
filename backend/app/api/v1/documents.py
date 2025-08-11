from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime

from app.database import get_db
from app.models import User, Document, ProcessingStatus, DocumentType
from app.core.security import get_current_user
from app.services.document_processor import DocumentProcessor
from app.schemas.document import (
    DocumentResponse, 
    DocumentCreate, 
    DocumentProcess,
    DocumentListResponse
)

router = APIRouter()
document_processor = DocumentProcessor()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a new document"""
    try:
        # Validate file type
        allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg", ".bmp", ".tiff"}
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_extension} not supported. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        filename = f"{file_id}_{file.filename}"
        file_path = os.path.join("uploads", filename)
        
        # Ensure uploads directory exists
        os.makedirs("uploads", exist_ok=True)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Create document record
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
        
        return DocumentResponse(
            id=str(db_document.id),
            filename=db_document.filename,
            original_filename=db_document.original_filename,
            file_size=db_document.file_size,
            mime_type=db_document.mime_type,
            processing_status=db_document.processing_status,
            document_type=db_document.document_type,
            ocr_confidence=db_document.ocr_confidence,
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
                    document_type=doc.document_type,
                    ocr_confidence=doc.ocr_confidence,
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
            document_type=document.document_type,
            ocr_confidence=document.ocr_confidence,
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
        
        # Update status to processing
        document.processing_status = ProcessingStatus.PROCESSING
        db.commit()
        
        # Add background task for processing
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
            document_type=document.document_type,
            ocr_confidence=document.ocr_confidence,
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
        
        # Delete file from disk
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
        
        # Delete from database
        db.delete(document)
        db.commit()
        
        return {"message": "Document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")

async def process_document_background(document_id: str, file_path: str, db: Session):
    """Background task for document processing"""
    try:
        # Get document from database
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            return
        
        # Perform OCR
        ocr_result = await document_processor.ocr_async(file_path)
        
        # Perform AI analysis
        ai_result = await document_processor.ai_analyze_async(ocr_result["text"])
        
        # Update document with results
        document.extracted_text = ocr_result["text"]
        document.ocr_confidence = ocr_result["confidence"]
        document.processing_status = ProcessingStatus.COMPLETED
        document.processed_at = datetime.utcnow()
        document.document_type = DocumentType(ai_result["classification"])
        document.ai_analysis = ai_result
        document.key_value_pairs = ai_result.get("key_value_pairs", {})
        document.entities = ai_result.get("entities", [])
        
        db.commit()
        
    except Exception as e:
        # Update status to failed
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            document.processing_status = ProcessingStatus.FAILED
            db.commit()
        print(f"Document processing failed: {e}")
