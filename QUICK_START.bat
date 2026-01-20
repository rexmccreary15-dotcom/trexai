@echo off
echo ========================================
echo AI Chat Website - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and restart your computer after installation.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
npm --version
echo.

REM Navigate to project folder
cd /d "%~dp0"
echo [INFO] Current directory: %CD%
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies (first time setup)...
    echo This may take 1-3 minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed!
    echo.
) else (
    echo [OK] Dependencies already installed
    echo.
)

echo ========================================
echo Starting your website...
echo ========================================
echo.
echo Your website will open at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
