@echo off
cd /d "%~dp0"
echo Starting website...
echo.
if not exist "node_modules" (
    echo Installing packages (first time - takes 1-3 minutes)...
    "C:\Program Files\nodejs\npm.cmd" install
)
echo.
echo Starting server...
echo Open http://localhost:3000 in your browser
echo.
"C:\Program Files\nodejs\npm.cmd" run dev
cmd /k
