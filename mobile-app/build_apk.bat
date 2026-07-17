@echo off
title Building SmartGuide AI APK
echo.
echo ========================================
echo  Building SmartGuide AI APK
echo ========================================
echo.

REM Check Buildozer
pip show buildozer >nul 2>&1
if errorlevel 1 (
    echo Installing Buildozer...
    pip install buildozer cython
)

echo.
echo NOTE: APK building requires:
echo - Linux (WSL recommended for Windows)
echo - Android SDK
echo - Java JDK 8+
echo.
echo For quick PWA solution:
echo 1. Host mobile-app folder on GitHub Pages
echo 2. Open URL on phone
echo 3. Add to Home Screen
echo.
echo For full APK build, run on Linux:
echo cd mobile-app
echo buildozer android debug
echo.

pause
