@echo off
echo ========================================
echo   Deploy Website to Vercel (Get Public URL)
echo ========================================
echo.

echo Step 1: Installing Vercel CLI...
call npm install -g vercel
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install Vercel CLI
    echo Try running as Administrator or use: npx vercel
    pause
    exit /b 1
)

echo.
echo Step 2: Deploying to Vercel...
echo.
echo IMPORTANT: When prompted:
echo   - Set up and deploy? Type: Y
echo   - Link to existing project? Type: N (first time)
echo   - Project name? Press Enter (use default)
echo   - Directory? Press Enter (use default)
echo.
pause

call vercel

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your website URL will be shown above.
echo Copy that URL and share it with anyone!
echo.
pause
