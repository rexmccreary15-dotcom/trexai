# Setup Checker Script
Write-Host "=== AI Chat App - Setup Checker ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Not found"
    }
} catch {
    Write-Host "✗ Node.js is NOT installed" -ForegroundColor Red
    Write-Host "  Please install from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "  Download the LTS version and restart your computer after installation" -ForegroundColor Yellow
    exit 1
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
    } else {
        throw "Not found"
    }
} catch {
    Write-Host "✗ npm is NOT installed" -ForegroundColor Red
    exit 1
}

# Check .env.local
Write-Host "Checking API key configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "OPENAI_API_KEY=sk-") {
        Write-Host "✓ OpenAI API key is configured" -ForegroundColor Green
    } else {
        Write-Host "⚠ .env.local exists but API key may not be set" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ .env.local file not found" -ForegroundColor Red
    Write-Host "  API key needs to be configured" -ForegroundColor Yellow
}

# Check node_modules
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ Dependencies are installed" -ForegroundColor Green
} else {
    Write-Host "⚠ Dependencies not installed yet" -ForegroundColor Yellow
    Write-Host "  Run: npm install" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "If everything shows ✓, you can run: npm run dev" -ForegroundColor Green
Write-Host ""
