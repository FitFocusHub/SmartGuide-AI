@echo off
echo ========================================
echo SmartGuide AI - Building Installer
echo ========================================
echo.

where iscc >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Inno Setup not found!
    echo.
    echo Please install Inno Setup from:
    echo https://jrsoftware.org/isinfo.php
    echo.
    echo After install, add to PATH or run:
    echo "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer\setup.iss
    echo.
    pause
    exit /b 1
)

echo [1/2] Building installer...
iscc installer\setup.iss

echo.
echo [2/2] Done!
echo.
echo Installer created at: installer_output\SmartGuideAI-Setup.exe
echo.
pause
