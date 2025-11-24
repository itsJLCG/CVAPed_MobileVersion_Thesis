# Gait Analysis Multi-Sensor Integration & Database Storage

## Changes Made

### 1. Frontend Fixes (`GaitAnalysisScreen.js`)
- **Fixed sensor data transmission**: Now properly sends all 6 sensor types to backend
- **Only sends available sensors**: Uses conditional logic to exclude empty sensor arrays
- **Fixed pedometer format**: Sends proper object with steps, startTime, endTime
- **Removed hardcoded user_id**: Now uses authenticated user from backend
- **Fixed step count display**: Alert now shows correct step count from `metrics.step_count`

### 2. Backend Route Updates (`gaitRoutes.js`)
- **Updated `/api/gait/analyze` endpoint**: Now accepts and forwards all sensor types:
  - accelerometer ✅
  - gyroscope ✅
  - magnetometer ✅
  - barometer ✅
  - deviceMotion ✅
  - pedometer ✅
- **Enhanced database save**: Now stores new sensor metrics and sensors_used tracking
- **Better logging**: Shows step count and sensors used when saving to DB

### 3. Database Model Updates (`GaitProgress.js`)
Added new fields to store multi-sensor metrics:

```javascript
metrics: {
  // ... existing fields ...
  heading_variation: Number,      // 0-1: Walking path straightness
  elevation_change: Number,       // Meters: Total altitude change
  pedometer_steps: Number         // Device step counter validation
}

sensors_used: {
  accelerometer: Boolean,
  gyroscope: Boolean,
  magnetometer: Boolean,
  barometer: Boolean,
  deviceMotion: Boolean,
  pedometer: Boolean
}
```

### 4. Python Backend (`gait_processor.py` & `app.py`)
Already updated with:
- Helper methods for all new sensors
- Heading variation calculation (magnetometer)
- Elevation change calculation (barometer)
- Pedometer step validation
- Sensor availability tracking

## How It Works Now

### Data Flow:
```
📱 Frontend (GaitAnalysisScreen.js)
   ↓ Collects data from 6 sensors (100ms intervals)
   ↓ User stops recording
   ↓
🚀 Sends to Node.js Backend (/api/gait/analyze)
   ↓ Authenticates user with JWT
   ↓ Forwards to Python service
   ↓
🐍 Python Service (Flask)
   ↓ Processes all sensor data
   ↓ Calculates gait metrics
   ↓ Returns analysis results
   ↓
💾 Node.js Backend saves to MongoDB
   ↓ GaitProgress collection
   ↓ Linked to user_id
   ↓
✅ Results returned to Frontend
   ↓ Display analysis
   ↓ Show step count, metrics, progress
```

### Database Storage:
Each gait analysis session is automatically saved with:
- **User ID**: Links to authenticated user
- **Session ID**: Unique identifier for each recording
- **Metrics**: All 11 gait parameters including new sensor data
- **Gait Phases**: Step-by-step breakdown (stance/swing)
- **Analysis Duration**: Recording length
- **Data Quality**: poor/fair/good/excellent
- **Sensors Used**: Tracks which sensors provided data
- **Timestamps**: created_at, updated_at

### Progress Tracking:
Users can now:
1. **View History**: GET `/api/gait/history` to see past sessions
2. **Compare Progress**: Track improvements over time
3. **Daily Analysis**: Perform daily gait checks
4. **Sensor Availability**: See which sensors worked on their device

## Testing

### To test the complete flow:
1. **Start servers**: Run `.\start-all.ps1` in backend folder
2. **Open app**: Run `npx expo start` in frontend folder
3. **Login**: Use authenticated account
4. **Navigate**: Physical Therapy → Gait Analysis
5. **Record**: Walk for 30+ seconds
6. **Analyze**: View results with all metrics
7. **Verify DB**: Check MongoDB for saved GaitProgress document

### Check stored data:
```javascript
// In MongoDB Compass or mongosh:
db.gaitprogresses.find({ user_id: "YOUR_USER_ID" })
  .sort({ created_at: -1 })
  .limit(1)
```

## Features Enabled

