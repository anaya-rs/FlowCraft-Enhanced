from app.workers.celery_app import celery_app
from app.services.email_service import EmailService
import logging

logger = logging.getLogger(__name__)


@celery_app.task
def send_verification_email_task(email: str, name: str):
    """Send verification email asynchronously"""
    try:
        EmailService.send_verification_email(email, name)
        logger.info(f"Verification email queued for {email}")
    except Exception as e:
        logger.error(f"Error sending verification email to {email}: {str(e)}")


@celery_app.task
def send_password_reset_email_task(email: str, name: str):
    """Send password reset email asynchronously"""
    try:
        EmailService.send_password_reset_email(email, name)
        logger.info(f"Password reset email queued for {email}")
    except Exception as e:
        logger.error(f"Error sending password reset email to {email}: {str(e)}")
