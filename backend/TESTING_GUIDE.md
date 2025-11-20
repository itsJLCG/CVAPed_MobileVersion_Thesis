# Health Screen Testing Guide

## 📋 Overview

This directory contains PowerShell test scripts to validate the Health Screen implementation. These scripts allow you to:

1. Create mock therapy progress data
2. Test the health API endpoints
3. Verify the complete functionality

## 🗂️ Test Scripts

### 1. `test-all-health.ps1` (Main Test Runner)
**Purpose:** Interactive menu to run all tests

**Usage:**
```powershell
cd backend
.\test-all-health.ps1
```

**Options:**
- **Option 1:** Create mock health data only
- **Option 2:** Test health endpoints only
- **Option 3:** Both (create mock data AND test endpoints)
- **Option 4:** Quick test (test with existing data)

---

### 2. `create-mock-health-data.ps1`
**Purpose:** Creates mock therapy progress data in MongoDB

**Usage:**
```powershell
cd backend
.\create-mock-health-data.ps1
```

**What it does:**
- Creates Articulation Progress (2 items, 3 trials)
- Creates Fluency Progress (2 exercises, 3 attempts)
- Creates Receptive Language Progress (4 exercises)
- Creates Expressive Language Progress (3 exercises)

**Requirements:**
- MongoDB must be running
- You need a valid User ID (Firebase UID)

**Sample Data Created:**
```
Articulation:
  - Sound 'S', Level 1
  - Items: 'sun', 'sit'
  - Trials with scores 75-88
  - Created over past 7 days

Fluency:
  - Level 1
  - Exercises: 'Reading Practice', 'Breathing Exercise'
  - Scores: 85-95
  - Created over past 6 days

Receptive Language:
  - 4 exercises (3 correct, 1 incorrect)
  - 75% accuracy
  - Created over past 9 days

Expressive Language:
  - 3 exercises (2 correct, 1 incorrect)
  - 66.67% accuracy
  - Created over past 8 days
```

---

### 3. `test-health-endpoints.ps1`
**Purpose:** Tests the health API endpoints

**Usage:**
```powershell
cd backend
.\test-health-endpoints.ps1
```

**What it tests:**
1. Server connectivity
2. User authentication (login)
3. GET `/api/health/logs` endpoint
4. GET `/api/health/summary` endpoint

**Output:**
- Server status
- Login verification
- Summary statistics
- Recent logs (first 5)
- Detailed summary by therapy type

**Default Test Credentials:**
- Email: `test@example.com`
- Password: `password123`

> **Note:** You can modify these credentials at the top of the script

---

## 🚀 Quick Start

### Complete Test Flow

1. **Start MongoDB:**
   ```powershell
   mongod
   ```

2. **Start Backend Server:**
   ```powershell
   cd backend
   npm start
   ```

3. **Run Tests** (in a new terminal):
   ```powershell
   cd backend
   .\test-all-health.ps1
   ```

4. **Choose Option 3** (Complete test)
   - Enter a User ID when prompted
   - Script will create mock data and test endpoints

---

## 📝 Step-by-Step Testing

### Method 1: Using Main Test Runner (Recommended)

```powershell
# Navigate to backend directory
cd d:\VSC\CVAPed_MobileVersion_Thesis\backend

# Run the main test script
.\test-all-health.ps1

# Follow the interactive menu
# Choose option 3 for complete test
```

### Method 2: Manual Testing

**Step 1: Create Mock Data**
```powershell
cd backend
.\create-mock-health-data.ps1

# When prompted, enter a User ID (Firebase UID)
# Example: abc123def456ghi789
```

**Step 2: Test Endpoints**
```powershell
.\test-health-endpoints.ps1

# Script will automatically login and test endpoints
```

---

## 🔧 Prerequisites

### Required Software
- ✅ PowerShell 5.1 or higher (built into Windows)
- ✅ MongoDB installed and running
- ✅ mongosh (MongoDB Shell) installed
- ✅ Node.js and npm
- ✅ Backend server running

### Required Data
- ✅ A user account in the database
- ✅ User's Firebase UID (for mock data creation)

---

## 🎯 Getting a User ID

### Method 1: Register a New User

1. Start the frontend app
2. Register a new user
3. Check MongoDB:
   ```powershell
   mongosh
   use cvacare
   db.users.findOne()
   ```
4. Copy the `_id` or Firebase UID field

### Method 2: Use Existing User

```powershell
mongosh
use cvacare
db.users.find().pretty()
# Copy the user ID you want to test with
```

### Method 3: Create Test User via API

```powershell
# Use the registration endpoint
$body = @{
    firstName = "Test"
    lastName = "User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

---

## 📊 Expected Output

### Successful Test Output

```
================================
Health Screen Test Suite
================================

Checking if backend server is running...
✅ Backend server is running!

Checking if MongoDB is running...
✅ MongoDB is running!

================================
Test Options
================================

1. Create mock health data (requires User ID)
2. Test health endpoints (requires login)
3. Both (create mock data AND test endpoints)
4. Quick test (test endpoints only with existing data)

Enter your choice (1-4): 3

Running complete test suite...

Step 1: Creating mock data
───────────────────────────

Please enter a User ID: abc123xyz

Creating mock data for User ID: abc123xyz

Creating mock Articulation Progress...
✅ Created Articulation Progress

Creating mock Fluency Progress...
✅ Created Fluency Progress

Creating mock Receptive Language Progress...
✅ Created Receptive Language Progress

