@echo off
echo ==========================================
echo SmartGuide AI - Full Setup
echo ==========================================
echo.
echo Copyright (c) 2026 FitFocusHub
echo.
echo Installing Python dependencies...
echo.
cd server
pip install -r requirements.txt
echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To use SmartGuide AI:
echo.
echo 1. Start the server (keep this window open):
echo    python server.py
echo.
echo 2. Load extension in Chrome:
echo    chrome://extensions/ -> Load unpacked -> browser-extension folder
echo.
echo 3. Enter API keys in extension popup
echo.
echo 4. Start asking questions!
echo.
echo Press any key to start server...
pause >nul
python server.py
