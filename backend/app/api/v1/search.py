from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional
import json
from datetime import datetime, timedelta

from app.database import get_db
from app.models import User, Document, DocumentTag, DocumentTagAssociation, ProcessingStatus, DocumentType
from app.core.security import get_current_user
from app.schemas.search import (
    SearchRequest,
    SearchResponse,
    DocumentSearchResult,
    TagCreate,
    TagUpdate,
    TagResponse,
    BulkOperationRequest,
    BulkOperationResponse
)

router = APIRouter()

@router.post("/documents", response_model=SearchResponse)
async def search_documents(
    search_request: SearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Full-text search across documents with advanced filters"""
    try:
        query = db.query(Document).filter(Document.user_id == current_user.id)
        
        # Text search
        if search_request.query:
            search_terms = search_request.query.split()
            text_conditions = []
            
            for term in search_terms:
                text_conditions.append(
                    or_(
                        Document.filename.ilike(f"%{term}%"),
                        Document.extracted_text.ilike(f"%{term}%"),
                        Document.ai_analysis.cast(String).ilike(f"%{term}%"),
                        Document.key_value_pairs.cast(String).ilike(f"%{term}%")
                    )
                )
            
            if text_conditions:
                query = query.filter(or_(*text_conditions))
        
        # Document type filter
        if search_request.document_type:
            query = query.filter(Document.document_type == search_request.document_type)
        
        # Processing status filter
        if search_request.processing_status:
            query = query.filter(Document.processing_status == search_request.processing_status)
        
        # Confidence range filter
        if search_request.min_confidence is not None:
            query = query.filter(Document.ocr_confidence >= search_request.min_confidence)
        
        if search_request.max_confidence is not None:
            query = query.filter(Document.ocr_confidence <= search_request.max_confidence)
        
        # Date range filter
        if search_request.date_from:
            query = query.filter(Document.created_at >= search_request.date_from)
        
        if search_request.date_to:
            query = query.filter(Document.created_at <= search_request.date_to)
        
        # File size filter
        if search_request.min_file_size:
            query = query.filter(Document.file_size >= search_request.min_file_size)
        
        if search_request.max_file_size:
            query = query.filter(Document.file_size <= search_request.max_file_size)
        
        # Tag filter
        if search_request.tag_ids:
            query = query.join(DocumentTagAssociation).filter(
                DocumentTagAssociation.tag_id.in_(search_request.tag_ids)
            )
        
        # Sort results
        if search_request.sort_by == "date":
            query = query.order_by(Document.created_at.desc())
        elif search_request.sort_by == "name":
            query = query.order_by(Document.filename.asc())
        elif search_request.sort_by == "size":
            query = query.order_by(Document.file_size.desc())
        elif search_request.sort_by == "confidence":
            query = query.order_by(Document.ocr_confidence.desc())
        else:
            query = query.order_by(Document.created_at.desc())
        
        # Pagination
        total_count = query.count()
        if search_request.offset:
            query = query.offset(search_request.offset)
        if search_request.limit:
            query = query.limit(search_request.limit)
        
        documents = query.all()
        
        # Format results
        results = []
        for doc in documents:
            # Get tags for document
            tags = db.query(DocumentTag).join(DocumentTagAssociation).filter(
                DocumentTagAssociation.document_id == doc.id
            ).all()
            
            results.append(DocumentSearchResult(
                id=str(doc.id),
                filename=doc.filename,
                original_filename=doc.original_filename,
                file_size=doc.file_size,
                mime_type=doc.mime_type,
                processing_status=doc.processing_status,
                document_type=doc.document_type,
                ocr_confidence=doc.ocr_confidence,
                created_at=doc.created_at,
                processed_at=doc.processed_at,
                tags=[TagResponse(
                    id=str(tag.id),
                    name=tag.name,
                    color=tag.color,
                    description=tag.description
                ) for tag in tags],
                key_value_pairs=doc.key_value_pairs or {},
                entities=doc.entities or []
            ))
        
        return SearchResponse(
            results=results,
            total_count=total_count,
            query=search_request.query,
            filters_applied={
                "document_type": search_request.document_type,
                "processing_status": search_request.processing_status,
                "confidence_range": f"{search_request.min_confidence or 0}-{search_request.max_confidence or 1}",
                "date_range": f"{search_request.date_from or 'any'}-{search_request.date_to or 'any'}",
                "tag_count": len(search_request.tag_ids) if search_request.tag_ids else 0
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/documents/quick", response_model=List[DocumentSearchResult])
async def quick_search(
    q: str = Query(..., description="Quick search query"),
    limit: int = Query(10, description="Maximum results to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Quick search for documents"""
    try:
        query = db.query(Document).filter(
            Document.user_id == current_user.id,
            or_(
                Document.filename.ilike(f"%{q}%"),
                Document.extracted_text.ilike(f"%{q}%")
            )
        ).limit(limit)
        
        documents = query.all()
        
        results = []
        for doc in documents:
            tags = db.query(DocumentTag).join(DocumentTagAssociation).filter(
                DocumentTagAssociation.document_id == doc.id
            ).all()
            
            results.append(DocumentSearchResult(
                id=str(doc.id),
                filename=doc.filename,
                original_filename=doc.original_filename,
                file_size=doc.file_size,
                mime_type=doc.mime_type,
                processing_status=doc.processing_status,
                document_type=doc.document_type,
                ocr_confidence=doc.ocr_confidence,
                created_at=doc.created_at,
                processed_at=doc.processed_at,
                tags=[TagResponse(
                    id=str(tag.id),
                    name=tag.name,
                    color=tag.color,
                    description=tag.description
                ) for tag in tags],
                key_value_pairs=doc.key_value_pairs or {},
                entities=doc.entities or []
            ))
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quick search failed: {str(e)}")

@router.get("/tags", response_model=List[TagResponse])
async def get_tags(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tags for current user"""
    tags = db.query(DocumentTag).filter(
        DocumentTag.user_id == current_user.id
    ).all()
    
    return [
        TagResponse(
            id=str(tag.id),
            name=tag.name,
            color=tag.color,
            description=tag.description,
            created_at=tag.created_at
        )
        for tag in tags
    ]

@router.post("/tags", response_model=TagResponse)
async def create_tag(
    tag: TagCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new tag"""
    try:
        db_tag = DocumentTag(
            user_id=current_user.id,
            name=tag.name,
            color=tag.color or "#ff6b35",
            description=tag.description
        )
        
        db.add(db_tag)
        db.commit()
        db.refresh(db_tag)
        
        return TagResponse(
            id=str(db_tag.id),
            name=db_tag.name,
            color=db_tag.color,
            description=db_tag.description,
            created_at=db_tag.created_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create tag: {str(e)}")

@router.put("/tags/{tag_id}", response_model=TagResponse)
async def update_tag(
    tag_id: str,
    tag_update: TagUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update tag"""
    try:
        db_tag = db.query(DocumentTag).filter(
            DocumentTag.id == tag_id,
            DocumentTag.user_id == current_user.id
        ).first()
        
        if not db_tag:
            raise HTTPException(status_code=404, detail="Tag not found")
        
        # Update fields
        for field, value in tag_update.dict(exclude_unset=True).items():
            setattr(db_tag, field, value)
        
        db.commit()
        db.refresh(db_tag)
        
        return TagResponse(
            id=str(db_tag.id),
            name=db_tag.name,
            color=db_tag.color,
            description=db_tag.description,
            created_at=db_tag.created_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update tag: {str(e)}")

@router.delete("/tags/{tag_id}")
async def delete_tag(
    tag_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete tag and remove from all documents"""
    try:
        db_tag = db.query(DocumentTag).filter(
            DocumentTag.id == tag_id,
            DocumentTag.user_id == current_user.id
        ).first()
        
        if not db_tag:
            raise HTTPException(status_code=404, detail="Tag not found")
        
        # Remove tag associations
        db.query(DocumentTagAssociation).filter(
            DocumentTagAssociation.tag_id == tag_id
        ).delete()
        
        # Delete tag
        db.delete(db_tag)
        db.commit()
        
        return {"message": "Tag deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete tag: {str(e)}")

@router.post("/documents/{document_id}/tags/{tag_id}")
async def add_tag_to_document(
    document_id: str,
    tag_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add tag to document"""
    try:
        # Verify document belongs to user
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Verify tag belongs to user
        tag = db.query(DocumentTag).filter(
            DocumentTag.id == tag_id,
            DocumentTag.user_id == current_user.id
        ).first()
        
        if not tag:
            raise HTTPException(status_code=404, detail="Tag not found")
        
        # Check if association already exists
        existing = db.query(DocumentTagAssociation).filter(
            DocumentTagAssociation.document_id == document_id,
            DocumentTagAssociation.tag_id == tag_id
        ).first()
        
        if existing:
            return {"message": "Tag already assigned to document"}
        
        # Create association
        association = DocumentTagAssociation(
            document_id=document_id,
            tag_id=tag_id
        )
        
        db.add(association)
        db.commit()
        
        return {"message": "Tag added to document successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add tag: {str(e)}")

@router.delete("/documents/{document_id}/tags/{tag_id}")
async def remove_tag_from_document(
    document_id: str,
    tag_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove tag from document"""
    try:
        # Verify document belongs to user
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Remove association
        db.query(DocumentTagAssociation).filter(
            DocumentTagAssociation.document_id == document_id,
            DocumentTagAssociation.tag_id == tag_id
        ).delete()
        
        db.commit()
        
        return {"message": "Tag removed from document successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to remove tag: {str(e)}")

@router.post("/bulk", response_model=BulkOperationResponse)
async def bulk_operation(
    bulk_request: BulkOperationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perform bulk operations on documents"""
    try:
        # Verify documents belong to user
        documents = db.query(Document).filter(
            Document.id.in_(bulk_request.document_ids),
            Document.user_id == current_user.id
        ).all()
        
        if not documents:
            raise HTTPException(status_code=404, detail="No documents found")
        
        success_count = 0
        failed_count = 0
        errors = []
        
        for document in documents:
            try:
                if bulk_request.operation == "delete":
                    # Remove tag associations
                    db.query(DocumentTagAssociation).filter(
                        DocumentTagAssociation.document_id == document.id
                    ).delete()
                    
                    # Delete document file
                    if os.path.exists(document.file_path):
                        os.remove(document.file_path)
                    
                    # Delete document record
                    db.delete(document)
                    success_count += 1
                
                elif bulk_request.operation == "reprocess":
                    # Reset processing status
                    document.processing_status = ProcessingStatus.UPLOADED
                    document.processed_at = None
                    document.ai_analysis = None
                    document.key_value_pairs = None
                    document.entities = None
                    success_count += 1
                
                elif bulk_request.operation == "add_tags":
                    # Add tags to document
                    if bulk_request.tag_ids:
                        for tag_id in bulk_request.tag_ids:
                            # Check if association exists
                            existing = db.query(DocumentTagAssociation).filter(
                                DocumentTagAssociation.document_id == document.id,
                                DocumentTagAssociation.tag_id == tag_id
                            ).first()
                            
                            if not existing:
                                association = DocumentTagAssociation(
                                    document_id=document.id,
                                    tag_id=tag_id
                                )
                                db.add(association)
                        success_count += 1
                
                elif bulk_request.operation == "remove_tags":
                    # Remove tags from document
                    if bulk_request.tag_ids:
                        db.query(DocumentTagAssociation).filter(
                            DocumentTagAssociation.document_id == document.id,
                            DocumentTagAssociation.tag_id.in_(bulk_request.tag_ids)
                        ).delete()
                        success_count += 1
                
            except Exception as e:
                failed_count += 1
                errors.append(f"Document {document.filename}: {str(e)}")
        
        db.commit()
        
        return BulkOperationResponse(
            operation=bulk_request.operation,
            total_documents=len(documents),
            success_count=success_count,
            failed_count=failed_count,
            errors=errors
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Bulk operation failed: {str(e)}")

@router.get("/stats")
async def get_search_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get search and document statistics"""
    try:
        # Document counts by type
        type_counts = db.query(
            Document.document_type,
            func.count(Document.id)
        ).filter(
            Document.user_id == current_user.id
        ).group_by(Document.document_type).all()
        
        # Processing status counts
        status_counts = db.query(
            Document.processing_status,
            func.count(Document.id)
        ).filter(
            Document.user_id == current_user.id
        ).group_by(Document.processing_status).all()
        
        # Tag counts
        tag_counts = db.query(
            DocumentTag.name,
            func.count(DocumentTagAssociation.document_id)
        ).join(DocumentTagAssociation).filter(
            DocumentTag.user_id == current_user.id
        ).group_by(DocumentTag.name).all()
        
        # Total storage used
        total_size = db.query(func.sum(Document.file_size)).filter(
            Document.user_id == current_user.id
        ).scalar() or 0
        
        return {
            "document_type_counts": dict(type_counts),
            "processing_status_counts": dict(status_counts),
            "tag_counts": dict(tag_counts),
            "total_documents": sum(count for _, count in type_counts),
            "total_storage_bytes": total_size,
            "total_storage_mb": round(total_size / (1024 * 1024), 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")
