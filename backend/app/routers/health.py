"""
Health Check Router
Provides health monitoring and status endpoints for FlowCraft AI
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.config import settings
import psutil
import os
from datetime import datetime

router = APIRouter()

@router.get("/")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "service": "FlowCraft AI",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@router.get("/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """Detailed health check with system metrics"""
    try:
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Database health
        try:
            # Simple database query to check connectivity
            db.execute("SELECT 1")
            db_status = "healthy"
        except Exception as e:
            db_status = f"unhealthy: {str(e)}"
        
        # File system health
        upload_dir_exists = os.path.exists(settings.UPLOAD_DIR)
        export_dir_exists = os.path.exists(settings.EXPORT_DIR)
        
        return {
            "status": "healthy",
            "service": "FlowCraft AI",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available": f"{memory.available / (1024**3):.2f} GB",
                "disk_percent": disk.percent,
                "disk_free": f"{disk.free / (1024**3):.2f} GB"
            },
            "database": {
                "status": db_status
            },
            "filesystem": {
                "upload_dir": upload_dir_exists,
                "export_dir": export_dir_exists
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "FlowCraft AI",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }

@router.get("/ready")
async def readiness_check():
    """Readiness check for Kubernetes/container orchestration"""
    return {
        "status": "ready",
        "service": "FlowCraft AI",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/live")
async def liveness_check():
    """Liveness check for Kubernetes/container orchestration"""
    return {
        "status": "alive",
        "service": "FlowCraft AI",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/services")
async def services_health_check():
    """Check health of external services and dependencies"""
    from app.services.ai_service import AIService
    from app.services.document_processor import DocumentProcessor
    
    # Check AI service
    ai_service = AIService()
    ai_health = ai_service.health_check()
    
    # Check document processor
    doc_processor = DocumentProcessor()
    
    return {
        "status": "checking",
        "service": "FlowCraft AI",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "ai_service": ai_health,
            "document_processor": {
                "tesseract_path": settings.TESSERACT_PATH,
                "tesseract_available": os.path.exists(settings.TESSERACT_PATH) if settings.TESSERACT_PATH else False,
                "easyocr_available": doc_processor.easyocr_reader is not None,
                "upload_dir": settings.UPLOAD_DIR,
                "upload_dir_exists": os.path.exists(settings.UPLOAD_DIR)
            }
        },
        "configuration": {
            "ollama_url": settings.OLLAMA_BASE_URL,
            "ollama_model": settings.OLLAMA_MODEL,
            "max_file_size": f"{settings.MAX_FILE_SIZE / (1024*1024):.1f} MB",
            "allowed_extensions": settings.ALLOWED_EXTENSIONS
        }
    }