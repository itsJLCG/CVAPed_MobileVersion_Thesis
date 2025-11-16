# Health Screen - Quick Start Guide

## 🚀 Getting Started

### Step 1: Start the Backend
```powershell
cd backend
npm start
```

You should see:
```
Server running in development mode on port 5000
✅ Database instance made available to routes
```

### Step 2: Start the Frontend
```powershell
cd frontend
npm start
```

### Step 3: Test the Feature

#### Option A: Using Bottom Navigation
1. Login to the app
2. Look at the bottom navigation bar
3. Tap the **"Health"** tab (heart icon)
4. View your therapy progress logs

#### Option B: Using Quick Actions
1. Login to the app
2. On the home screen, scroll to "Quick Actions"
3. Tap the **"Health"** card
4. View your therapy progress logs

## 📱 What You'll See

### If You Have Therapy Sessions
You'll see:
- **Summary Card** at the top with:
  - Total number of sessions
  - Your average score
  - Breakdown by therapy type

- **Filter Buttons** to filter by:
  - All (default)
  - Articulation
  - Fluency
  - Receptive
  - Expressive

- **Activity Timeline** showing:
  - Color-coded therapy cards
  - Session dates
  - Scores
  - Detailed information

### If You Have No Sessions Yet
You'll see a friendly empty state message:
- "No therapy sessions yet"
- "Start your therapy exercises to see your progress here"

## 🎨 Understanding the Display

### Color Codes
- **Red (#FF6B6B)** = Articulation Therapy
- **Teal (#4ECDC4)** = Fluency Therapy
- **Mint (#95E1D3)** = Receptive Language
- **Pink (#F38181)** = Expressive Language

### Score Badges
- **Green** = 80-100 (Excellent!)
- **Yellow** = 60-79 (Good)
- **Red** = 0-59 (Keep practicing!)

## 🔄 Refreshing Data

### Pull to Refresh
- Pull down on the screen to refresh
- Data will update automatically

### Manual Refresh
- Tap the refresh icon in the top-right corner

## 🐛 Troubleshooting

### "No therapy sessions yet" but you have completed exercises
**Solution:**
1. Make sure you're logged in as the correct user
2. Try pulling down to refresh
3. Check if exercises were actually completed (not just started)
4. Check backend console for errors

### "Failed to load health data"
**Solution:**
1. Make sure backend is running (`cd backend && npm start`)
2. Check your internet connection
3. Verify you're logged in
4. Check if your token is still valid (try logging out and back in)
5. Tap "Retry" button

### Screen is loading forever
**Solution:**
1. Check backend console for errors
2. Check MongoDB is running
3. Check frontend console/debugger
4. Force close and restart the app

### Error: "Cannot read property 'logs' of undefined"
**Solution:**
1. Backend might not be returning data correctly
2. Check backend console for errors
3. Test API endpoint directly with Postman
4. Verify database has progress data

## 🧪 Testing with Sample Data

### Create Sample Progress (if needed)
1. Complete some therapy exercises:
   - Go to Therapy tab
   - Complete an Articulation exercise
   - Complete a Fluency exercise
   - Complete a Language exercise

2. Return to Health Screen
3. Pull to refresh
4. See your progress!

## 📊 Sample API Response

### GET /api/health/logs Response
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "articulation_123_1_0_1",
        "type": "articulation",
        "therapyName": "Articulation Therapy",
        "soundId": "S",
        "level": 1,
        "target": "sun",
        "trialNumber": 1,
        "score": 85,
        "details": {
          "pronunciation": 90,
          "accuracy": 85,
          "completeness": 80,
          "fluency": 85,
          "transcription": "sun"
        },
        "timestamp": "2025-11-16T10:30:00Z"
      }
    ],
    "summary": {
      "totalSessions": 42,
      "articulationSessions": 15,
      "fluencySessions": 10,
      "receptiveSessions": 8,
      "expressiveSessions": 9,
      "averageScore": 78.5,
      "lastActivity": "2025-11-16T10:30:00Z"
    },
    "total": 42
  }
}
```

## 🎯 Key Features to Try

1. **Filter by Type**
   - Tap "Articulation" to see only articulation sessions
   - Tap "All" to see everything again

2. **View Details**
   - Each card shows different details based on therapy type
   - Articulation shows transcriptions
   - Language shows correct/incorrect status

3. **Check Summary**
   - Top card shows overall statistics
   - See breakdown by therapy type

4. **Refresh Data**
   - Pull down to refresh
   - Or tap refresh icon

## 📝 Notes

- Data is loaded automatically when screen opens
- All data is filtered by YOUR user ID (secure)
- Logs are sorted newest first
- Scores are calculated from actual exercise data
- Dates show relative time (Today, Yesterday, etc.)

## ✅ Success Indicators

You'll know it's working when:
- ✅ Screen loads without errors
- ✅ Summary card shows your statistics
- ✅ Timeline shows your sessions
- ✅ Filters change what's displayed
- ✅ Pull-to-refresh works
- ✅ Colors match therapy types
- ✅ Scores are color-coded correctly

## 🎉 You're All Set!

The Health Screen is now fully functional and ready to track your therapy progress!

### Need Help?
Check the detailed documentation:
- `HEALTH_SCREEN_IMPLEMENTATION.md` - Full implementation details
- `HEALTH_SCREEN_CHANGES.md` - Summary of all changes

Happy tracking! 🏥📈
