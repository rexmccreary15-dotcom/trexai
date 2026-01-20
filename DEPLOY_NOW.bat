@echo off
echo Deploying to Vercel...
cd /d "%~dp0"
cmd /c vercel --prod --force
pause
