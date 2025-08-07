from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "flowcraft",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.workers.document_processor",
        "app.workers.email_worker"
    ]
)

# Configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "app.workers.document_processor.*": {"queue": "document_processing"},
        "app.workers.email_worker.*": {"queue": "email"}
    },
    task_annotations={
        "*": {"rate_limit": "100/m"}
    }
)
