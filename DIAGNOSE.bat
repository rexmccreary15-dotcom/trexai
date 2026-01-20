@echo off
echo ========================================
echo DIAGNOSTIC MODE
echo ========================================
echo.
echo This will help us find the problem.
echo.
pause

echo Step 1: Checking current directory...
cd /d "%~dp0"
echo Current directory: %CD%
echo.
pause

echo Step 2: Checking for Node.js...
if exist "C:\Program Files\nodejs\npm.cmd" (
    echo [OK] Node.js found!
) else (
    echo [ERROR] Node.js NOT found!
    echo Expected: C:\Program Files\nodejs\npm.cmd
)
echo.
pause

echo Step 3: Checking for package.json...
if exist "package.json" (
    echo [OK] package.json found!
) else (
    echo [ERROR] package.json NOT found!
)
echo.
pause

echo Step 4: Testing npm command...
"C:\Program Files\nodejs\npm.cmd" --version
if errorlevel 1 (
    echo [ERROR] npm command failed!
) else (
    echo [OK] npm command works!
)
echo.
pause

echo Step 5: Checking node_modules...
if exist "node_modules" (
    echo [OK] node_modules exists
) else (
    echo [INFO] node_modules does NOT exist (will install)
)
echo.
pause

echo ========================================
echo Diagnostic complete!
echo ========================================
echo.
echo If you saw any [ERROR] messages above,
echo that's the problem we need to fix.
echo.
pause
