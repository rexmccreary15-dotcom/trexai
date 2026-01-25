@echo off
REM Quick script to restart the server and apply fixes

echo ========================================
echo Applying Creator Controls Fix
echo ========================================
echo.
echo This will:
echo 1. Stop any running servers
echo 2. Restart the development server
echo 3. Apply the latest code changes
echo.
pause

cd /d "c:\Users\Rexan\.cursor\cursor app"

REM Kill Node processes
echo Stopping servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

REM Start dev server
echo Starting server...
start "Next.js Dev Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Server is starting...
echo ========================================
echo.
echo Wait 10-15 seconds, then:
echo 1. Go to http://localhost:3000
echo 2. Press Ctrl+F5 to refresh (clears cache)
echo 3. Log out if you're logged in
echo 4. Click "Start new chat"
echo 5. Creator Controls button should NOT appear
echo.
pause
