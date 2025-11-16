# 🧪 Health Screen Test Scripts - Quick Reference

## Available Test Scripts

### 1. ⚡ Quick Test (Recommended for First Time)
```powershell
.\quick-test.ps1
```
**Best for:** Fast validation, CI/CD, quick checks

**Features:**
- ✅ Auto-checks backend and MongoDB
- ✅ Tests both endpoints
- ✅ Shows summary in terminal
- ✅ No user input required (uses defaults)
- ✅ Colored, easy-to-read output

**With Mock Data:**
```powershell
.\quick-test.ps1 -createMockData
```

**Custom Credentials:**
```powershell
.\quick-test.ps1 -userEmail "your@email.com" -userPassword "yourpass"
```

---

### 2. 🎯 Complete Test Suite (Most Comprehensive)
```powershell
.\test-all-health.ps1
```
**Best for:** Full validation, detailed testing

**Features:**
- ✅ Interactive menu
- ✅ 4 testing options
- ✅ Runs other scripts
- ✅ Complete workflow

---

### 3. 📊 Endpoint Testing
```powershell
.\test-health-endpoints.ps1
```
**Best for:** API validation, debugging endpoints

**Features:**
- ✅ Tests /api/health/logs
- ✅ Tests /api/health/summary
- ✅ Shows detailed response data
- ✅ Validates authentication

---

### 4. 🗄️ Mock Data Creation
```powershell
.\create-mock-health-data.ps1
```
**Best for:** Setting up test data, demos

**Features:**
- ✅ Creates realistic therapy data
- ✅ Multiple therapy types
- ✅ Dates spread over time
- ✅ Various score ranges

---

## 📋 Quick Start Guide

### First Time Setup
```powershell
# 1. Start MongoDB
mongod

# 2. Start Backend (new terminal)
cd backend
npm start

# 3. Run Quick Test (new terminal)
cd backend
.\quick-test.ps1 -createMockData
```

### Daily Development
```powershell
# Quick validation after code changes
.\quick-test.ps1
```

### Before Deployment
```powershell
# Full test suite
.\test-all-health.ps1
# Choose option 3
```

---

## 🎯 Which Script Should I Use?

| Scenario | Script | Command |
|----------|--------|---------|
| First time testing | Quick Test | `.\quick-test.ps1 -createMockData` |
| After code changes | Quick Test | `.\quick-test.ps1` |
| Need mock data | Mock Data | `.\create-mock-health-data.ps1` |
| API debugging | Endpoint Test | `.\test-health-endpoints.ps1` |
| Complete validation | Test Suite | `.\test-all-health.ps1` |
| CI/CD pipeline | Quick Test | `.\quick-test.ps1` |

---

## 🔧 Common Commands

### Test with Default User
```powershell
.\quick-test.ps1
# Uses: test@example.com / password123
```

### Test with Your User
```powershell
.\quick-test.ps1 -userEmail "myuser@email.com" -userPassword "mypass123"
```

### Create Mock Data for Specific User
```powershell
.\create-mock-health-data.ps1
# Enter User ID when prompted
```

### Full Interactive Test
```powershell
.\test-all-health.ps1
# Follow the menu
```

---

## 📊 Understanding Test Output

### ✅ Success Indicators
```
✅ Backend server is running
✅ Login successful
✅ Endpoint working!
✅ Mock data created
```

### ❌ Error Indicators
```
❌ Backend server is NOT running
❌ Login failed!
❌ Endpoint test failed!
```

### ⚠️ Warning Indicators
```
⚠️ MongoDB check skipped
⚠️ Mock data creation skipped
ℹ️ No sessions found
```

---

## 🐛 Quick Troubleshooting

### "Backend server is NOT running"
```powershell
cd backend
npm start
```

### "MongoDB is NOT running"
```powershell
mongod
# Or: net start MongoDB
```

### "Login failed"
**Solution 1:** Create test user
```powershell
# Register in the mobile app
# Email: test@example.com
# Password: password123
```

**Solution 2:** Use your credentials
```powershell
.\quick-test.ps1 -userEmail "your@email.com" -userPassword "yourpass"
```

### "No sessions found"
```powershell
# Create mock data
.\quick-test.ps1 -createMockData
```

---

## 💡 Pro Tips

1. **Use Quick Test for Daily Work**
   ```powershell
   .\quick-test.ps1
   ```

2. **Create Mock Data Once**
   ```powershell
   .\quick-test.ps1 -createMockData
   # Then use quick test without flag
   ```

3. **Check What Data Exists**
   ```powershell
   mongosh
   use cvacare
   db.articulation_progress.find().count()
   db.fluency_progress.find().count()
   ```

4. **Clean Up Test Data**
   ```powershell
   mongosh
   use cvacare
   db.articulation_progress.deleteMany({ user_id: "test_user_id" })
   db.fluency_progress.deleteMany({ user_id: "test_user_id" })
   db.language_progress.deleteMany({ user_id: "test_user_id" })
   ```

---

## 🎨 Sample Output

### Quick Test Success
```
╔════════════════════════════════════════════╗
║   HEALTH SCREEN ONE-CLICK TEST SCRIPT     ║
╚════════════════════════════════════════════╝

🔍 Checking prerequisites...
   ✅ Backend server is running
   ✅ MongoDB is running

🔐 Logging in...
   Email: test@example.com
   ✅ Login successful
   👤 User: Test User
   🆔 UID: abc123xyz

📊 Testing /api/health/logs...
   ✅ Endpoint working!

   📈 SUMMARY
   ═══════════════════════════════
   Total Sessions:        12
   Average Score:         82.5%

   By Type:
     • Articulation:      3
     • Fluency:           3
     • Receptive:         4
     • Expressive:        2

   📝 RECENT ACTIVITY (Last 3)
   ═══════════════════════════════

   1. Articulation Therapy
      Score: 85 | Nov 15 14:30

   2. Fluency Therapy
      Score: 90 | Nov 14 10:15

   3. Receptive Language
      Score: 100 | Nov 13 16:45

📈 Testing /api/health/summary...
   ✅ Endpoint working!

╔════════════════════════════════════════════╗
║           TEST COMPLETED ✅                ║
╚════════════════════════════════════════════╝
```

---

## 📚 Full Documentation

For complete details, see:
- **Testing Guide:** `TESTING_GUIDE.md`
- **Implementation:** `../HEALTH_SCREEN_IMPLEMENTATION.md`
- **Quick Start:** `../HEALTH_SCREEN_QUICKSTART.md`

---

## ⚡ TL;DR

```powershell
# Just run this:
.\quick-test.ps1 -createMockData

# That's it! 🎉
```

---

Made with ❤️ for CVAPed Health Screen Testing
