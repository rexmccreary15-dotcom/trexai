# Fix PowerShell execution policy and restart server
# Run this in PowerShell (may need to run as Administrator)

Write-Host "=== Fixing PowerShell Execution Policy ===" -ForegroundColor Cyan
Write-Host ""

# Set execution policy for current user (doesn't require admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

Write-Host "✓ Execution policy updated" -ForegroundColor Green
Write-Host ""

# Now restart the server
cd "c:\Users\Rexan\.cursor\cursor app"
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Starting server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Rexan\.cursor\cursor app'; npm.cmd run dev"

Write-Host "Server starting in new window..." -ForegroundColor Cyan
Write-Host "Wait 10 seconds, then refresh browser (Ctrl+F5)" -ForegroundColor Yellow
