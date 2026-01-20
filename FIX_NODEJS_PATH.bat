@echo off
echo ========================================
echo Node.js PATH Fixer
echo ========================================
echo.
echo Node.js is installed but not in your PATH.
echo This script will help you fix it.
echo.

REM Check if Node.js exists
if exist "C:\Program Files\nodejs\node.exe" (
    echo [OK] Found Node.js at: C:\Program Files\nodejs
    echo.
    echo Current version:
    "C:\Program Files\nodejs\node.exe" --version
    "C:\Program Files\nodejs\npm.cmd" --version
    echo.
    echo ========================================
    echo Solution Options:
    echo ========================================
    echo.
    echo Option 1: Restart your computer (Recommended)
    echo   - Node.js installer should have added it to PATH
    echo   - Restarting will refresh your environment
    echo   - After restart, run QUICK_START.bat
    echo.
    echo Option 2: Use Node.js directly (Quick Test)
    echo   - We can run commands using full path
    echo   - This works without restarting
    echo.
    echo Option 3: Add to PATH manually
    echo   - I'll guide you through adding it manually
    echo.
    echo ========================================
    echo.
    
    set /p choice="Choose option (1, 2, or 3): "
    
    if "%choice%"=="1" (
        echo.
        echo Please restart your computer, then run QUICK_START.bat
        pause
        exit /b 0
    )
    
    if "%choice%"=="2" (
        echo.
        echo Testing with full path...
        echo.
        cd /d "%~dp0"
        echo Installing dependencies...
        "C:\Program Files\nodejs\npm.cmd" install
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo [SUCCESS] Dependencies installed!
            echo.
            echo Starting website...
            "C:\Program Files\nodejs\npm.cmd" run dev
        ) else (
            echo [ERROR] Installation failed
        )
        pause
        exit /b 0
    )
    
    if "%choice%"=="3" (
        echo.
        echo To add Node.js to PATH manually:
        echo.
        echo 1. Press Windows Key + X
        echo 2. Click "System"
        echo 3. Click "Advanced system settings"
        echo 4. Click "Environment Variables"
        echo 5. Under "System variables", find "Path"
        echo 6. Click "Edit"
        echo 7. Click "New"
        echo 8. Add: C:\Program Files\nodejs
        echo 9. Click OK on all windows
        echo 10. Close and reopen PowerShell
        echo.
        pause
        exit /b 0
    )
    
) else (
    echo [ERROR] Node.js not found in standard location
    echo Please install Node.js first
    pause
    exit /b 1
)
