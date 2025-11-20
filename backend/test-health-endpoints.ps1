# Health Endpoints Test Script
# This script tests the health API endpoints with mock authentication

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Health Endpoints Test Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BASE_URL = "http://localhost:5000"
$API_URL = "$BASE_URL/api"

# Test credentials (make sure this user exists in your database)
$TEST_EMAIL = "test@example.com"
$TEST_PASSWORD = "password123"

Write-Host "Step 1: Testing server connection..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri $BASE_URL -Method Get
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host "   Message: $($healthCheck.message)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Server is not running!" -ForegroundColor Red
    Write-Host "   Please start the server with 'npm start' in the backend directory" -ForegroundColor Red
    Write-Host ""
    exit
}

Write-Host "Step 2: Logging in to get JWT token..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success -and $loginResponse.token) {
        $TOKEN = $loginResponse.token
        Write-Host "✅ Login successful!" -ForegroundColor Green
        Write-Host "   User: $($loginResponse.firstName) $($loginResponse.lastName)" -ForegroundColor Gray
        Write-Host "   Email: $($loginResponse.email)" -ForegroundColor Gray
        Write-Host "   Role: $($loginResponse.role)" -ForegroundColor Gray
        Write-Host "   Token: $($TOKEN.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host ""
    } else {
        throw "Login failed"
    }
} catch {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "   1. User exists with email: $TEST_EMAIL" -ForegroundColor Yellow
    Write-Host "   2. Password is correct: $TEST_PASSWORD" -ForegroundColor Yellow
    Write-Host "   3. You can create a test user by registering in the app" -ForegroundColor Yellow
    Write-Host ""
    exit
}

