@echo off
title SmartGuide AI - Installation
color 0B
echo.
echo  ╔══════════════════════════════════════╗
echo  ║     SmartGuide AI - Installer        ║
echo  ║     One-click setup                  ║
echo  ╚══════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/4] Checking Python...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python not found!
    echo.
    echo Please install Python first:
    echo https://www.python.org/downloads/
    echo.
    echo IMPORTANT: Check "Add Python to PATH" during install!
    echo.
    start https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version
echo [OK] Python found
echo.

echo [2/4] Creating virtual environment...
if exist "venv" (
    echo [SKIP] Already exists
) else (
    python -m venv venv
    echo [OK] Created
)
echo.

echo [3/4] Installing dependencies...
call venv\Scripts\activate.bat
pip install -r server\requirements.txt
echo [OK] Dependencies installed
echo.

echo [4/4] Creating desktop shortcut...
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\shortcut.vbs"
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\SmartGuide AI Server.lnk" >> "%TEMP%\shortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\shortcut.vbs"
echo oLink.TargetPath = "%~dp0start_server.bat" >> "%TEMP%\shortcut.vbs"
echo oLink.WorkingDirectory = "%~dp0" >> "%TEMP%\shortcut.vbs"
echo oLink.Description = "Start SmartGuide AI Server" >> "%TEMP%\shortcut.vbs"
echo oLink.Save >> "%TEMP%\shortcut.vbs"
cscript //nologo "%TEMP%\shortcut.vbs"
del "%TEMP%\shortcut.vbs"
echo [OK] Shortcut created on Desktop
echo.

echo  ╔══════════════════════════════════════╗
echo  ║     Installation Complete!           ║
echo  ╚══════════════════════════════════════╝
echo.
echo  HOW TO USE:
echo  1. Double-click "SmartGuide AI Server" on Desktop
echo  2. Load browser-extension in Chrome
echo  3. Click the purple SmartGuide button
echo.
echo  Server will run in background window.
echo  Keep it open while using SmartGuide AI.
echo.
pause
