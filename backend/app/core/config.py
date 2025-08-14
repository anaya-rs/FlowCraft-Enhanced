import os
from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import validator, field_validator

class Settings(BaseSettings):
    # =============================================================================
    # APPLICATION SETTINGS
    # =============================================================================
    APP_NAME: str = "FlowCraft AI"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # =============================================================================
    # SERVER CONFIGURATION
    # =============================================================================
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    WORKERS: int = int(os.getenv("WORKERS", "4"))
    RELOAD: bool = os.getenv("RELOAD", "true").lower() == "true"
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:3000")
    
    # =============================================================================
    # DATABASE CONFIGURATION
    # =============================================================================
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./flowcraft.db")
    
    # =============================================================================
    # SECURITY & AUTHENTICATION
    # =============================================================================
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # JWT Settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-jwt-secret-key-change-this-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    
    # Password Security
    BCRYPT_ROUNDS: int = int(os.getenv("BCRYPT_ROUNDS", "12"))
    
    # =============================================================================
    # OCR & AI CONFIGURATION
    # =============================================================================
    # OCR Engine Settings
    OCR_ENGINE: str = os.getenv("OCR_ENGINE", "easyocr")
    TESSERACT_PATH: str = os.getenv("TESSERACT_PATH", r'C:\Program Files\Tesseract-OCR\tesseract.exe')
    EASYOCR_LANGUAGES: List[str] = os.getenv("EASYOCR_LANGUAGES", "en").split(",")
    
    # AI Model Settings
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
    AI_TIMEOUT: int = int(os.getenv("AI_TIMEOUT", "300"))
    
    # =============================================================================
    # FILE STORAGE
    # =============================================================================
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "52428800"))  # 50MB
    ALLOWED_EXTENSIONS: str = os.getenv("ALLOWED_EXTENSIONS", "pdf,png,jpg,jpeg,bmp,tiff")
    SUPPORTED_FORMATS: str = os.getenv("SUPPORTED_FORMATS", "pdf,png,jpg,jpeg,bmp,tiff")
    TEMP_DIR: str = os.getenv("TEMP_DIR", "./temp")
    
    # =============================================================================
    # EXPORT & INTEGRATION
    # =============================================================================
    # Export Settings
    EXPORT_FORMATS: str = os.getenv("EXPORT_FORMATS", "json,csv,pdf,excel")
    EXPORT_DIR: str = os.getenv("EXPORT_DIR", "./exports")
    
    # Webhook Settings
    WEBHOOK_TIMEOUT: int = int(os.getenv("WEBHOOK_TIMEOUT", "30"))
    WEBHOOK_RETRY_ATTEMPTS: int = int(os.getenv("WEBHOOK_RETRY_ATTEMPTS", "3"))
    
    # API Settings
    API_RATE_LIMIT: int = int(os.getenv("API_RATE_LIMIT", "100"))
    API_TIMEOUT: int = int(os.getenv("API_TIMEOUT", "30"))
    
    # =============================================================================
    # LOGGING & MONITORING
    # =============================================================================
    LOG_FILE: str = os.getenv("LOG_FILE", "./logs/flowcraft.log")
    LOG_MAX_SIZE: int = int(os.getenv("LOG_MAX_SIZE", "10485760"))  # 10MB
    LOG_BACKUP_COUNT: int = int(os.getenv("LOG_BACKUP_COUNT", "5"))
    
    # =============================================================================
    # DEVELOPMENT SETTINGS
    # =============================================================================
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
    ALLOW_CREDENTIALS: bool = os.getenv("ALLOW_CREDENTIALS", "true").lower() == "true"
    ALLOWED_HOSTS: List[str] = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    
    # =============================================================================
    # COMPUTED PROPERTIES
    # =============================================================================
    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        """Convert CORS_ORIGINS string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        """Get allowed origins for CORS"""
        return self.CORS_ORIGINS_LIST
    
    @property
    def SUPPORTED_FORMATS_LIST(self) -> List[str]:
        """Convert SUPPORTED_FORMATS string to list"""
        return [fmt.strip() for fmt in self.SUPPORTED_FORMATS.split(",")]
    
    @property
    def ALLOWED_EXTENSIONS_LIST(self) -> List[str]:
        """Convert ALLOWED_EXTENSIONS string to list"""
        return [ext.strip() for ext in self.ALLOWED_EXTENSIONS.split(",")]
    
    @property
    def EXPORT_FORMATS_LIST(self) -> List[str]:
        """Convert EXPORT_FORMATS string to list"""
        return [fmt.strip() for fmt in self.EXPORT_FORMATS.split(",")]
    
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
