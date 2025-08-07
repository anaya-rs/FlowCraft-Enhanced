import os
import boto3
import aiofiles
from typing import BinaryIO
from fastapi import UploadFile
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class StorageService:
    def __init__(self):
        self.use_s3 = settings.USE_S3
        if self.use_s3:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
        else:
            # Ensure upload directory exists
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    async def save_file(self, file: UploadFile, filename: str) -> str:
        """Save uploaded file and return file path"""
        if self.use_s3:
            return await self._save_to_s3(file, filename)
        else:
            return await self._save_locally(file, filename)
    
    async def _save_to_s3(self, file: UploadFile, filename: str) -> str:
        """Save file to AWS S3"""
        try:
            # Upload to S3
            self.s3_client.upload_fileobj(
                file.file,
                settings.S3_BUCKET,
                filename,
                ExtraArgs={'ContentType': file.content_type}
            )
            
            # Return S3 URL
            return f"s3://{settings.S3_BUCKET}/{filename}"
            
        except Exception as e:
            logger.error(f"Error uploading to S3: {str(e)}")
            raise Exception(f"Failed to upload file: {str(e)}")
    
    async def _save_locally(self, file: UploadFile, filename: str) -> str:
        """Save file locally"""
        try:
            file_path = os.path.join(settings.UPLOAD_DIR, filename)
            
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            return file_path
            
        except Exception as e:
            logger.error(f"Error saving file locally: {str(e)}")
            raise Exception(f"Failed to save file: {str(e)}")
    
    async def delete_file(self, file_path: str):
        """Delete file from storage"""
        if self.use_s3 and file_path.startswith('s3://'):
            await self._delete_from_s3(file_path)
        else:
            await self._delete_locally(file_path)
    
    async def _delete_from_s3(self, file_path: str):
        """Delete file from S3"""
        try:
            # Extract bucket and key from S3 URL
            s3_key = file_path.replace(f"s3://{settings.S3_BUCKET}/", "")
            self.s3_client.delete_object(Bucket=settings.S3_BUCKET, Key=s3_key)
        except Exception as e:
            logger.error(f"Error deleting from S3: {str(e)}")
    
    async def _delete_locally(self, file_path: str):
        """Delete file locally"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            logger.error(f"Error deleting local file: {str(e)}")
    
    def get_file_url(self, file_path: str) -> str:
        """Get public URL for file"""
        if self.use_s3 and file_path.startswith('s3://'):
            s3_key = file_path.replace(f"s3://{settings.S3_BUCKET}/", "")
            return self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': settings.S3_BUCKET, 'Key': s3_key},
                ExpiresIn=3600  # 1 hour
            )
        else:
            return f"/files/{os.path.basename(file_path)}"