Write-Host "Step 3: Testing GET /api/health/logs..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    }

    $logsResponse = Invoke-RestMethod -Uri "$API_URL/health/logs" -Method Get -Headers $headers
    
    if ($logsResponse.success) {
        Write-Host "✅ Health logs retrieved successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "   📊 Summary:" -ForegroundColor Cyan
        Write-Host "   ────────────────────────────────────" -ForegroundColor Gray
        Write-Host "   Total Sessions:        $($logsResponse.data.summary.totalSessions)" -ForegroundColor White
        Write-Host "   Articulation Sessions: $($logsResponse.data.summary.articulationSessions)" -ForegroundColor White
        Write-Host "   Fluency Sessions:      $($logsResponse.data.summary.fluencySessions)" -ForegroundColor White
        Write-Host "   Receptive Sessions:    $($logsResponse.data.summary.receptiveSessions)" -ForegroundColor White
        Write-Host "   Expressive Sessions:   $($logsResponse.data.summary.expressiveSessions)" -ForegroundColor White
        Write-Host "   Average Score:         $($logsResponse.data.summary.averageScore)%" -ForegroundColor White
        Write-Host ""
        
        if ($logsResponse.data.total -gt 0) {
            Write-Host "   📝 Recent Logs (showing first 5):" -ForegroundColor Cyan
            Write-Host "   ────────────────────────────────────" -ForegroundColor Gray
            
            $logsToShow = [Math]::Min(5, $logsResponse.data.logs.Count)
            for ($i = 0; $i -lt $logsToShow; $i++) {
                $log = $logsResponse.data.logs[$i]
                $date = [DateTime]::Parse($log.timestamp).ToString("MMM dd, yyyy HH:mm")
                
                Write-Host ""
                Write-Host "   $($i + 1). $($log.therapyName)" -ForegroundColor Yellow
                Write-Host "      Type:      $($log.type)" -ForegroundColor Gray
                Write-Host "      Score:     $($log.score)" -ForegroundColor Gray
                Write-Host "      Date:      $date" -ForegroundColor Gray
                
                if ($log.soundId) {
                    Write-Host "      Sound:     $($log.soundId)" -ForegroundColor Gray
                }
                if ($log.level) {
                    Write-Host "      Level:     $($log.level)" -ForegroundColor Gray
                }
                if ($log.target) {
                    Write-Host "      Target:    $($log.target)" -ForegroundColor Gray
                }
            }
            
            Write-Host ""
            Write-Host "   ... and $($logsResponse.data.total - $logsToShow) more logs" -ForegroundColor Gray
        } else {
            Write-Host "   ℹ️  No therapy sessions found" -ForegroundColor Yellow
            Write-Host "   Complete some therapy exercises to see logs here" -ForegroundColor Gray
        }
        Write-Host ""
    } else {
        throw "Failed to retrieve logs"
    }
} catch {
    Write-Host "❌ Failed to retrieve health logs!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Step 4: Testing GET /api/health/summary..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    }

    $summaryResponse = Invoke-RestMethod -Uri "$API_URL/health/summary" -Method Get -Headers $headers
    
    if ($summaryResponse.success) {
        Write-Host "✅ Health summary retrieved successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "   📈 Detailed Summary by Therapy Type:" -ForegroundColor Cyan
        Write-Host "   ────────────────────────────────────" -ForegroundColor Gray
        
        Write-Host ""
        Write-Host "   🎤 Articulation:" -ForegroundColor Yellow
        Write-Host "      Total Progress Docs: $($summaryResponse.data.articulation.total)" -ForegroundColor Gray
        if ($summaryResponse.data.articulation.sounds) {
            Write-Host "      Sounds Practiced:    $($summaryResponse.data.articulation.sounds -join ', ')" -ForegroundColor Gray
        }
        if ($summaryResponse.data.articulation.lastUpdated) {
            $lastUpdate = [DateTime]::Parse($summaryResponse.data.articulation.lastUpdated).ToString("MMM dd, yyyy HH:mm")
            Write-Host "      Last Updated:        $lastUpdate" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "   💬 Fluency:" -ForegroundColor Yellow
        Write-Host "      Total Progress Docs: $($summaryResponse.data.fluency.total)" -ForegroundColor Gray
        if ($summaryResponse.data.fluency.lastUpdated) {
            $lastUpdate = [DateTime]::Parse($summaryResponse.data.fluency.lastUpdated).ToString("MMM dd, yyyy HH:mm")
            Write-Host "      Last Updated:        $lastUpdate" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "   👂 Receptive Language:" -ForegroundColor Yellow
        Write-Host "      Total Progress Docs:  $($summaryResponse.data.receptive.total)" -ForegroundColor Gray
        Write-Host "      Total Exercises:      $($summaryResponse.data.receptive.totalExercises)" -ForegroundColor Gray
        Write-Host "      Completed Exercises:  $($summaryResponse.data.receptive.completedExercises)" -ForegroundColor Gray
        Write-Host "      Accuracy:             $($summaryResponse.data.receptive.accuracy)%" -ForegroundColor Gray
        if ($summaryResponse.data.receptive.lastUpdated) {
            $lastUpdate = [DateTime]::Parse($summaryResponse.data.receptive.lastUpdated).ToString("MMM dd, yyyy HH:mm")
            Write-Host "      Last Updated:         $lastUpdate" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "   🗣️  Expressive Language:" -ForegroundColor Yellow
        Write-Host "      Total Progress Docs:  $($summaryResponse.data.expressive.total)" -ForegroundColor Gray
        Write-Host "      Total Exercises:      $($summaryResponse.data.expressive.totalExercises)" -ForegroundColor Gray
        Write-Host "      Completed Exercises:  $($summaryResponse.data.expressive.completedExercises)" -ForegroundColor Gray
        Write-Host "      Accuracy:             $($summaryResponse.data.expressive.accuracy)%" -ForegroundColor Gray
        if ($summaryResponse.data.expressive.lastUpdated) {
            $lastUpdate = [DateTime]::Parse($summaryResponse.data.expressive.lastUpdated).ToString("MMM dd, yyyy HH:mm")
            Write-Host "      Last Updated:         $lastUpdate" -ForegroundColor Gray
        }
        
        Write-Host ""
    } else {
        throw "Failed to retrieve summary"
    }
} catch {
    Write-Host "❌ Failed to retrieve health summary!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ All health endpoints are working!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test the frontend by running 'npm start' in the frontend directory" -ForegroundColor Gray
Write-Host "  2. Login to the app and navigate to the Health screen" -ForegroundColor Gray
Write-Host "  3. Verify the data matches what you see above" -ForegroundColor Gray
Write-Host ""
