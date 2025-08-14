from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import secrets
import string
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Document, DocumentShare, User
from app.schemas.document import (
    DocumentShareCreate, 
    DocumentShareResponse, 
    DocumentShareUpdate,
    DocumentShareList
)
from app.core.security import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/sharing", tags=["Document Sharing"])

def generate_share_token(length: int = 32) -> str:
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_share_link(share_token: str) -> str:
    base_url = settings.BASE_URL or "http://localhost:3000"
    return f"{base_url}/shared/{share_token}"

@router.post("/documents/{document_id}/share", response_model=DocumentShareResponse)
async def share_document(
    document_id: str,
    share_data: DocumentShareCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    share_token = generate_share_token()
    
    # Generate API key if API endpoint is enabled
    api_key = None
    if share_data.api_endpoint_enabled:
        api_key = f"api_{generate_share_token(24)}"
    
    share = DocumentShare(
        document_id=document_id,
        shared_by=current_user.id,
        recipient_email=share_data.recipient_email,
        recipient_name=share_data.recipient_name,
        access_level=share_data.access_level,
        share_token=share_token,
        expires_at=share_data.expires_at,
        message=share_data.message,
        is_active=True,
        
        # API Endpoint Configuration
        api_endpoint_enabled=share_data.api_endpoint_enabled or False,
        api_key=api_key,
        api_permissions=share_data.api_permissions,
        
        # Webhook Configuration
        webhook_url=share_data.webhook_url,
        webhook_events=share_data.webhook_events,
        webhook_secret=share_data.webhook_secret,
        webhook_active=bool(share_data.webhook_url and share_data.webhook_secret),
        
        # Export Configuration
        export_directory=share_data.export_directory,
        export_format=share_data.export_format,
        auto_export=share_data.auto_export or False,
        compression=share_data.compression if share_data.compression is not None else True
    )
    
    if share_data.public_link:
        share.share_link = generate_share_link(share_token)
    
    db.add(share)
    db.commit()
    db.refresh(share)
    
    return DocumentShareResponse(
        id=str(share.id),
        document_id=str(share.document_id),
        document_name=document.original_filename,
        shared_by=f"{current_user.first_name} {current_user.last_name}",
        recipient_email=share.recipient_email,
        recipient_name=share.recipient_name,
        access_level=share.access_level,
        share_link=share.share_link,
        expires_at=share.expires_at,
        message=share.message,
        
        # API Endpoint Configuration
        api_endpoint_enabled=share.api_endpoint_enabled,
        api_key=share.api_key,
        api_permissions=share.api_permissions,
        
        # Webhook Configuration
        webhook_url=share.webhook_url,
        webhook_events=share.webhook_events,
        webhook_secret=share.webhook_secret,
        webhook_active=share.webhook_active,
        
        # Export Configuration
        export_directory=share.export_directory,
        export_format=share.export_format,
        auto_export=share.auto_export,
        compression=share.compression,
        
        created_at=share.created_at,
        is_active=share.is_active
    )

@router.get("/documents/{document_id}/shares", response_model=DocumentShareList)
async def get_document_shares(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    shares_query = db.query(DocumentShare).filter(
        DocumentShare.document_id == document_id
    )
    
    total = shares_query.count()
    shares = shares_query.offset(skip).limit(limit).all()
    
    share_responses = []
    for share in shares:
        share_responses.append(DocumentShareResponse(
            id=str(share.id),
            document_id=str(share.document_id),
            document_name=document.original_filename,
            shared_by=f"{current_user.first_name} {current_user.last_name}",
            recipient_email=share.recipient_email,
            recipient_name=share.recipient_name,
            access_level=share.access_level,
            share_link=share.share_link,
            expires_at=share.expires_at,
            message=share.message,
            
            # API Endpoint Configuration
            api_endpoint_enabled=share.api_endpoint_enabled,
            api_key=share.api_key,
            api_permissions=share.api_permissions,
            
            # Webhook Configuration
            webhook_url=share.webhook_url,
            webhook_events=share.webhook_events,
            webhook_secret=share.webhook_secret,
            webhook_active=share.webhook_active,
            
            # Export Configuration
            export_directory=share.export_directory,
            export_format=share.export_format,
            auto_export=share.auto_export,
            compression=share.compression,
            
            created_at=share.created_at,
            is_active=share.is_active
        ))
    
    return DocumentShareList(
        shares=share_responses,
        total=total
    )

@router.get("/shares", response_model=DocumentShareList)
async def get_user_shares(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    shares_query = db.query(DocumentShare).filter(
        DocumentShare.shared_by == current_user.id
    )
    
    total = shares_query.count()
    shares = shares_query.offset(skip).limit(limit).all()
    
    share_responses = []
    for share in shares:
        document = db.query(Document).filter(Document.id == share.document_id).first()
        if document:
            share_responses.append(DocumentShareResponse(
                id=str(share.id),
                document_id=str(share.document_id),
                document_name=document.original_filename,
                shared_by=f"{current_user.first_name} {current_user.last_name}",
                recipient_email=share.recipient_email,
                recipient_name=share.recipient_name,
                access_level=share.access_level,
                share_link=share.share_link,
                expires_at=share.expires_at,
                message=share.message,
                
                # API Endpoint Configuration
                api_endpoint_enabled=share.api_endpoint_enabled,
                api_key=share.api_key,
                api_permissions=share.api_permissions,
                
                # Webhook Configuration
                webhook_url=share.webhook_url,
                webhook_events=share.webhook_events,
                webhook_secret=share.webhook_secret,
                webhook_active=share.webhook_active,
                
                # Export Configuration
                export_directory=share.export_directory,
                export_format=share.export_format,
                auto_export=share.auto_export,
                compression=share.compression,
                
                created_at=share.created_at,
                is_active=share.is_active
            ))
    
    return DocumentShareList(
        shares=share_responses,
        total=total
    )

@router.put("/shares/{share_id}", response_model=DocumentShareResponse)
async def update_share(
    share_id: str,
    share_update: DocumentShareUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    share = db.query(DocumentShare).filter(
        DocumentShare.id == share_id,
        DocumentShare.shared_by == current_user.id
    ).first()
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found or access denied"
        )
    
    if share_update.access_level is not None:
        share.access_level = share_update.access_level
    if share_update.expires_at is not None:
        share.expires_at = share_update.expires_at
    if share_update.message is not None:
        share.message = share_update.message
    if share_update.is_active is not None:
        share.is_active = share_update.is_active
    
    share.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(share)
    
    document = db.query(Document).filter(Document.id == share.document_id).first()
    
    return DocumentShareResponse(
        id=str(share.id),
        document_id=str(share.document_id),
        document_name=document.original_filename if document else "Unknown",
        shared_by=f"{current_user.first_name} {current_user.last_name}",
        recipient_email=share.recipient_email,
        recipient_name=share.recipient_name,
        access_level=share.access_level,
        share_link=share.share_link,
        expires_at=share.expires_at,
        message=share.message,
        
        # API Endpoint Configuration
        api_endpoint_enabled=share.api_endpoint_enabled,
        api_key=share.api_key,
        api_permissions=share.api_permissions,
        
        # Webhook Configuration
        webhook_url=share.webhook_url,
        webhook_events=share.webhook_events,
        webhook_secret=share.webhook_secret,
        webhook_active=share.webhook_active,
        
        # Export Configuration
        export_directory=share.export_directory,
        export_format=share.export_format,
        auto_export=share.auto_export,
        compression=share.compression,
        
        created_at=share.created_at,
        is_active=share.is_active
    )

@router.delete("/shares/{share_id}")
async def delete_share(
    share_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    share = db.query(DocumentShare).filter(
        DocumentShare.id == share_id,
        DocumentShare.shared_by == current_user.id
    ).first()
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found or access denied"
        )
    
    db.delete(share)
    db.commit()
    
    return {"message": "Share deleted successfully"}

@router.get("/shared/{share_token}")
async def access_shared_document(
    share_token: str,
    db: Session = Depends(get_db)
):
    share = db.query(DocumentShare).filter(
        DocumentShare.share_token == share_token,
        DocumentShare.is_active == True
    ).first()
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found or has expired"
        )
    
    if share.expires_at and share.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Share has expired"
        )
    
    document = db.query(Document).filter(Document.id == share.document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared document not found"
        )
    
    response_data = {
        "document_id": str(document.id),
        "filename": document.original_filename,
        "file_size": document.file_size,
        "mime_type": document.mime_type,
        "created_at": document.created_at,
        "access_level": share.access_level,
        "shared_by": "Anonymous",
        "message": share.message
    }
    
    if share.access_level in ["comment", "edit"]:
        response_data.update({
            "extracted_text": document.extracted_text,
            "ocr_confidence": document.ocr_confidence,
            "document_type": document.document_type,
            "ai_analysis": document.ai_analysis,
            "key_value_pairs": document.key_value_pairs,
            "entities": document.entities
        })
    
    return response_data

@router.post("/shares/{share_id}/revoke")
async def revoke_share(
    share_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    share = db.query(DocumentShare).filter(
        DocumentShare.id == share_id,
        DocumentShare.shared_by == current_user.id
    ).first()
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found or access denied"
        )
    
    share.is_active = False
    share.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Share revoked successfully"}

@router.post("/shares/{share_id}/extend")
async def extend_share(
    share_id: str,
    days: int = Query(30, ge=1, le=365, description="Number of days to extend"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    share = db.query(DocumentShare).filter(
        DocumentShare.id == share_id,
        DocumentShare.shared_by == current_user.id
    ).first()
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found or access denied"
        )
    
    if share.expires_at:
        share.expires_at = share.expires_at + timedelta(days=days)
    else:
        share.expires_at = datetime.utcnow() + timedelta(days=days)
    
    share.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": f"Share extended by {days} days", "new_expires_at": share.expires_at}

# New API endpoints for API key access
@router.get("/api/{api_key}/document")
async def access_document_via_api(
    api_key: str,
    db: Session = Depends(get_db)
):
    """Access a shared document using an API key"""
    share = db.query(DocumentShare).filter(
        DocumentShare.api_key == api_key,
        DocumentShare.api_endpoint_enabled == True,
        DocumentShare.is_active == True
    ).first()
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid API key or access denied"
        )
    
    if share.expires_at and share.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="API access has expired"
        )
    
    document = db.query(Document).filter(Document.id == share.document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared document not found"
        )
    
    # Check API permissions
    permissions = share.api_permissions or {}
    read_access = permissions.get("read", True)
    full_access = permissions.get("full_access", False)
    
    if not read_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient API permissions"
        )
    
    response_data = {
        "document_id": str(document.id),
        "filename": document.original_filename,
        "file_size": document.file_size,
        "mime_type": document.mime_type,
        "created_at": document.created_at,
        "access_level": share.access_level,
        "api_permissions": share.api_permissions,
        "message": share.message
    }
    
    # Include additional data based on permissions
    if full_access or share.access_level in ["comment", "edit"]:
        response_data.update({
            "extracted_text": document.extracted_text,
            "ocr_confidence": document.ocr_confidence,
            "document_type": document.document_type,
            "ai_analysis": document.ai_analysis,
            "key_value_pairs": document.key_value_pairs,
            "entities": document.entities
        })
    
    # Trigger webhook if configured
    if share.webhook_active and share.webhook_url:
        # This would typically be done asynchronously
        # For now, we'll just log it
        print(f"Webhook triggered for document {document.id} to {share.webhook_url}")
    
    # Auto-export if configured
    if share.auto_export and share.export_directory:
        # This would typically be done asynchronously
        # For now, we'll just log it
        print(f"Auto-export triggered for document {document.id} to {share.export_directory}")
    
    return response_data

