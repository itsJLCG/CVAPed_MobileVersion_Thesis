# ONE-CLICK Health Screen Test
# Quick automated test with minimal user input

param(
    [string]$userEmail = "",
    [string]$userPassword = "password123",
    [switch]$createMockData
)

$ErrorActionPreference = "Stop"

Write-Host @"

╔════════════════════════════════════════════╗
║   HEALTH SCREEN ONE-CLICK TEST SCRIPT     ║
╚════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Configuration
$BASE_URL = "http://localhost:5000"
$API_URL = "$BASE_URL/api"

# Step 1: Check Prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check backend
try {
    $null = Invoke-RestMethod -Uri $BASE_URL -Method Get -TimeoutSec 3
    Write-Host "   ✅ Backend server is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend server is NOT running" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please run in another terminal:" -ForegroundColor Yellow
    Write-Host "   cd backend && npm start" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Check MongoDB (optional for quick test)
try {
    $null = & mongosh --quiet --eval "db.version()" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ MongoDB is running" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  MongoDB check skipped" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Login
Write-Host "🔐 Logging in..." -ForegroundColor Yellow
Write-Host "   Email: $userEmail" -ForegroundColor Gray

try {
    $loginBody = @{
        email = $userEmail
        password = $userPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success -and $loginResponse.token) {
        $TOKEN = $loginResponse.token
        $USER_ID = $loginResponse.uid
        Write-Host "   ✅ Login successful" -ForegroundColor Green
        Write-Host "   👤 User: $($loginResponse.firstName) $($loginResponse.lastName)" -ForegroundColor Gray
        Write-Host "   🆔 UID: $USER_ID" -ForegroundColor Gray
        Write-Host ""
    } else {
        throw "Login failed"
    }
} catch {
    Write-Host "   ❌ Login failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please ensure user exists with:" -ForegroundColor Yellow
    Write-Host "   Email: $userEmail" -ForegroundColor Gray
    Write-Host "   Password: $userPassword" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Or run with custom credentials:" -ForegroundColor Yellow
    Write-Host "   .\quick-test.ps1 -userEmail 'your@email.com' -userPassword 'yourpass'" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Step 3: Create Mock Data (if requested)
if ($createMockData) {
    Write-Host "📝 Creating mock data for user..." -ForegroundColor Yellow
    
    $jsScript = @"
const db = db.getSiblingDB('cvacare');
const userId = '$USER_ID';
const now = new Date();

function getRandomPastDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date;
}

// Quick mock articulation
db.articulation_progress.updateOne(
    { user_id: userId, sound_id: 's' },
    { \$set: {
        user_id: userId,
        sound_id: 's',
        levels: {
            '1': {
                level: 1,
                items: [{
                    item_index: 0,
                    target: 'sun',
                    trials: [{
                        trial_number: 1,
                        computed_score: 85,
                        pronunciation_score: 88,
                        recorded_at: getRandomPastDate(3)
                    }]
                }]
            }
        },
        updated_at: now
    }},
    { upsert: true }
);

// Quick mock fluency
db.fluency_progress.updateOne(
    { user_id: userId },
    { \$set: {
        user_id: userId,
        levels: {
            '1': {
                level: 1,
                items: [{
                    item_index: 0,
                    attempts: [{
                        score: 90,
                        completed: true,
                        completed_at: getRandomPastDate(2)
                    }]
                }]
            }
        },
        updated_at: now
    }},
    { upsert: true }
);

print('✅ Mock data created');
"@

    $tempFile = "$env:TEMP\quick-mock.js"
    try {
        $jsScript | Out-File -FilePath $tempFile -Encoding UTF8
        $null = & mongosh --quiet --file $tempFile 2>&1
        Write-Host "   ✅ Mock data created" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "   ⚠️  Mock data creation skipped (MongoDB not available)" -ForegroundColor Yellow
        Write-Host ""
    } finally {
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -Force
        }
    }
}

# Step 4: Test Health Logs Endpoint
Write-Host "📊 Testing /api/health/logs..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    }

    $logsResponse = Invoke-RestMethod -Uri "$API_URL/health/logs" -Method Get -Headers $headers
    
    if ($logsResponse.success) {
        Write-Host "   ✅ Endpoint working!" -ForegroundColor Green
        Write-Host ""
        
        $summary = $logsResponse.data.summary
        $logs = $logsResponse.data.logs
        
        Write-Host "   📈 SUMMARY" -ForegroundColor Cyan
        Write-Host "   ═══════════════════════════════" -ForegroundColor Gray
        Write-Host "   Total Sessions:        $($summary.totalSessions)" -ForegroundColor White
        Write-Host "   Average Score:         $($summary.averageScore)%" -ForegroundColor White
        Write-Host ""
        Write-Host "   By Type:" -ForegroundColor Gray
        Write-Host "     • Articulation:      $($summary.articulationSessions)" -ForegroundColor White
        Write-Host "     • Fluency:           $($summary.fluencySessions)" -ForegroundColor White
        Write-Host "     • Receptive:         $($summary.receptiveSessions)" -ForegroundColor White
        Write-Host "     • Expressive:        $($summary.expressiveSessions)" -ForegroundColor White
        Write-Host ""
        
        if ($logs.Count -gt 0) {
            Write-Host "   📝 RECENT ACTIVITY (Last 3)" -ForegroundColor Cyan
            Write-Host "   ═══════════════════════════════" -ForegroundColor Gray
            
            $logsToShow = [Math]::Min(3, $logs.Count)
            for ($i = 0; $i -lt $logsToShow; $i++) {
                $log = $logs[$i]
                $date = [DateTime]::Parse($log.timestamp).ToString("MMM dd HH:mm")
                
                Write-Host ""
                Write-Host "   $($i + 1). $($log.therapyName)" -ForegroundColor Yellow
                Write-Host "      Score: $($log.score) | $date" -ForegroundColor Gray
            }
            Write-Host ""
        } else {
            Write-Host "   ℹ️  No sessions found" -ForegroundColor Yellow
            Write-Host "   Run with -createMockData to generate test data" -ForegroundColor Gray
            Write-Host ""
        }
    }
} catch {
    Write-Host "   ❌ Endpoint test failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 5: Test Summary Endpoint
Write-Host "📈 Testing /api/health/summary..." -ForegroundColor Yellow

try {
    $summaryResponse = Invoke-RestMethod -Uri "$API_URL/health/summary" -Method Get -Headers $headers
    
    if ($summaryResponse.success) {
        Write-Host "   ✅ Endpoint working!" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    Write-Host "   ❌ Endpoint test failed!" -ForegroundColor Red
    Write-Host ""
}

# Final Summary
Write-Host @"

╔════════════════════════════════════════════╗
║           TEST COMPLETED ✅                ║
╚════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test in the mobile app" -ForegroundColor Gray
Write-Host "  2. Navigate to Health tab" -ForegroundColor Gray
Write-Host "  3. Verify data displays correctly" -ForegroundColor Gray
Write-Host ""

if ($logs.Count -eq 0 -and -not $createMockData) {
    Write-Host "💡 Tip: Run with -createMockData to generate test data:" -ForegroundColor Cyan
    Write-Host "   .\quick-test.ps1 -createMockData" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "For detailed testing, run:" -ForegroundColor Cyan
Write-Host "  .\test-all-health.ps1" -ForegroundColor Gray
Write-Host ""
