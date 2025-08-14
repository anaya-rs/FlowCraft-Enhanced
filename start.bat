@echo off
echo FlowCraft AI - Starting Services
echo ================================

echo.
echo Starting backend server...
cd backend
start "FlowCraft Backend" cmd /k "venv\Scripts\activate && python main.py"

echo.
echo Starting frontend development server...
cd ..\frontend
start "FlowCraft Frontend" cmd /k "npm run dev"

echo.
echo Services starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause
