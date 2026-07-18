@echo off
echo SmartGuide AI - Build Script
echo ============================
echo.
echo Copyright (c) 2026 FitFocusHub. All Rights Reserved.
echo.

echo Installing dependencies...
call npm install

echo.
echo Building and obfuscating...
call npm run build

echo.
echo Build complete! Output: dist\browser-extension\
echo.
echo NOTICE: This software is proprietary. Do not redistribute.
echo.
pause
