#!/usr/bin/env python3
"""
FlowCraft AI Backend Startup Script
"""

import os
import sys
from pathlib import Path

def setup_environment():
    """Setup environment variables and directories"""
    
    # Create necessary directories
    directories = ['uploads', 'exports', 'logs']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    
    # Set default environment variables if not present
    env_vars = {
        'SECRET_KEY': 'your-super-secret-key-change-in-production-minimum-32-characters',
        'DATABASE_URL': 'sqlite:///./flowcraft.db',
        'OLLAMA_BASE_URL': 'http://localhost:11434',
        'PHI3_MODEL': 'phi3',
        'TESSERACT_CMD': r'C:\Program Files\Tesseract-OCR\tesseract.exe' if os.name == 'nt' else '/usr/bin/tesseract',
        'UPLOAD_DIR': 'uploads/',
        'EXPORT_DIR': 'exports/',
        'LOG_LEVEL': 'INFO',
        'LOG_FILE': 'logs/flowcraft.log',
        'ENVIRONMENT': 'development'
    }
    
    for key, value in env_vars.items():
        if key not in os.environ:
            os.environ[key] = value
    
    print("✅ Environment setup complete")
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"🔑 Secret key: {os.environ.get('SECRET_KEY', 'Not set')[:20]}...")
    print(f"🗄️  Database: {os.environ.get('DATABASE_URL', 'Not set')}")
    print(f"🤖 Ollama URL: {os.environ.get('OLLAMA_BASE_URL', 'Not set')}")
    print(f"📝 Tesseract: {os.environ.get('TESSERACT_CMD', 'Not set')}")

def check_dependencies():
    """Check if required dependencies are available"""
    print("\n🔍 Checking dependencies...")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        return False
    
    print("✅ Python version OK")
    
    # Check if main.py exists
    if not Path("main.py").exists():
        print("❌ main.py not found")
        return False
    
    print("✅ main.py found")
    
    # Check if app directory exists
    if not Path("app").exists():
        print("❌ app directory not found")
        return False
    
    print("✅ app directory found")
    
    return True

def main():
    """Main startup function"""
    print("🚀 FlowCraft AI Backend Startup")
    print("=" * 40)
    
    # Setup environment
    setup_environment()
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Startup failed. Please check the errors above.")
        sys.exit(1)
    
    print("\n✅ All checks passed!")
    print("\n🎯 Starting FlowCraft AI Backend...")
    print("📖 API docs will be available at: http://localhost:8000/docs")
    print("🏥 Health check at: http://localhost:8000/health")
    print("\nPress Ctrl+C to stop the server")
    print("-" * 40)
    
    # Import and run the main application
    try:
        from main import app
        import uvicorn
        
        uvicorn.run(
            app, 
            host=os.environ.get('HOST', '0.0.0.0'),
            port=int(os.environ.get('PORT', 8000)),
            log_level=os.environ.get('LOG_LEVEL', 'INFO').lower()
        )
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure all dependencies are installed: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Startup error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
