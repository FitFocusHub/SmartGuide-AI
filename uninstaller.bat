@echo off
echo ==========================================
echo SmartGuide AI - Uninstaller
echo ==========================================
echo.
echo Copyright (c) 2026 FitFocusHub
echo.

:: Kill server process
echo Stopping server...
taskkill /IM SmartGuideServer.exe /F >nul 2>&1

:: Remove from startup
echo Removing from startup...
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\SmartGuideAI.lnk" >nul 2>&1

:: Remove from registry
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "SmartGuideAI" /f >nul 2>&1

:: Remove installation directory
echo Removing files...
rmdir /S /Q "%LOCALAPPDATA%\SmartGuideAI" >nul 2>&1

echo.
echo ==========================================
echo Uninstall Complete!
echo ==========================================
echo.
echo SmartGuide AI has been removed from your system.
echo.
pause
