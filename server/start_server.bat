@echo off
echo ==========================================
echo SmartGuide AI - Automation Server
echo ==========================================
echo.
echo Copyright (c) 2026 FitFocusHub
echo.
echo Installing dependencies...
echo.
pip install -r requirements.txt
echo.
echo Starting server...
echo.
python server.py
pause
