@echo off
REM Deploy the Creator Controls fix to your live website

echo ========================================
echo Deploying Creator Controls Fix
echo ========================================
echo.
echo This will deploy your code changes to:
echo https://cursor-app-ruddy.vercel.app
echo.
pause

cd /d "c:\Users\Rexan\.cursor\cursor app"

echo.
echo Step 1: Committing changes to git...
git add .
git commit -m "Fix: Hide Creator Controls when not logged in" || echo "No changes to commit or git not initialized"

echo.
echo Step 2: Deploying to Vercel...
vercel --prod

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Wait 1-2 minutes for deployment to finish, then:
echo 1. Go to: https://cursor-app-ruddy.vercel.app
echo 2. Press Ctrl+F5 to refresh (clears cache)
echo 3. Log out if you're logged in
echo 4. Click "Start new chat"
echo 5. Creator Controls button should NOT appear
echo.
pause
