@echo off
echo ========================================
echo Running Website with Full Node.js Path
echo ========================================
echo.

REM Check if Node.js exists
if not exist "C:\Program Files\nodejs\node.exe" (
    echo [ERROR] Node.js not found at: C:\Program Files\nodejs\node.exe
    echo.
    echo Please make sure Node.js is installed.
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
    echo Make sure you're running this from the project folder.
    echo.
    pause
    exit /b 1
)

echo [OK] Found package.json
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies (first time)...
    echo This may take 1-3 minutes...
    echo.
    "C:\Program Files\nodejs\npm.cmd" install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Failed to install dependencies
        echo.
        echo Common issues:
        echo - Check your internet connection
        echo - Make sure you have enough disk space
        echo - Try running as Administrator
        echo.
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
echo Your website will be available at: http://localhost:3000
echo.
echo IMPORTANT: Keep this window open!
echo Press Ctrl+C to stop the server when done
echo.
echo ========================================
echo.

"C:\Program Files\nodejs\npm.cmd" run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to start the website
    echo.
    echo Check the error messages above for details.
    echo.
    pause
)
