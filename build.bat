@echo off
echo SmartGuide AI - Build Script
echo ============================
echo.
echo Copyright (c) 2026 FitFocusHub. All Rights Reserved.
echo.

if not exist "build" mkdir build
if not exist "build\browser-extension" mkdir build\browser-extension

echo Copying files...
xcopy /E /I /Y "browser-extension\*" "build\browser-extension\"

echo.
echo Build complete! Output: build\browser-extension\
echo.
echo NOTICE: This software is proprietary. Do not redistribute.
echo.
pause
