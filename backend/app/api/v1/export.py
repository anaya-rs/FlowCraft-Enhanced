from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import csv
import os
import requests
from datetime import datetime
import uuid

from app.database import get_db
from app.models import User, Document, ExportConfig, ExportFormat
from app.core.security import get_current_user
from app.services.export_service import ExportService
from app.schemas.export import (
    ExportRequest, 
    ExportResponse, 
    ExportConfigCreate, 
    ExportConfigUpdate,
    ExportConfigResponse,
    BatchExportRequest,
    WebhookConfig
)

router = APIRouter()
export_service = ExportService()

@router.post("/", response_model=ExportResponse)
async def export_document(
    export_request: ExportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export a single document in specified format"""
    try:
        # Get document
        document = db.query(Document).filter(
            Document.id == export_request.document_id,
            Document.user_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get export config if specified
        export_config = None
        if export_request.export_config_id:
            export_config = db.query(ExportConfig).filter(
                ExportConfig.id == export_request.export_config_id,
                ExportConfig.user_id == current_user.id
            ).first()
        
        # Export document
        result = await export_service.export_document(
            document=document,
            export_format=export_request.export_format,
            export_config=export_config,
            template_name=export_request.template_name
        )
        
        return ExportResponse(
            success=True,
            export_id=str(uuid.uuid4()),
            file_path=result.get("file_path"),
            download_url=f"/api/v1/export/download/{result.get('export_id')}",
            format=export_request.export_format,
            exported_at=datetime.utcnow()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/batch", response_model=List[ExportResponse])
async def batch_export(
    batch_request: BatchExportRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export multiple documents in batch"""
    try:
        # Get documents
        documents = db.query(Document).filter(
            Document.id.in_(batch_request.document_ids),
            Document.user_id == current_user.id
        ).all()
        
        if not documents:
            raise HTTPException(status_code=404, detail="No documents found")
        
        # Get export config
        export_config = None
        if batch_request.export_config_id:
            export_config = db.query(ExportConfig).filter(
                ExportConfig.id == batch_request.export_config_id,
                ExportConfig.user_id == current_user.id
            ).first()
        
        # Start batch export in background
        background_tasks.add_task(
            export_service.batch_export,
            documents=documents,
            export_format=batch_request.export_format,
            export_config=export_config,
            template_name=batch_request.template_name
        )
        
        return [
            ExportResponse(
                success=True,
                export_id=str(uuid.uuid4()),
                status="queued",
                format=batch_request.export_format,
                exported_at=datetime.utcnow()
            )
            for _ in documents
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch export failed: {str(e)}")

@router.get("/configs", response_model=List[ExportConfigResponse])
async def get_export_configs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's export configurations"""
    configs = db.query(ExportConfig).filter(
        ExportConfig.user_id == current_user.id
    ).all()
    
    return [
        ExportConfigResponse(
            id=str(config.id),
            name=config.name,
            description=config.description,
            export_format=config.export_format,
            template_config=config.template_config,
            webhook_url=config.webhook_url,
            auto_export=config.auto_export,
            export_directory=config.export_directory,
            created_at=config.created_at,
            updated_at=config.updated_at
        )
        for config in configs
    ]

@router.post("/configs", response_model=ExportConfigResponse)
async def create_export_config(
    config: ExportConfigCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new export configuration"""
    try:
        db_config = ExportConfig(
            user_id=current_user.id,
            name=config.name,
            description=config.description,
            export_format=config.export_format,
            template_config=config.template_config,
            webhook_url=config.webhook_url,
            webhook_headers=config.webhook_headers,
            auto_export=config.auto_export,
            export_directory=config.export_directory
        )
        
        db.add(db_config)
        db.commit()
        db.refresh(db_config)
        
        return ExportConfigResponse(
            id=str(db_config.id),
            name=db_config.name,
            description=db_config.description,
            export_format=db_config.export_format,
            template_config=db_config.template_config,
            webhook_url=db_config.webhook_url,
            auto_export=db_config.auto_export,
            export_directory=db_config.export_directory,
            created_at=db_config.created_at,
            updated_at=db_config.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create export config: {str(e)}")

@router.put("/configs/{config_id}", response_model=ExportConfigResponse)
async def update_export_config(
    config_id: str,
    config_update: ExportConfigUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update export configuration"""
    try:
        db_config = db.query(ExportConfig).filter(
            ExportConfig.id == config_id,
            ExportConfig.user_id == current_user.id
        ).first()
        
        if not db_config:
            raise HTTPException(status_code=404, detail="Export config not found")
        
        # Update fields
        for field, value in config_update.dict(exclude_unset=True).items():
            setattr(db_config, field, value)
        
        db_config.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_config)
        
        return ExportConfigResponse(
            id=str(db_config.id),
            name=db_config.name,
            description=db_config.description,
            export_format=db_config.export_format,
            template_config=db_config.template_config,
            webhook_url=db_config.webhook_url,
            auto_export=db_config.auto_export,
            export_directory=db_config.export_directory,
            created_at=db_config.created_at,
            updated_at=db_config.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update export config: {str(e)}")

@router.delete("/configs/{config_id}")
async def delete_export_config(
    config_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete export configuration"""
    try:
        db_config = db.query(ExportConfig).filter(
            ExportConfig.id == config_id,
            ExportConfig.user_id == current_user.id
        ).first()
        
        if not db_config:
            raise HTTPException(status_code=404, detail="Export config not found")
        
        db.delete(db_config)
        db.commit()
        
        return {"message": "Export config deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete export config: {str(e)}")

@router.get("/templates")
async def get_export_templates():
    """Get available export templates"""
    templates = export_service.get_available_templates()
    return {"templates": templates}

@router.post("/webhook-test")
async def test_webhook(
    webhook_config: WebhookConfig,
    current_user: User = Depends(get_current_user)
):
    """Test webhook configuration"""
    try:
        success = await export_service.test_webhook(webhook_config)
        return {
            "success": success,
            "message": "Webhook test completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook test failed: {str(e)}")

@router.get("/download/{export_id}")
async def download_export(
    export_id: str,
    current_user: User = Depends(get_current_user)
):
    """Download exported file"""
    try:
        file_path = await export_service.get_export_file_path(export_id, current_user.id)
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Export file not found")
        
        # Return file for download
        return {"file_path": file_path, "download_ready": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

@router.get("/status/{export_id}")
async def get_export_status(
    export_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get export processing status"""
    try:
        status = await export_service.get_export_status(export_id, current_user.id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get export status: {str(e)}")
