@echo off
echo Pushing code to GitHub...
cd /d "%~dp0"

echo.
echo Step 1: Initializing git (if needed)...
git init

echo.
echo Step 2: Adding all files...
git add .

echo.
echo Step 3: Committing changes...
git commit -m "Add sessionId and chatId for analytics tracking"

echo.
echo Step 4: Setting main branch...
git branch -M main

echo.
echo ========================================
echo IMPORTANT: You need to add your GitHub repository URL
echo ========================================
echo.
echo After creating your GitHub repository, you'll get a URL like:
echo https://github.com/YOUR-USERNAME/trexai.git
echo.
echo Then run this command (replace with your actual URL):
echo git remote add origin https://github.com/YOUR-USERNAME/trexai.git
echo git push -u origin main
echo.
pause
