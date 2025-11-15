# 🎯 Backend Integration Complete!

## What We've Done

Your Python gait analysis backend has been successfully integrated into your main Node.js backend folder!

## 📁 New Files Created

### Backend Integration Files:
1. **`backend/gait-analysis/app.py`** - Flask server for gait analysis (Port 5001)
2. **`backend/gait-analysis/gait_processor.py`** - Core gait analysis algorithms
3. **`backend/gait-analysis/data_validator.py`** - Input validation
4. **`backend/gait-analysis/requirements.txt`** - Python dependencies
5. **`backend/gait-analysis/README.md`** - Python service documentation
6. **`backend/routes/gaitRoutes.js`** - Node.js proxy routes

### Helper Scripts:
7. **`backend/setup-gait-service.ps1`** - Installs all dependencies
8. **`backend/start-services.ps1`** - Starts both services together
9. **`backend/GAIT_INTEGRATION.md`** - Complete integration guide

### Modified Files:
- **`backend/server.js`** - Added gait routes mounting
- **`backend/.env`** - Added `GAIT_ANALYSIS_PORT` and `GAIT_ANALYSIS_URL`

## 🏗️ Architecture

```
┌─────────────────┐
│  React Native   │
│    Frontend     │
│  (Mobile App)   │
└────────┬────────┘
         │
         │ HTTP Requests
         ▼
┌─────────────────────────────────┐
│      Node.js API Server         │
│         (Port 5000)              │
│  ┌───────────────────────────┐  │
│  │   Auth Routes             │  │
│  │   /api/auth/*             │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   Gait Proxy Routes       │  │
│  │   /api/gait/*             │  │
│  └──────────┬────────────────┘  │
└─────────────┼───────────────────┘
              │
              │ Forwards via axios
              ▼
┌─────────────────────────────────┐
│   Python Gait Analysis Service  │
│         (Port 5001)              │
│  ┌───────────────────────────┐  │
│  │  Flask REST API           │  │
│  │  - /health                │  │
│  │  - /api/gait/analyze      │  │
│  │  - /api/gait/realtime     │  │
│  │  - /api/gait/history      │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  Gait Processor           │  │
│  │  - Step Detection         │  │
│  │  - Symmetry Analysis      │  │
│  │  - Stability Calculation  │  │
│  │  (numpy, scipy)           │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

## 🚀 Quick Start Guide

### Step 1: Install Dependencies (First Time)
```powershell
cd backend
.\setup-gait-service.ps1
```

**What this does:**
- Installs `axios` in Node.js backend (for HTTP communication)
- Installs Python packages: Flask, numpy, scipy, Flask-CORS
- Verifies both installations

### Step 2: Start Both Services
```powershell
cd backend
.\start-services.ps1
```

**What this does:**
- Opens two PowerShell windows
- Window 1: Python service on port 5001
- Window 2: Node.js service on port 5000
- Automatically checks if ports are available

### Step 3: Test the Integration
```powershell
# Test Python service directly
curl http://localhost:5001/health

# Test through Node.js proxy (This is what your app will use!)
curl http://localhost:5000/api/gait/health
```

## 📡 How Requests Flow

### Example: Analyzing Gait Data

1. **Frontend sends request:**
   ```javascript
   POST http://localhost:5000/api/gait/analyze
   {
     "userId": "user123",
     "accelerometer": [...],
     "gyroscope": [...]
   }
   ```

2. **Node.js receives at `gaitRoutes.js`:**
   ```javascript
   router.post('/analyze', async (req, res) => {
     // Forwards to Python service
     const response = await axios.post(
       'http://localhost:5001/api/gait/analyze',
       req.body
     );
   });
   ```

3. **Python processes in `app.py`:**
   ```python
   @app.route('/api/gait/analyze', methods=['POST'])
   def analyze_gait():
       # Validates data
       # Runs algorithms (numpy/scipy)
       # Returns analysis
   ```

4. **Response flows back:**
   - Python → Node.js → Frontend

## 🎯 Gait Analysis Features

### Metrics Calculated:
- **Step Count** - Total steps detected
- **Cadence** - Steps per minute
- **Step Length** - Average stride distance (meters)
- **Walking Speed** - Calculated velocity (m/s)
- **Symmetry Index** - Balance score (0-1, higher = better)
- **Stability Score** - Gait consistency (0-1, higher = better)
- **Gait Phases** - Stance/swing phase timing

### Algorithms Used:
- **scipy.signal.find_peaks** - Step detection from accelerometer peaks
- **numpy filtering** - Noise reduction
- **Cross-correlation** - Left/right symmetry analysis
- **Standard deviation** - Stability measurement

## 📝 API Endpoints Reference

### 1. Health Check
```http
GET /api/gait/health
Response: { "status": "healthy", "service": "gait-analysis", ... }
```

### 2. Analyze Gait Session
```http
POST /api/gait/analyze
Body: {
  "userId": "string",
  "accelerometer": [{x, y, z, timestamp}, ...],
  "gyroscope": [{x, y, z, timestamp}, ...]
}
Response: {
  "success": true,
  "analysis": {
    "stepCount": 45,
    "cadence": 112.5,
    ...
  }
}
```

### 3. Real-time Analysis
```http
POST /api/gait/realtime
Body: {
  "userId": "string",
  "accelerometer": {x, y, z, timestamp},
  "gyroscope": {x, y, z, timestamp}
}
Response: {
  "success": true,
  "realtime": {
    "currentCadence": 115,
    "stepDetected": true,
    ...
  }
}
```

### 4. User History
```http
GET /api/gait/history/:userId
Response: {
  "success": true,
  "history": [...]
}
```

## 🔧 Configuration

### Environment Variables (`.env`)
```env
# Node.js Server
PORT=5000

