@echo off
title SmartGuide AI Server
color 0A
echo.
echo  ╔══════════════════════════════════════╗
echo  ║     SmartGuide AI - Server           ║
echo  ║     Starting automation server...    ║
echo  ╚══════════════════════════════════════╝
echo.

cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python not found!
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo [OK] Python found
echo.

if not exist "venv" (
    echo [SETUP] First time setup - installing dependencies...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r server\requirements.txt
    echo.
    echo [OK] Setup complete!
    echo.
) else (
    call venv\Scripts\activate.bat
    echo [OK] Virtual environment loaded
)

echo [START] Server running on ws://127.0.0.1:8765
echo [INFO] Keep this window open while using SmartGuide AI
echo [INFO] Press Ctrl+C to stop
echo.
python server\server.py
