# PowerShell script to restart the Next.js dev server
# This will apply the latest code changes

Write-Host "=== Restarting Development Server ===" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
cd "c:\Users\Rexan\.cursor\cursor app"

# Kill any existing Node.js processes (Next.js dev server)
Write-Host "Stopping any running servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start the dev server
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "The server will start on http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start npm dev in a new window so you can see the output
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Rexan\.cursor\cursor app'; npm run dev"

Write-Host "Server starting in new window..." -ForegroundColor Green
Write-Host "Wait a few seconds, then refresh your browser (Ctrl+F5 to clear cache)" -ForegroundColor Yellow