### Multi-Sensor Analysis:
- ✅ **Accelerometer**: Basic step detection, vertical oscillation
- ✅ **Gyroscope**: Rotation, stability analysis
- ✅ **Magnetometer**: Walking direction, path straightness
- ✅ **Barometer**: Elevation changes, stairs/slope detection
- ✅ **DeviceMotion**: Filtered sensor fusion for accuracy
- ✅ **Pedometer**: Step count validation

### Clinical Metrics:
- Step count (detected + pedometer validation)
- Cadence (steps/minute)
- Stride length (meters)
- Walking velocity (m/s)
- Gait symmetry (0-1)
- Stability score (0-1)
- Step regularity (0-1)
- Vertical oscillation (meters)
- **NEW**: Heading variation (path straightness)
- **NEW**: Elevation change (altitude tracking)
- **NEW**: Pedometer steps (validation)

### Progress Tracking:
- Daily gait recordings
- Historical data storage
- Performance trends
- Sensor availability tracking
- Data quality assessment

## API Endpoints

### POST `/api/gait/analyze`
**Auth**: Required (JWT token)

**Request Body**:
```json
{
  "accelerometer": [{"x": 0.02, "y": -0.04, "z": 0.99, "timestamp": 1764004119958}, ...],
  "gyroscope": [{"x": 0.01, "y": 0.02, "z": -0.01, "timestamp": 1764004119958}, ...],
  "magnetometer": [{"x": 20.5, "y": -15.2, "z": 45.8, "timestamp": 1764004119958}, ...],
  "barometer": [{"pressure": 1013.25, "relativeAltitude": 0.5, "timestamp": 1764004119958}, ...],
  "deviceMotion": [{"acceleration": {...}, "rotation": {...}, "timestamp": 1764004119958}, ...],
  "pedometer": {"steps": 125, "startTime": 1764004119000, "endTime": 1764004174000},
  "session_id": "session_1764004174743"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "session_id": "session_1764004174743",
    "user_id": "6914dc055821defa2586e3b9",
    "timestamp": "2025-11-25T01:09:36.545795",
    "metrics": {
      "step_count": 20,
      "cadence": 21.93,
      "stride_length": 0.61,
      "velocity": 0.22,
      "gait_symmetry": 0.72,
      "stability_score": 0.85,
      "step_regularity": 0.35,
      "vertical_oscillation": 0.02,
      "heading_variation": 0.15,
      "elevation_change": 0.5,
      "pedometer_steps": 125
    },
    "sensors_used": {
      "accelerometer": true,
      "gyroscope": true,
      "magnetometer": true,
      "barometer": true,
      "deviceMotion": true,
      "pedometer": true
    },
    "gait_phases": [...],
    "analysis_duration": 54.71,
    "data_quality": "excellent"
  }
}
```

### GET `/api/gait/history`
**Auth**: Required (JWT token)

**Query Params**: `?limit=10` (optional, default: 10)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "user_id": "6914dc055821defa2586e3b9",
      "session_id": "session_1764004174743",
      "metrics": {...},
      "sensors_used": {...},
      "created_at": "2025-11-25T01:09:36.545Z",
      "data_quality": "excellent"
    }
  ],
  "count": 1
}
```

## Next Steps

### To implement progress visualization:
1. Create a `GaitProgressScreen.js` component
2. Fetch history with `GET /api/gait/history?limit=30`
3. Display charts showing trends over time
4. Compare metrics week-over-week or month-over-month

### Suggested improvements:
- Add date range filtering to history endpoint
- Export progress reports as PDF
- Set personal goals and track achievements
- Compare against clinical baselines
- Add notifications for daily gait checks
- Implement streak tracking for daily usage

## Troubleshooting

### "0 steps detected" issue:
✅ **FIXED**: Frontend now properly sends all sensor data, and backend correctly saves metrics

### Sensor not available:
- Barometer: Not available on all devices (gracefully handled)
- Pedometer: May require permissions (try-catch in place)
- Magnetometer: Usually available but may need calibration

### Database not saving:
- Check MongoDB connection in `.env`
- Verify user is authenticated (JWT token valid)
- Check console logs for "✓ Gait analysis results saved"

---

**Date**: November 25, 2025
**Status**: ✅ Complete and tested
