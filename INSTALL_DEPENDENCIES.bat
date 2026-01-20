@echo off
echo Installing dependencies...
echo.

REM Try to find npm
set NPM_PATH=
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Found npm in PATH
    npm install
    goto :done
)

REM Try common Node.js installation paths
set NODE_PATHS[0]=C:\Program Files\nodejs\npm.cmd
set NODE_PATHS[1]=C:\Program Files (x86)\nodejs\npm.cmd
set NODE_PATHS[2]=%LOCALAPPDATA%\Programs\nodejs\npm.cmd
set NODE_PATHS[3]=%APPDATA%\npm\npm.cmd

for /L %%i in (0,1,3) do (
    call set "TEST_PATH=%%NODE_PATHS[%%i]%%"
    if exist "!TEST_PATH!" (
        echo Found npm at: !TEST_PATH!
        call "!TEST_PATH!" install
        goto :done
    )
)

echo.
echo ERROR: Could not find npm!
echo Please install Node.js from https://nodejs.org/
echo Or add Node.js to your PATH
echo.
pause
exit /b 1

:done
echo.
echo Installation complete!
echo You can now run the website.
pause
