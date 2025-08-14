import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from app.core.security import create_verification_token, create_reset_token
import logging

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def send_verification_email(email: str, name: str):
        """Send email verification"""
        if not all([settings.SMTP_SERVER, settings.SMTP_USERNAME, settings.SMTP_PASSWORD]):
            logger.warning("SMTP not configured, skipping email verification")
            return
        
        try:
            token = create_verification_token(email)
            verification_url = f"http://localhost:3000/verify-email?token={token}"
            
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_USERNAME
            msg['To'] = email
            msg['Subject'] = "Verify Your FlowCraft AI Account"
            
            body = f"""
            Hi {name},
            
            Thank you for signing up for FlowCraft AI!
            
            Please verify your email address by clicking the link below:
            {verification_url}
            
            This link will expire in 24 hours.
            
            If you didn't create this account, please ignore this email.
            
            Best regards,
            FlowCraft AI Team
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)
                
            logger.info(f"Verification email sent to {email}")
            
        except Exception as e:
            logger.error(f"Error sending verification email: {str(e)}")
    
    @staticmethod
    def send_password_reset_email(email: str, name: str):
        """Send password reset email"""
        if not all([settings.SMTP_SERVER, settings.SMTP_USERNAME, settings.SMTP_PASSWORD]):
            logger.warning("SMTP not configured, skipping password reset email")
            return
        
        try:
            token = create_reset_token(email)
            reset_url = f"http://localhost:3000/reset-password?token={token}"
            
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_USERNAME
            msg['To'] = email
            msg['Subject'] = "Reset Your FlowCraft AI Password"
            
            body = f"""
            Hi {name},
            
            You requested to reset your password for your FlowCraft AI account.
            
            Click the link below to reset your password:
            {reset_url}
            
            This link will expire in 1 hour.
            
            If you didn't request this reset, please ignore this email.
            
            Best regards,
            FlowCraft AI Team
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)
                
            logger.info(f"Password reset email sent to {email}")
            
        except Exception as e:
            logger.error(f"Error sending password reset email: {str(e)}")
