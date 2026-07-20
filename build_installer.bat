@echo off
title SmartGuide AI - Build Installer
color 0B
echo.
echo  ╔══════════════════════════════════════╗
echo  ║     SmartGuide AI - Build Installer  ║
echo  ╚══════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/3] Checking Inno Setup...
where iscc >nul 2>nul
if %errorlevel% neq 0 (
    set "ISCC=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
    if not exist "!ISCC!" (
        set "ISCC=C:\Program Files\Inno Setup 6\ISCC.exe"
    )
    if not exist "!ISCC!" (
        echo [ERROR] Inno Setup not found!
        echo.
        echo Please install from: https://jrsoftware.org/isinfo.php
        echo.
        start https://jrsoftware.org/isinfo.php
        pause
        exit /b 1
    )
) else (
    set "ISCC=iscc"
)

echo [OK] Inno Setup found
echo.

echo [2/3] Building installer...
if not exist "installer_output" mkdir installer_output
!ISCC! installer\setup.iss
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Done!
echo.
echo  ╔══════════════════════════════════════╗
echo  ║     Installer Ready!                 ║
echo  ╚══════════════════════════════════════╝
echo.
echo  Location: installer_output\SmartGuideAI-Setup.exe
echo.
echo  Users can now:
echo  1. Double-click SmartGuideAI-Setup.exe
echo  2. Follow the wizard
echo  3. Server starts automatically!
echo.
pause
