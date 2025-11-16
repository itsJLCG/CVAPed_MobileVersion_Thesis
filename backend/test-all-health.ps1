# Complete Health Screen Test Suite
# This script runs all health-related tests

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Health Screen Test Suite" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "Checking if backend server is running..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000" -Method Get -TimeoutSec 3
    Write-Host "✅ Backend server is running!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Backend server is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the backend server first:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Gray
    Write-Host "  npm start" -ForegroundColor Gray
    Write-Host ""
    exit
}

# Check if MongoDB is running
Write-Host "Checking if MongoDB is running..." -ForegroundColor Yellow

try {
    $mongoCheck = & mongosh --quiet --eval "db.version()" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB is running!" -ForegroundColor Green
        Write-Host ""
    } else {
        throw "MongoDB not responding"
    }
} catch {
    Write-Host "❌ MongoDB is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start MongoDB first:" -ForegroundColor Yellow
    Write-Host "  mongod" -ForegroundColor Gray
    Write-Host ""
    $skip = Read-Host "Do you want to skip MongoDB tests and continue? (y/n)"
    if ($skip -ne 'y') {
        exit
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Options" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create mock health data (requires User ID)" -ForegroundColor White
Write-Host "2. Test health endpoints (requires login)" -ForegroundColor White
Write-Host "3. Both (create mock data AND test endpoints)" -ForegroundColor White
Write-Host "4. Quick test (test endpoints only with existing data)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Running mock data creation script..." -ForegroundColor Yellow
        Write-Host ""
        & "$PSScriptRoot\create-mock-health-data.ps1"
    }
    "2" {
        Write-Host ""
        Write-Host "Running endpoint tests..." -ForegroundColor Yellow
        Write-Host ""
        & "$PSScriptRoot\test-health-endpoints.ps1"
    }
    "3" {
        Write-Host ""
        Write-Host "Running complete test suite..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Step 1: Creating mock data" -ForegroundColor Cyan
        Write-Host "───────────────────────────" -ForegroundColor Gray
        & "$PSScriptRoot\create-mock-health-data.ps1"
        
        Write-Host ""
        Write-Host "Step 2: Testing endpoints" -ForegroundColor Cyan
        Write-Host "───────────────────────────" -ForegroundColor Gray
        & "$PSScriptRoot\test-health-endpoints.ps1"
    }
    "4" {
        Write-Host ""
        Write-Host "Running quick test..." -ForegroundColor Yellow
        Write-Host ""
        & "$PSScriptRoot\test-health-endpoints.ps1"
    }
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice!" -ForegroundColor Red
        Write-Host ""
        exit
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Suite Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
