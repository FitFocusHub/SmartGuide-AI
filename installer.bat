@echo off
echo ==========================================
echo SmartGuide AI - Installer
echo ==========================================
echo.
echo Copyright (c) 2026 FitFocusHub
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo Installing SmartGuide AI...
echo.

:: Create installation directory
set INSTALL_DIR=%LOCALAPPDATA%\SmartGuideAI
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Copy server executable
echo Copying server...
copy /Y "%~dp0dist\SmartGuideServer.exe" "%INSTALL_DIR%\SmartGuideServer.exe"

:: Create startup shortcut
echo Creating startup entry...
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\SmartGuideAI.lnk'); $s.TargetPath = '%INSTALL_DIR%\SmartGuideServer.exe'; $s.WindowStyle = 7; $s.Save()"

:: Add to registry
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "SmartGuideAI" /t REG_SZ /d "\"%INSTALL_DIR%\SmartGuideServer.exe\"" /f >nul 2>&1

:: Start the server
echo Starting server...
start /B "" "%INSTALL_DIR%\SmartGuideServer.exe"

echo.
echo ==========================================
echo Installation Complete!
echo ==========================================
echo.
echo SmartGuide AI server is now running silently.
echo It will start automatically with Windows.
echo.
echo Now load the Chrome extension:
echo   1. Open Chrome
echo   2. Go to chrome://extensions/
echo   3. Enable Developer mode
echo   4. Click Load unpacked
echo   5. Select the browser-extension folder
echo.
echo To uninstall:
echo   - Delete %INSTALL_DIR% folder
echo   - Remove from Startup folder
echo.
pause
