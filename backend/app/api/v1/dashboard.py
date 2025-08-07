from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.ai_model import AIModel
from app.models.processing_job import ProcessingJob, JobStatus
from app.schemas.processing_job import DashboardStats, RecentActivity
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Total documents
    total_documents = db.query(Document)\
        .filter(Document.user_id == current_user.id)\
        .count()
    
    # Total models
    total_models = db.query(AIModel)\
        .filter(AIModel.user_id == current_user.id)\
        .count()
    
    # Total processing jobs
    total_jobs = db.query(ProcessingJob)\
        .filter(ProcessingJob.user_id == current_user.id)\
        .count()
    
    # Recent uploads (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_uploads = db.query(Document)\
        .filter(Document.user_id == current_user.id, Document.created_at >= week_ago)\
        .count()
    
    # Processing queue size
    queue_size = db.query(ProcessingJob)\
        .filter(
            ProcessingJob.user_id == current_user.id,
            ProcessingJob.status.in_([JobStatus.QUEUED, JobStatus.PROCESSING])
        )\
        .count()
    
    # Average processing time
    avg_time_result = db.query(func.avg(ProcessingJob.processing_time))\
        .filter(
            ProcessingJob.user_id == current_user.id,
            ProcessingJob.status == JobStatus.COMPLETED,
            ProcessingJob.processing_time.isnot(None)
        )\
        .scalar()
    
    return DashboardStats(
        total_documents=total_documents,
        total_models=total_models,
        total_processing_jobs=total_jobs,
        recent_uploads=recent_uploads,
        processing_queue_size=queue_size,
        avg_processing_time=float(avg_time_result) if avg_time_result else None
    )


@router.get("/recent-activity", response_model=List[RecentActivity])
async def get_recent_activity(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activities = []
    
    # Recent document uploads
    recent_docs = db.query(Document)\
        .filter(Document.user_id == current_user.id)\
        .order_by(desc(Document.created_at))\
        .limit(limit//2)\
        .all()
    
    for doc in recent_docs:
        activities.append(RecentActivity(
            id=str(doc.id),
            type="upload",
            description=f"Uploaded document: {doc.original_filename}",
            timestamp=doc.created_at
        ))
    
    # Recent processing jobs
    recent_jobs = db.query(ProcessingJob)\
        .filter(ProcessingJob.user_id == current_user.id)\
        .order_by(desc(ProcessingJob.created_at))\
        .limit(limit//2)\
        .all()
    
    for job in recent_jobs:
        activities.append(RecentActivity(
            id=str(job.id),
            type="process",
            description=f"Processing job {job.status.value}",
            timestamp=job.created_at
        ))
    
    # Sort by timestamp and return
    activities.sort(key=lambda x: x.timestamp, reverse=True)
    return activities[:limit]


@router.get("/analytics/usage")
async def get_usage_analytics(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Documents uploaded per day
    doc_stats = db.query(
        func.date(Document.created_at).label('date'),
        func.count(Document.id).label('count')
    )\
        .filter(Document.user_id == current_user.id, Document.created_at >= start_date)\
        .group_by(func.date(Document.created_at))\
        .all()
    
    # Processing jobs per day
    job_stats = db.query(
        func.date(ProcessingJob.created_at).label('date'),
        func.count(ProcessingJob.id).label('count')
    )\
        .filter(ProcessingJob.user_id == current_user.id, ProcessingJob.created_at >= start_date)\
        .group_by(func.date(ProcessingJob.created_at))\
        .all()
    
    return {
        "documents_per_day": [{"date": str(stat.date), "count": stat.count} for stat in doc_stats],
        "jobs_per_day": [{"date": str(stat.date), "count": stat.count} for stat in job_stats]
    }


@router.get("/analytics/performance")
async def get_performance_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Model usage statistics
    model_stats = db.query(
        AIModel.name,
        AIModel.usage_count,
        func.avg(ProcessingJob.processing_time).label('avg_time')
    )\
        .join(ProcessingJob)\
        .filter(AIModel.user_id == current_user.id)\
        .group_by(AIModel.id, AIModel.name, AIModel.usage_count)\
        .all()
    
    # Success rate
    total_jobs = db.query(ProcessingJob)\
        .filter(ProcessingJob.user_id == current_user.id)\
        .count()
    
    successful_jobs = db.query(ProcessingJob)\
        .filter(
            ProcessingJob.user_id == current_user.id,
            ProcessingJob.status == JobStatus.COMPLETED
        )\
        .count()
    
    success_rate = (successful_jobs / total_jobs * 100) if total_jobs > 0 else 0
    
    return {
        "model_performance": [
            {
                "name": stat.name,
                "usage_count": stat.usage_count,
                "avg_processing_time": float(stat.avg_time) if stat.avg_time else None
            }
            for stat in model_stats
        ],
        "overall_success_rate": success_rate
    }
