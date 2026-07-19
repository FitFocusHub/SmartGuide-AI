@echo off
echo ==========================================
echo SmartGuide AI - Build Silent Server
echo ==========================================
echo.
echo Copyright (c) 2026 FitFocusHub
echo.
echo Installing PyInstaller...
echo.
pip install pyinstaller -q
echo.
echo Building silent server .exe...
echo.
pyinstaller --onefile --noconsole --name "SmartGuideServer" --distpath ../dist server_silent.py
echo.
echo ==========================================
echo Build Complete!
echo ==========================================
echo.
echo Output: dist\SmartGuideServer.exe
echo.
echo This .exe will:
echo   - Run silently in background
echo   - Auto-start with Windows
echo   - No console window visible
echo   - Listen on port 8765 for extension
echo.
pause
