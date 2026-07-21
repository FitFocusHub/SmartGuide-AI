@echo off
:: SmartGuide AI - Silent Server Launcher
:: Runs server in background without showing terminal

cd /d "%~dp0"

:: Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    exit /b 1
)

:: Run server silently (no window)
start /b pythonw server_silent.py

:: Wait briefly for server to start
timeout /t 2 /nobreak >nul

:: Server should be running now on ws://127.0.0.1:8765
