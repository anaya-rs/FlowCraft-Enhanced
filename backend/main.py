#!/usr/bin/env python3
"""
FlowCraft AI - Main Application Entry Point
Privacy-first document processing platform with AI-powered intelligence
"""

import os
import sys
import subprocess
import time
import signal
from pathlib import Path
from contextlib import asynccontextmanager

sys.path.append(str(Path(__file__).parent / "app"))

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

from app.api.v1 import api_v1_router
from app.routers import health, sharing
from app.core.config import settings
from app.core.database import create_tables
from app.core.logging import setup_logging

logger = setup_logging()
ollama_process = None

def start_ollama():
    """Initialize Ollama service for AI functionality"""
    global ollama_process
    try:
        result = subprocess.run(['ollama', 'list'], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            logger.info("Ollama service is running")
            return True
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    try:
        logger.info("Starting Ollama service...")
        ollama_process = subprocess.Popen(
            ['ollama', 'serve'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            preexec_fn=os.setsid if os.name != 'nt' else None
        )
        
        time.sleep(3)
        
        result = subprocess.run(['ollama', 'list'], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            logger.info("Ollama service started successfully")
            
            try:
                logger.info("Ensuring Llama3.1 model is available...")
                subprocess.run(['ollama', 'pull', 'llama3.1:8b'], check=True, timeout=120)
                logger.info("Llama3.1 model ready")
            except subprocess.TimeoutExpired:
                logger.warning("Llama3.1 model pull timed out, but Ollama is running")
            except Exception as e:
                logger.warning(f"Could not pull Llama3.1 model: {e}")
            
            return True
        else:
            logger.error("Failed to start Ollama service")
            return False
            
    except Exception as e:
        logger.error(f"Error starting Ollama: {e}")
        return False

def stop_ollama():
    """Terminate Ollama service"""
    global ollama_process
    if ollama_process:
        try:
            if os.name != 'nt':
                os.killpg(os.getpgid(ollama_process.pid), signal.SIGTERM)
            else:
                ollama_process.terminate()
            ollama_process.wait(timeout=5)
            logger.info("Ollama service stopped")
        except Exception as e:
            logger.error(f"Error stopping Ollama: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    logger.info("Starting FlowCraft AI...")
    
    if not start_ollama():
        logger.warning("Ollama failed to start - AI features may not work")
    
    try:
        create_tables()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    
    yield
    
    logger.info("Shutting down FlowCraft AI...")
    stop_ollama()

app = FastAPI(
    title="FlowCraft AI",
    description="Privacy-first document processing platform with AI-powered intelligence",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")
app.include_router(health, prefix="/api/v1", tags=["Health"])
app.include_router(sharing, prefix="/api/v1", tags=["Sharing"])

if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "FlowCraft AI API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
