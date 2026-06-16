@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ==========================================
echo   Code Comment Assistant - Backend Starter
echo ==========================================
echo.

if "%DEEPSEEK_API_KEY%"=="" (
    echo [WARN] DEEPSEEK_API_KEY not set, LLM features unavailable
    echo       Run: set DEEPSEEK_API_KEY=sk-your-key
    echo.
)

REM Kill old process on port 8001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8001 ^| findstr LISTENING') do (
    echo [CLEANUP] Killing old process PID=%%a
    taskkill /PID %%a /F >nul 2>&1
)

REM Install dependencies
pip install -r backend\requirements.txt -q 2>nul

echo [START] uvicorn on http://localhost:8001
echo [HINT] Press Ctrl+C to stop server
echo.

python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload --app-dir backend
pause
