@echo off
setlocal enabledelayedexpansion

REM =============================================================================
REM FLOWCRAFT AI SETUP SCRIPT (Windows)
REM =============================================================================

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo [INFO] FlowCraft AI Setup Script for Windows
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.9+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found. Please install npm first.
    pause
    exit /b 1
)

echo [SUCCESS] Prerequisites check passed
echo.

REM Setup Backend
echo [INFO] Setting up FlowCraft AI Backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo [INFO] Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo [INFO] Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating environment configuration...
    copy env.example .env
    echo [WARNING] Please edit .env file with your configuration
)

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "exports" mkdir exports
if not exist "logs" mkdir logs
if not exist "temp" mkdir temp

REM Initialize database
echo [INFO] Initializing database...
python init_db.py

cd ..
echo [SUCCESS] Backend setup completed!
echo.

REM Setup Frontend
echo [INFO] Setting up FlowCraft AI Frontend...
cd frontend

REM Install dependencies
echo [INFO] Installing Node.js dependencies...
npm install

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "public" mkdir public
if not exist "src\assets" mkdir "src\assets"
if not exist "src\styles" mkdir "src\styles"

cd ..
echo [SUCCESS] Frontend setup completed!
echo.

echo [SUCCESS] FlowCraft AI setup completed!
echo.
echo [INFO] To start the services:
echo [INFO] 1. Backend: cd backend ^& venv\Scripts\activate ^& python main.py
echo [INFO] 2. Frontend: cd frontend ^& npm run dev
echo.
echo [INFO] Or use the start.bat script to start both services
echo.
pause
