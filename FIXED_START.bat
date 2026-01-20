@echo off
REM Force window to stay open
title AI Chat Website Starter
color 0A

echo.
echo ========================================
echo   AI CHAT WEBSITE - STARTUP
echo ========================================
echo.
echo This window will stay open so you can see any errors.
echo.
pause

REM Change to script directory
cd /d "%~dp0"
echo Current folder: %CD%
echo.
pause

REM Check Node.js
echo Checking for Node.js...
if exist "C:\Program Files\nodejs\node.exe" (
    echo [OK] Node.js found!
    "C:\Program Files\nodejs\node.exe" --version
) else (
    echo [ERROR] Node.js NOT found!
    echo.
    echo Expected location: C:\Program Files\nodejs\node.exe
    echo.
    echo Please install Node.js first.
    echo.
    pause
    exit /b 1
)

echo.
pause

REM Check package.json
echo Checking for package.json...
if exist "package.json" (
    echo [OK] package.json found!
) else (
    echo [ERROR] package.json NOT found!
    echo.
    echo Make sure you're in the project folder:
    echo c:\Users\Rexan\.cursor\cursor app
    echo.
    pause
    exit /b 1
)

echo.
pause

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies (first time - takes 1-3 minutes)...
    echo.
    "C:\Program Files\nodejs\npm.cmd" install
    if errorlevel 1 (
        echo.
        echo [ERROR] Installation failed!
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Installation complete!
    echo.
    pause
) else (
    echo [OK] Dependencies already installed
    echo.
    pause
)

REM Start the website
echo ========================================
echo Starting website...
echo ========================================
echo.
echo Your website will be at: http://localhost:3000
echo.
echo Keep this window open!
echo Press Ctrl+C to stop the website
echo.
echo ========================================
echo.

"C:\Program Files\nodejs\npm.cmd" run dev

echo.
echo ========================================
echo Website stopped.
echo ========================================
pause