# Python Gait Service
GAIT_ANALYSIS_PORT=5001
GAIT_ANALYSIS_URL=http://localhost:5001
```

### Python Dependencies (`requirements.txt`)
```
Flask==3.1.0
Flask-CORS==5.0.0
numpy>=1.26.0
scipy>=1.11.0
```

### Node.js Dependencies (added)
```
axios - For HTTP requests to Python service
```

## 🎨 Frontend Integration Example

```javascript
// In your React Native app
import { API_URL } from './config';

export const analyzeGaitData = async (accelerometerData, gyroscopeData) => {
  try {
    const response = await fetch(`${API_URL}/api/gait/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
      },
      body: JSON.stringify({
        userId: 'current-user-id',
        accelerometer: accelerometerData,
        gyroscope: gyroscopeData
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Step count:', result.analysis.stepCount);
      console.log('Walking speed:', result.analysis.walkingSpeed);
      console.log('Symmetry:', result.analysis.symmetryIndex);
      return result.analysis;
    }
  } catch (error) {
    console.error('Gait analysis failed:', error);
  }
};
```

## 🛠️ Troubleshooting

### Problem: Port already in use
**Solution:**
```powershell
# The start-services.ps1 script will ask if you want to kill the process
# Or manually:
Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
```

### Problem: Python dependencies not installing
**Solution:**
```powershell
# Make sure Python is installed
python --version

# Upgrade pip
python -m pip install --upgrade pip

# Install manually
cd backend\gait-analysis
pip install Flask Flask-CORS numpy scipy
```

### Problem: Node.js can't connect to Python
**Solution:**
1. Verify Python service is running: `curl http://localhost:5001/health`
2. Check `.env` has `GAIT_ANALYSIS_URL=http://localhost:5001`
3. Verify axios installed: `npm list axios`
4. Restart both services

### Problem: CORS errors
**Solution:**
- Flask-CORS is configured for all origins
- If issues persist, check Python service console for errors
- Restart Python service

## 📚 Next Steps

### 1. Test Backend Integration ✅
Run the setup and start scripts to verify everything works

### 2. Collect Sensor Data (Frontend)
Use Expo's sensor APIs:
```javascript
import { Accelerometer, Gyroscope } from 'expo-sensors';

// Collect data at 100Hz
Accelerometer.setUpdateInterval(10);
Gyroscope.setUpdateInterval(10);
```

### 3. Create Gait Analysis Screen
Build the UI for:
- Starting/stopping data collection
- Real-time feedback
- Displaying analysis results
- Showing historical data

### 4. Add Authentication
Protect gait routes with JWT middleware:
```javascript
router.post('/analyze', authMiddleware, async (req, res) => {
  // Only authenticated users can analyze
});
```

### 5. Store Results in MongoDB
Save analysis results to user's record:
```javascript
// In gaitRoutes.js after getting Python response
await User.findByIdAndUpdate(userId, {
  $push: { gaitHistory: analysisResult }
});
```

## 📖 Documentation

- **Full Integration Guide**: `backend/GAIT_INTEGRATION.md`
- **Python Service**: `backend/gait-analysis/README.md`
- **Gait Algorithms**: `backend/gait-analysis/gait_processor.py`
- **API Routes**: `backend/routes/gaitRoutes.js`

## ✅ Integration Checklist

- [x] Python gait service created
- [x] Node.js proxy routes created
- [x] Server.js updated with gait routes
- [x] Environment variables configured
- [x] Setup script created
- [x] Startup script created
- [x] Documentation written
- [ ] **Run setup-gait-service.ps1** ← DO THIS NEXT
- [ ] **Run start-services.ps1** ← THEN THIS
- [ ] Test endpoints with curl/Postman
- [ ] Create frontend gait analysis screen
- [ ] Collect accelerometer/gyroscope data
- [ ] Display analysis results
- [ ] Add authentication to routes
- [ ] Store results in database

---

## 🎉 Summary

You now have a **two-tier microservices architecture**:
- **Node.js** handles authentication, user management, general API
- **Python** handles specialized gait analysis with scientific computing

The frontend only talks to Node.js on port 5000, and Node.js forwards gait requests to Python on port 5001. This keeps your architecture clean and scalable!

**Ready to test?** Run `.\setup-gait-service.ps1` in the backend directory!
