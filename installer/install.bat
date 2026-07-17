@echo off
title SmartGuide AI Installer
color 0A

echo ========================================
echo    SmartGuide AI Installer v1.1.0
echo ========================================
echo.
echo Real-time AI Guidance for Any Software
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found!
    echo Please install Python from https://python.org
    echo.
    pause
    exit /b 1
)

echo [✓] Python found
echo.

REM Set install location
set INSTALL_DIR=%APPDATA%\SmartGuide AI

echo Installing to: %INSTALL_DIR%
echo.

REM Create directory
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo [1/5] Copying desktop app files...
xcopy /E /I /Y "desktop-app" "%INSTALL_DIR%\desktop-app" >nul

echo [2/5] Copying browser extension...
xcopy /E /I /Y "browser-extension" "%INSTALL_DIR%\browser-extension" >nul

echo [3/5] Copying mobile app...
if exist "mobile-app" (
    xcopy /E /I /Y "mobile-app" "%INSTALL_DIR%\mobile-app" >nul
)

echo [4/5] Creating shortcuts...
echo @echo off > "%USERPROFILE%\Desktop\SmartGuide AI.bat"
echo cd "%INSTALL_DIR%\desktop-app" >> "%USERPROFILE%\Desktop\SmartGuide AI.bat"
echo start python main.py >> "%USERPROFILE%\Desktop\SmartGuide AI.bat"

echo [5/5] Creating start script...
echo @echo off > "%INSTALL_DIR%\Start SmartGuide AI.bat"
echo echo Starting SmartGuide AI... >> "%INSTALL_DIR%\Start SmartGuide AI.bat"
echo cd "%INSTALL_DIR%\desktop-app" >> "%INSTALL_DIR%\Start SmartGuide AI.bat"
echo python main.py >> "%INSTALL_DIR%\Start SmartGuide AI.bat"
echo pause >> "%INSTALL_DIR%\Start SmartGuide AI.bat"

echo.
echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo SmartGuide AI has been installed to:
echo %INSTALL_DIR%
echo.
echo You can now:
echo 1. Run "SmartGuide AI" from Desktop
echo 2. Or run "Start SmartGuide AI.bat" from install folder
echo.
echo To uninstall: Delete %INSTALL_DIR%
echo.
pause
