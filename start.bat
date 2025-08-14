@echo off
setlocal enabledelayedexpansion

REM =============================================================================
REM FLOWCRAFT AI START SCRIPT (Windows)
REM =============================================================================

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo [INFO] Starting FlowCraft AI Services...
echo.

REM Check if setup was completed
if not exist "backend\venv" (
    echo [ERROR] Backend not set up. Please run setup.bat first.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [ERROR] Frontend not set up. Please run setup.bat first.
    pause
    exit /b 1
)

REM Start Backend
echo [INFO] Starting Backend Server...
cd backend
start "FlowCraft Backend" cmd /k "venv\Scripts\activate.bat && python main.py"
cd ..

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start Frontend
echo [INFO] Starting Frontend Development Server...
cd frontend
start "FlowCraft Frontend" cmd /k "npm run dev"
cd ..

echo.
echo [SUCCESS] Services are starting...
echo.
echo [INFO] Backend: http://localhost:8000
echo [INFO] Frontend: http://localhost:3000
echo [INFO] API Docs: http://localhost:8000/docs
echo.
echo [INFO] Both services are running in separate command windows.
echo [INFO] Close those windows to stop the services.
echo.
pause
