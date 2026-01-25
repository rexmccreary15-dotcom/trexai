@echo off
REM Simple batch file to run the migration
REM This will show you the SQL to copy/paste

echo ========================================
echo Creator Controls Migration
echo ========================================
echo.
echo Since Supabase doesn't allow direct SQL execution via API,
echo you need to run the SQL in Supabase Dashboard.
echo.
echo Here's the SQL to copy and paste:
echo.
echo ========================================
echo.

type add_creator_controls_unlocked.sql

echo.
echo ========================================
echo.
echo Steps:
echo 1. Go to: https://supabase.com/dashboard
echo 2. Select your project
echo 3. Click "SQL Editor" in left sidebar
echo 4. Click "New query"
echo 5. Copy the SQL above
echo 6. Paste it and click "Run"
echo.
echo Press any key to open Supabase Dashboard...
pause >nul

start https://supabase.com/dashboard
