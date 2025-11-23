# ========================================
# CVACare Backend - Fix Python Virtual Environments
# ========================================
# This script recreates the Python virtual environments
# with the correct Python installation path

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Fixing Python Virtual Environments" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if we're in the backend directory
$currentDir = Get-Location
if (-not $currentDir.Path.EndsWith("backend")) {
    Write-Host "ERROR: Please run this script from the backend directory" -ForegroundColor Red
    Write-Host "Current directory: $currentDir" -ForegroundColor Yellow
    Write-Host "Run: cd backend" -ForegroundColor Yellow
    exit 1
}

# Check if Python is installed
Write-Host "[1/5] Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] $pythonVersion" -ForegroundColor Green
    $pythonPath = (Get-Command python).Source
    Write-Host "Python path: $pythonPath" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8 or higher from https://www.python.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Remove old gait-analysis venv
Write-Host "[2/5] Removing old Gait Analysis virtual environment..." -ForegroundColor Yellow
if (Test-Path "gait-analysis\venv") {
    Remove-Item -Path "gait-analysis\venv" -Recurse -Force
    Write-Host "[OK] Old gait-analysis venv removed" -ForegroundColor Green
} else {
    Write-Host "[OK] No old gait-analysis venv found" -ForegroundColor Gray
}
Write-Host ""

# Remove old therapy-exercises venv
Write-Host "[3/5] Removing old Therapy Exercises virtual environment..." -ForegroundColor Yellow
if (Test-Path "therapy-exercises\venv") {
    Remove-Item -Path "therapy-exercises\venv" -Recurse -Force
    Write-Host "[OK] Old therapy-exercises venv removed" -ForegroundColor Green
} else {
    Write-Host "[OK] No old therapy-exercises venv found" -ForegroundColor Gray
}
Write-Host ""

# Create new gait-analysis venv
Write-Host "[4/5] Creating new Gait Analysis virtual environment..." -ForegroundColor Yellow
python -m venv gait-analysis\venv
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] New gait-analysis venv created" -ForegroundColor Green
    
    # Activate and install dependencies
    Write-Host "Installing dependencies for gait-analysis..." -ForegroundColor Cyan
    & "gait-analysis\venv\Scripts\Activate.ps1"
    python -m pip install --upgrade pip
    pip install -r gait-analysis\requirements.txt
    deactivate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Gait analysis dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Some dependencies may have failed to install" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] Failed to create gait-analysis venv" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Create new therapy-exercises venv
Write-Host "[5/5] Creating new Therapy Exercises virtual environment..." -ForegroundColor Yellow
python -m venv therapy-exercises\venv
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] New therapy-exercises venv created" -ForegroundColor Green
    
    # Activate and install dependencies
    Write-Host "Installing dependencies for therapy-exercises..." -ForegroundColor Cyan
    & "therapy-exercises\venv\Scripts\Activate.ps1"
    python -m pip install --upgrade pip
    pip install -r therapy-exercises\requirements.txt
    deactivate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Therapy exercises dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Some dependencies may have failed to install" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] Failed to create therapy-exercises venv" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Success summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Virtual Environments Fixed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Both virtual environments have been recreated with your current Python installation." -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now run: .\start-all.ps1" -ForegroundColor Yellow
Write-Host ""