Creating mock Expressive Language Progress...
✅ Created Expressive Language Progress

========================================
Mock Data Creation Complete!
========================================

Step 2: Testing endpoints
───────────────────────────

Step 1: Testing server connection...
✅ Server is running!

Step 2: Logging in to get JWT token...
✅ Login successful!
   User: Test User
   Email: test@example.com

Step 3: Testing GET /api/health/logs...
✅ Health logs retrieved successfully!

   📊 Summary:
   Total Sessions:        12
   Articulation Sessions: 3
   Fluency Sessions:      3
   Receptive Sessions:    4
   Expressive Sessions:   3
   Average Score:         82.5%

   📝 Recent Logs (showing first 5):
   ...

Step 4: Testing GET /api/health/summary...
✅ Health summary retrieved successfully!
   ...

✅ All health endpoints are working!
```

---

## 🐛 Troubleshooting

### Error: "Server is NOT running"
**Solution:**
```powershell
cd backend
npm start
```

### Error: "MongoDB is NOT running"
**Solution:**
```powershell
# Start MongoDB
mongod

# Or if installed as service:
net start MongoDB
```

### Error: "mongosh is not recognized"
**Solution:**
- Install MongoDB Shell: https://www.mongodb.com/try/download/shell
- Add to PATH: `C:\Program Files\mongosh\bin`

### Error: "Login failed"
**Solution:**
1. Make sure user exists in database
2. Verify credentials in script (lines 11-12)
3. Register a new user in the app
4. Update script with correct credentials

### Error: "User ID is required"
**Solution:**
- Get a valid User ID from MongoDB
- See "Getting a User ID" section above

### Error: "Cannot connect to MongoDB"
**Solution:**
```powershell
# Check MongoDB status
mongosh --eval "db.version()"

# If fails, start MongoDB
mongod --config "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
```

---

## 🔍 Verifying Data in MongoDB

### Check Created Mock Data

```powershell
mongosh
use cvacare

# Check Articulation Progress
db.articulation_progress.find({ user_id: "YOUR_USER_ID" }).pretty()

# Check Fluency Progress
db.fluency_progress.find({ user_id: "YOUR_USER_ID" }).pretty()

# Check Language Progress
db.language_progress.find({ user_id: "YOUR_USER_ID" }).pretty()
```

---

## 🎨 Customizing Test Data

### Change Test Credentials

**File:** `test-health-endpoints.ps1`

```powershell
# Line 11-12
$TEST_EMAIL = "your-email@example.com"
$TEST_PASSWORD = "your-password"
```

### Change Mock Data Values

**File:** `create-mock-health-data.ps1`

Edit the JavaScript section (around line 40+) to customize:
- Number of trials
- Score ranges
- Exercise names
- Date ranges
- Targets/content

### Change Database Name

**File:** `create-mock-health-data.ps1`

```powershell
# Line 13
$DB_NAME = "your_database_name"
```

---

## 📈 Advanced Testing

### Test with Multiple Users

```powershell
# Create data for user 1
.\create-mock-health-data.ps1
# Enter: user_id_1

# Create data for user 2
.\create-mock-health-data.ps1
# Enter: user_id_2

# Test each user
# Update TEST_EMAIL in test-health-endpoints.ps1
.\test-health-endpoints.ps1
```

### Load Testing

```powershell
# Create data for multiple users at once
1..10 | ForEach-Object {
    $userId = "test_user_$_"
    # Run create-mock-health-data.ps1 with $userId
}
```

### API Performance Testing

Add timing to `test-health-endpoints.ps1`:

```powershell
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$logsResponse = Invoke-RestMethod -Uri "$API_URL/health/logs" -Method Get -Headers $headers
$stopwatch.Stop()
Write-Host "Response time: $($stopwatch.ElapsedMilliseconds)ms"
```

---

## 📚 Additional Resources

- **Main Documentation:** `../HEALTH_SCREEN_IMPLEMENTATION.md`
- **Quick Start Guide:** `../HEALTH_SCREEN_QUICKSTART.md`
- **Architecture Diagram:** `../HEALTH_SCREEN_ARCHITECTURE.md`
- **Customization Examples:** `../HEALTH_SCREEN_CUSTOMIZATIONS.md`

---

## ✅ Test Checklist

Before considering tests successful, verify:

- [ ] Backend server starts without errors
- [ ] MongoDB is running and accessible
- [ ] Mock data is created successfully
- [ ] Login endpoint works
- [ ] `/api/health/logs` returns data
- [ ] `/api/health/summary` returns statistics
- [ ] Data matches expected format
- [ ] Scores are within valid range (0-100)
- [ ] Dates are properly formatted
- [ ] All therapy types are represented
- [ ] Frontend can consume the API

---

## 🎉 Success Criteria

Your Health Screen implementation is working correctly when:

✅ All test scripts run without errors  
✅ Mock data appears in MongoDB  
✅ API endpoints return valid JSON  
✅ Summary statistics are calculated correctly  
✅ Logs are sorted chronologically  
✅ Frontend displays the data properly  

---

## 💡 Tips

1. **Run tests after code changes** to ensure nothing broke
2. **Keep test user credentials consistent** for easier testing
3. **Use Option 4** (Quick test) for rapid iteration
4. **Check MongoDB directly** if data doesn't appear in tests
5. **Update test credentials** to match your actual test user

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Review the error messages carefully
4. Check MongoDB and server logs
5. Ensure all dependencies are installed

Happy Testing! 🚀
