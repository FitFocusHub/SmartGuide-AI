@echo off
title Building SmartGuide AI Installer
echo.
echo ========================================
echo  Building SmartGuide AI Installer
echo ========================================
echo.

REM Check PyInstaller
pip show pyinstaller >nul 2>&1
if errorlevel 1 (
    echo Installing PyInstaller...
    pip install pyinstaller
)

echo Building .exe installer...
cd installer
pyinstaller --onefile --noconsole --name "SmartGuideAI_Setup" --icon=NUL install.py

echo.
echo ========================================
echo  Build Complete!
echo ========================================
echo.
echo .exe file location: dist\SmartGuideAI_Setup.exe
echo.
pause
