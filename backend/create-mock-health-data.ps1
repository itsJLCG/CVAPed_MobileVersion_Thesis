# Create Mock Health Data Script
# This script creates mock therapy progress data for testing the Health Screen

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Mock Health Data Generator" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$MONGO_URI = "mongodb://localhost:27017"
$DB_NAME = "cvacare"

Write-Host "⚠️  WARNING: This script requires MongoDB to be running" -ForegroundColor Yellow
Write-Host "   and will create mock data in your database." -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Do you want to continue? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Please enter a User ID to create mock data for:" -ForegroundColor Yellow
Write-Host "(This should be the Firebase UID from your users collection)" -ForegroundColor Gray
$USER_ID = Read-Host "User ID"

if ([string]::IsNullOrWhiteSpace($USER_ID)) {
    Write-Host "❌ User ID is required!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Creating mock data for User ID: $USER_ID" -ForegroundColor Green
Write-Host ""

# Create a temporary JavaScript file for MongoDB operations
$jsScript = @"
// Connect to MongoDB
const db = db.getSiblingDB('$DB_NAME');

const userId = '$USER_ID';
const now = new Date();

// Helper function to get random date in the past X days
function getRandomPastDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date;
}

// Helper function to get random score
function getRandomScore(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

print('Creating mock Articulation Progress...');

// Create Articulation Progress for sound 'S'
const articulationDoc = {
    user_id: userId,
    sound_id: 's',
    levels: {
        '1': {
            level: 1,
            is_complete: false,
            items: [
                {
                    item_index: 0,
                    target: 'sun',
                    average_score: 85,
                    passed: true,
                    trials: [
                        {
                            trial_number: 1,
                            computed_score: 82,
                            pronunciation_score: 85,
                            accuracy_score: 80,
                            completeness_score: 85,
                            fluency_score: 78,
                            transcription: 'sun',
                            recorded_at: getRandomPastDate(7)
                        },
                        {
                            trial_number: 2,
                            computed_score: 88,
                            pronunciation_score: 90,
                            accuracy_score: 85,
                            completeness_score: 90,
                            fluency_score: 87,
                            transcription: 'sun',
                            recorded_at: getRandomPastDate(5)
                        }
                    ],
                    completed_at: getRandomPastDate(5)
                },
                {
                    item_index: 1,
                    target: 'sit',
                    average_score: 75,
                    passed: true,
                    trials: [
                        {
                            trial_number: 1,
                            computed_score: 75,
                            pronunciation_score: 78,
                            accuracy_score: 72,
                            completeness_score: 75,
                            fluency_score: 75,
                            transcription: 'sit',
                            recorded_at: getRandomPastDate(3)
                        }
                    ],
                    completed_at: getRandomPastDate(3)
                }
            ],
            started_at: getRandomPastDate(10),
            completed_at: null
        }
    },
    created_at: getRandomPastDate(15),
    updated_at: new Date()
};

db.articulation_progress.updateOne(
    { user_id: userId, sound_id: 's' },
    { \$set: articulationDoc },
    { upsert: true }
);

print('✅ Created Articulation Progress');

// Create Fluency Progress
print('Creating mock Fluency Progress...');

const fluencyDoc = {
    user_id: userId,
    levels: {
        '1': {
            level: 1,
            is_complete: false,
            items: [
                {
                    item_index: 0,
                    exercise_name: 'Reading Practice',
                    attempts: [
                        {
                            score: 90,
                            completed: true,
                            response: 'The quick brown fox jumps over the lazy dog',
                            feedback: 'Good fluency!',
                            completed_at: getRandomPastDate(6)
                        },
                        {
                            score: 95,
                            completed: true,
                            response: 'The quick brown fox jumps over the lazy dog',
                            feedback: 'Excellent improvement!',
                            completed_at: getRandomPastDate(4)
                        }
                    ]
                },
                {
                    item_index: 1,
                    exercise_name: 'Breathing Exercise',
                    attempts: [
                        {
                            score: 85,
                            completed: true,
                            response: 'Deep breath exercise completed',
                            feedback: 'Well done!',
                            completed_at: getRandomPastDate(2)
                        }
                    ]
                }
            ],
            started_at: getRandomPastDate(8)
        }
    },
    created_at: getRandomPastDate(12),
    updated_at: new Date()
};

db.fluency_progress.updateOne(
    { user_id: userId },
    { \$set: fluencyDoc },
    { upsert: true }
);

print('✅ Created Fluency Progress');

// Create Receptive Language Progress
print('Creating mock Receptive Language Progress...');

const receptiveDoc = {
    user_id: userId,
    mode: 'receptive',
    exercises: {
        '1': {
            correct: true,
            attempts: 1,
            user_answer: 'apple',
            correct_answer: 'apple',
            completed_at: getRandomPastDate(9)
        },
        '2': {
            correct: false,
            attempts: 2,
            user_answer: 'banana',
            correct_answer: 'orange',
            completed_at: getRandomPastDate(7)
        },
        '3': {
            correct: true,
            attempts: 1,
            user_answer: 'cat',
            correct_answer: 'cat',
            completed_at: getRandomPastDate(4)
        },
        '4': {
            correct: true,
            attempts: 1,
            user_answer: 'dog',
            correct_answer: 'dog',
            completed_at: getRandomPastDate(2)
        }
    },
    total_exercises: 4,
    completed_exercises: 4,
    correct_exercises: 3,
    accuracy: 75,
    current_exercise: 4,
    created_at: getRandomPastDate(14),
    updated_at: new Date()
};

db.language_progress.updateOne(
    { user_id: userId, mode: 'receptive' },
    { \$set: receptiveDoc },
    { upsert: true }
);

print('✅ Created Receptive Language Progress');

// Create Expressive Language Progress
print('Creating mock Expressive Language Progress...');

const expressiveDoc = {
    user_id: userId,
    mode: 'expressive',
    exercises: {
        '1': {
            correct: true,
            attempts: 1,
            user_answer: 'The ball is red',
            correct_answer: 'The ball is red',
            completed_at: getRandomPastDate(8)
        },
        '2': {
            correct: true,
            attempts: 2,
            user_answer: 'She is running',
            correct_answer: 'She is running',
            completed_at: getRandomPastDate(5)
        },
        '3': {
            correct: false,
            attempts: 1,
            user_answer: 'They are eating',
            correct_answer: 'They are playing',
            completed_at: getRandomPastDate(3)
        }
    },
    total_exercises: 3,
    completed_exercises: 3,
    correct_exercises: 2,
    accuracy: 66.67,
    current_exercise: 3,
    created_at: getRandomPastDate(11),
    updated_at: new Date()
};

db.language_progress.updateOne(
    { user_id: userId, mode: 'expressive' },
    { \$set: expressiveDoc },
    { upsert: true }
);

print('✅ Created Expressive Language Progress');

print('');
print('========================================');
print('Mock Data Creation Complete!');
print('========================================');
print('');
print('Created data for User ID: ' + userId);
print('');
print('Summary:');
print('  - Articulation: 2 items, 3 trials');
print('  - Fluency: 2 exercises, 3 attempts');
print('  - Receptive: 4 exercises');
print('  - Expressive: 3 exercises');
print('');
print('You can now test the Health Screen with this data!');
"@

# Save the JavaScript to a temporary file
$tempFile = "$env:TEMP\create-mock-health-data.js"
$jsScript | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "Executing MongoDB script..." -ForegroundColor Yellow
Write-Host ""

try {
    # Execute the MongoDB script
    $result = & mongosh $MONGO_URI --quiet --file $tempFile 2>&1
    
    # Display the output
    $result | ForEach-Object {
        if ($_ -match "✅") {
            Write-Host $_ -ForegroundColor Green
        } elseif ($_ -match "Creating") {
            Write-Host $_ -ForegroundColor Yellow
        } elseif ($_ -match "========") {
            Write-Host $_ -ForegroundColor Cyan
        } else {
            Write-Host $_ -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "✅ Mock data created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Run the test script: .\test-health-endpoints.ps1" -ForegroundColor Gray
    Write-Host "  2. Or test in the app by logging in with the user" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "❌ Error executing MongoDB script!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "  1. MongoDB is running (mongod)" -ForegroundColor Yellow
    Write-Host "  2. mongosh is installed and in your PATH" -ForegroundColor Yellow
    Write-Host "  3. You have the correct database name" -ForegroundColor Yellow
    Write-Host ""
} finally {
    # Clean up temp file
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
}
