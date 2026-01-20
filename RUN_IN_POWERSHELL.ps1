# PowerShell script to start the website
# Right-click this file and select "Run with PowerShell"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI CHAT WEBSITE - STARTUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
$nodePath = "C:\Program Files\nodejs\node.exe"
if (-not (Test-Path $nodePath)) {
    Write-Host "[ERROR] Node.js not found at: $nodePath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js first." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Node.js found!" -ForegroundColor Green
& $nodePath --version
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot
Write-Host "Current directory: $PWD" -ForegroundColor Gray
Write-Host ""

# Check package.json
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] package.json not found!" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] package.json found!" -ForegroundColor Green
Write-Host ""

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies (first time - takes 1-3 minutes)..." -ForegroundColor Yellow
    Write-Host ""
    $npmPath = "C:\Program Files\nodejs\npm.cmd"
    & $npmPath install
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERROR] Installation failed!" -ForegroundColor Red
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host ""
    Write-Host "[OK] Installation complete!" -ForegroundColor Green
    Write-Host ""
}

# Start the website
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting website..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your website will be at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Keep this window open!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the website" -ForegroundColor Yellow
Write-Host ""

$npmPath = "C:\Program Files\nodejs\npm.cmd"
& $npmPath run dev

Write-Host ""
Write-Host "Website stopped." -ForegroundColor Gray
Read-Host "Press Enter to exit"
