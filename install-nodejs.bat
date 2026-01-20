@echo off
echo ========================================
echo Node.js Installation Helper
echo ========================================
echo.
echo This script will help you install Node.js
echo.

REM Check if already installed
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js is already installed!
    node --version
    npm --version
    echo.
    echo You can skip installation and go straight to running your website.
    pause
    exit /b 0
)

echo [INFO] Node.js is not installed yet.
echo.
echo ========================================
echo Installation Options:
echo ========================================
echo.
echo Option 1: Direct Download (Recommended)
echo   - Copy this link and paste in your browser:
echo   - https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
echo   - Download will start automatically
echo   - Run the downloaded file and install
echo.
echo Option 2: Try Winget (Windows Package Manager)
echo   - This will attempt to install automatically
echo.
echo ========================================
echo.

set /p choice="Choose option (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Opening download page...
    echo If it doesn't open, copy this link manually:
    echo https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
    echo.
    start https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
    echo.
    echo Download started! After it finishes:
    echo 1. Run the downloaded .msi file
    echo 2. Install with default options
    echo 3. Restart your computer
    echo 4. Run QUICK_START.bat to start your website
    pause
    exit /b 0
)

if "%choice%"=="2" (
    echo.
    echo Attempting to install with Winget...
    echo.
    winget install OpenJS.NodeJS.LTS
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] Node.js installed!
        echo Please restart your computer, then run QUICK_START.bat
    ) else (
        echo.
        echo [ERROR] Winget installation failed.
        echo Please use Option 1 (Direct Download) instead.
    )
    pause
    exit /b 0
)

echo Invalid choice. Please run this script again.
pause
