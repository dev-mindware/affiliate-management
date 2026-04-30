@echo off
echo Starting Mindware Affiliate System...
if not exist .venv (
    echo Virtual environment not found! Please run: python -m venv .venv
    exit /b 1
)
echo Activating environment and starting server...
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
