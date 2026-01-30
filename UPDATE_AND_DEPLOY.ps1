# ============================================================
# COPY-PASTE THE BLOCK BELOW INTO WINDOWS POWERSHELL
# (Edit the path on the next line if your project is elsewhere)
# ============================================================

$ProjectDir = "c:\Users\Rexan\.cursor\cursor app"
if ($PSScriptRoot) { $ProjectDir = $PSScriptRoot }
if (-not (Test-Path $ProjectDir)) { $ProjectDir = (Get-Location).Path }
Set-Location $ProjectDir

Write-Host "`nBuilding..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nBuild failed. Fix the error above, then run this script again.`n" -ForegroundColor Red
    exit 1
}

Write-Host "`nPushing to GitHub (Vercel will deploy)..." -ForegroundColor Cyan
git add .
git status
git commit -m "Updates" 2>$null
if ($LASTEXITCODE -ne 0) { git commit -m "Updates" 2>$null }
git push

Write-Host "`nDone. Wait 1-2 min, then refresh your site (Ctrl+F5).`n" -ForegroundColor Green
Write-Host "--- IF YOU HAVENT RUN THE COMMANDS SQL YET (one-time) ---" -ForegroundColor Yellow
Write-Host "1. Open https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Your project -> SQL Editor -> New query" -ForegroundColor White
Write-Host "3. Paste: ALTER TABLE users ADD COLUMN IF NOT EXISTS commands JSONB DEFAULT '[]';" -ForegroundColor White
Write-Host "4. Click Run.`n" -ForegroundColor White
