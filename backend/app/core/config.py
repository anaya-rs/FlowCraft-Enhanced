import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import validator

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "FlowCraft AI"
    VERSION: str = "1.0.0"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./flowcraft.db")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # OCR Settings
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", r'C:\Program Files\Tesseract-OCR\tesseract.exe')
    EASYOCR_LANGUAGES: list = ['en']
    EASYOCR_GPU: bool = False
    
    # AI Settings
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    PHI3_MODEL: str = os.getenv("PHI3_MODEL", "phi3")
    
    # File Processing
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads/")
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    SUPPORTED_FORMATS: list = [".pdf", ".png", ".jpg", ".jpeg", ".bmp", ".tiff"]
    
    # Export Settings
    EXPORT_DIR: str = os.getenv("EXPORT_DIR", "exports/")
    WEBHOOK_TIMEOUT: int = 30
    
    # Security
    CORS_ORIGINS: list = ["*"]
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 3600
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/flowcraft.log"
    
    # Production
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    @validator("DATABASE_URL")
    def validate_database_url(cls, v):
        if not v:
            raise ValueError("DATABASE_URL must be set")
        return v
    
    @validator("SECRET_KEY")
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