@router.post("/webhooks/{share_id}/trigger")
async def trigger_webhook(
    share_id: str,
    event: str = Query(..., description="Event type to trigger"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually trigger a webhook for a specific share"""
    share = db.query(DocumentShare).filter(
        DocumentShare.id == share_id,
        DocumentShare.shared_by == current_user.id
    ).first()
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found or access denied"
        )
    
    if not share.webhook_active or not share.webhook_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook not configured for this share"
        )
    
    if share.webhook_events and event not in share.webhook_events:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Event '{event}' not allowed for this webhook"
        )
    
    # Here you would implement the actual webhook sending logic
    # For now, we'll return a success message
    return {
        "message": f"Webhook triggered successfully",
        "webhook_url": share.webhook_url,
        "event": event,
        "timestamp": datetime.utcnow()
    }

@router.get("/api/{api_key}/status")
async def get_api_status(
    api_key: str,
    db: Session = Depends(get_db)
):
    """Get the status and configuration of an API key"""
    share = db.query(DocumentShare).filter(
        DocumentShare.api_key == api_key,
        DocumentShare.api_endpoint_enabled == True
    ).first()
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid API key"
        )
    
    document = db.query(Document).filter(Document.id == share.document_id).first()
    
    return {
        "api_key": share.api_key,
        "document_id": str(share.document_id),
        "document_name": document.original_filename if document else "Unknown",
        "access_level": share.access_level,
        "api_permissions": share.api_permissions,
        "webhook_active": share.webhook_active,
        "webhook_url": share.webhook_url,
        "export_directory": share.export_directory,
        "auto_export": share.auto_export,
        "expires_at": share.expires_at,
        "is_active": share.is_active,
        "created_at": share.created_at
    }
