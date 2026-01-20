@echo off
REM Simple, reliable startup script
title AI Chat Website

REM Change to script directory
cd /d "%~dp0"

REM Check Node.js
if not exist "C:\Program Files\nodejs\npm.cmd" (
    echo ERROR: Node.js not found!
    echo Please install Node.js first.
    pause
    exit /b 1
)

REM Install if needed
if not exist "node_modules" (
    echo Installing dependencies (first time - takes 1-3 minutes)...
    "C:\Program Files\nodejs\npm.cmd" install
    if errorlevel 1 (
        echo.
        echo ERROR: Installation failed!
        pause
        exit /b 1
    )
)

REM Start website
echo.
echo ========================================
echo Starting website at http://localhost:3000
echo Keep this window open!
echo Press Ctrl+C to stop
echo ========================================
echo.

"C:\Program Files\nodejs\npm.cmd" run dev

pause
