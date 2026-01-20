@echo off
echo ========================================
echo Starting Your AI Chat Website
echo ========================================
echo.

REM Check if Node.js exists
if not exist "C:\Program Files\nodejs\node.exe" (
    echo [ERROR] Node.js not found!
    echo.
    echo Node.js should be at: C:\Program Files\nodejs\node.exe
    echo.
    echo Please install Node.js first.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found!
"C:\Program Files\nodejs\node.exe" --version
echo.

REM Navigate to project folder
cd /d "%~dp0"
echo [INFO] Current directory: %CD%
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo.
    echo Make sure you're in the right folder:
    echo c:\Users\Rexan\.cursor\cursor app
    echo.
    pause
    exit /b 1
)

echo [OK] Found package.json
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies (first time only)...
    echo This takes 1-3 minutes - please wait...
    echo.
    "C:\Program Files\nodejs\npm.cmd" install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Installation failed!
        echo.
        echo Troubleshooting:
        echo 1. Check your internet connection
        echo 2. Make sure you have disk space
        echo 3. Try running as Administrator (right-click, Run as Administrator)
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies installed!
    echo.
) else (
    echo [OK] Dependencies already installed
    echo.
)

echo ========================================
echo Starting your website...
echo ========================================
echo.
echo Website URL: http://localhost:3000
echo.
echo IMPORTANT: Keep this window open!
echo Press Ctrl+C to stop when done
echo.
echo ========================================
echo.

"C:\Program Files\nodejs\npm.cmd" run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Website failed to start
    echo.
    echo Look at the error messages above for details.
    echo.
    pause
)
