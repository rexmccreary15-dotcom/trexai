# Copy-paste this ENTIRE block into PowerShell (run from your project folder, or it will use the path below).
# It will: 1) Copy the commands migration SQL to your clipboard and open Supabase, 2) Push code to GitHub so Vercel deploys.

$ProjectDir = "c:\Users\Rexan\.cursor\cursor app"
if ($PSScriptRoot) { $ProjectDir = $PSScriptRoot }
if (-not (Test-Path $ProjectDir)) { $ProjectDir = (Get-Location).Path }

Set-Location $ProjectDir

$SqlFile = Join-Path $ProjectDir "add_user_commands.sql"
if (Test-Path $SqlFile) {
    $Sql = Get-Content $SqlFile -Raw
    Set-Clipboard -Value $Sql
    Write-Host "`n=== SQL copied to clipboard ===" -ForegroundColor Green
    Write-Host "1. Supabase SQL Editor will open." -ForegroundColor Yellow
    Write-Host "2. Press Ctrl+V to paste, then click Run (or Ctrl+Enter)." -ForegroundColor Yellow
    Write-Host "3. Come back here; script will push code to GitHub.`n" -ForegroundColor Yellow
    Start-Process "https://supabase.com/dashboard"
} else {
    Write-Host "SQL file not found. Pushing code only. Run this in Supabase SQL Editor:" -ForegroundColor Yellow
    Write-Host "ALTER TABLE users ADD COLUMN IF NOT EXISTS commands JSONB DEFAULT '[]';`n" -ForegroundColor White
}

Write-Host "Pushing to GitHub (Vercel will deploy)..." -ForegroundColor Cyan
git add .
git status
git commit -m "Commands per account - load/save from DB when logged in" 2>$null
if ($LASTEXITCODE -ne 0) { git commit -m "Commands per account" 2>$null }
git push
Write-Host "`nDone. If you opened Supabase: paste (Ctrl+V) in the SQL box and click Run. Then wait 1-2 min and refresh your site." -ForegroundColor Green
