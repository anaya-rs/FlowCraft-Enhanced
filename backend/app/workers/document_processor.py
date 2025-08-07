from celery import current_task
from app.workers.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.document import Document, ProcessingStatus
from app.models.processing_job import ProcessingJob, JobStatus
from app.models.ai_model import AIModel
from app.services.ocr_service import OCRService
from app.services.ai_service import AIService
import logging
import time
from datetime import datetime

logger = logging.getLogger(__name__)


@celery_app.task(bind=True)
def process_document_task(self, job_id: str):
    """Process document with AI model"""
    db = SessionLocal()
    start_time = time.time()
    
    try:
        # Get processing job
        job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
        if not job:
            logger.error(f"Processing job {job_id} not found")
            return
        
        # Update job status
        job.status = JobStatus.PROCESSING
        db.commit()
        
        # Get related objects
        document = db.query(Document).filter(Document.id == job.document_id).first()
        ai_model = db.query(AIModel).filter(AIModel.id == job.ai_model_id).first()
        
        if not document or not ai_model:
            job.status = JobStatus.FAILED
            job.error_message = "Document or AI model not found"
            db.commit()
            return
        
        # Ensure document has extracted text
        if not document.extracted_text:
            # Run OCR if not already done
            text, confidence = OCRService.extract_text(document.file_path, document.mime_type)
            document.extracted_text = text
            document.ocr_confidence = confidence
            document.processing_status = ProcessingStatus.COMPLETED
            db.commit()
        
        # Update task progress
        self.update_state(state='PROGRESS', meta={'progress': 50})
        
        # Process with AI
        result = AIService.process_document(
            ai_model=ai_model,
            document_text=document.extracted_text,
            additional_context=job.input_data
        )
        
        # Update processing time
        processing_time = time.time() - start_time
        
        if result.get('success'):
            job.status = JobStatus.COMPLETED
            job.result_data = result
            job.processing_time = processing_time
            job.completed_at = datetime.utcnow()
            
            # Update model usage count
            ai_model.usage_count += 1
            
        else:
            job.status = JobStatus.FAILED
            job.error_message = result.get('error', 'Unknown error')
            job.processing_time = processing_time
        
        db.commit()
        
        # Update final progress
        self.update_state(state='SUCCESS', meta={'progress': 100})
        
        logger.info(f"Processing job {job_id} completed with status {job.status}")
        
    except Exception as e:
        logger.error(f"Error processing job {job_id}: {str(e)}")
        
        if job:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            job.processing_time = time.time() - start_time
            db.commit()
        
        # Update task state to failure
        self.update_state(
            state='FAILURE',
            meta={'error': str(e)}
        )
        
    finally:
        db.close()


@celery_app.task
def batch_process_documents_task(job_ids: list):
    """Process multiple documents in batch"""
    for job_id in job_ids:
        process_document_task.delay(job_id)


@celery_app.task
def cleanup_failed_jobs():
    """Clean up old failed jobs"""
    db = SessionLocal()
    try:
        # Delete failed jobs older than 7 days
        cutoff_date = datetime.utcnow() - timedelta(days=7)
        old_jobs = db.query(ProcessingJob)\
            .filter(
                ProcessingJob.status == JobStatus.FAILED,
                ProcessingJob.created_at < cutoff_date
            )\
            .all()
        
        for job in old_jobs:
            db.delete(job)
        
        db.commit()
        logger.info(f"Cleaned up {len(old_jobs)} old failed jobs")
        
    except Exception as e:
        logger.error(f"Error cleaning up failed jobs: {str(e)}")
        db.rollback()
    finally:
        db.close()
