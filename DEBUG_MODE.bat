@echo off
REM Debug mode - shows all errors and doesn't close
echo ========================================
echo DEBUG MODE - Website Starter
echo ========================================
echo.

REM Check Node.js
echo Checking Node.js...
if exist "C:\Program Files\nodejs\node.exe" (
    echo [OK] Node.js found
    "C:\Program Files\nodejs\node.exe" --version
    "C:\Program Files\nodejs\npm.cmd" --version
) else (
    echo [ERROR] Node.js NOT found at: C:\Program Files\nodejs\node.exe
    echo.
    echo Checking alternative locations...
    if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
        echo [FOUND] Node.js at: %ProgramFiles(x86)%\nodejs\node.exe
    ) else (
        echo [NOT FOUND] Node.js not in standard locations
    )
)
echo.

REM Check current directory
cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Check for package.json
if exist "package.json" (
    echo [OK] package.json found
) else (
    echo [ERROR] package.json NOT found!
    echo You might be in the wrong folder.
)
echo.

REM Check for node_modules
if exist "node_modules" (
    echo [OK] node_modules folder exists
) else (
    echo [INFO] node_modules folder does NOT exist (will install on first run)
)
echo.

echo ========================================
echo Press any key to continue with installation...
pause
echo.

REM Try to install
if not exist "node_modules" (
    echo Installing dependencies...
    "C:\Program Files\nodejs\npm.cmd" install
    echo.
    echo Installation exit code: %ERRORLEVEL%
    echo.
)

echo ========================================
echo Press any key to try starting the website...
pause
echo.

REM Try to start
echo Starting website...
"C:\Program Files\nodejs\npm.cmd" run dev

echo.
echo ========================================
echo Script ended. Exit code: %ERRORLEVEL%
echo ========================================
pause
