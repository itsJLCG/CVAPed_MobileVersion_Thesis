# Gait Analysis Backend Integration Guide

## 🎯 Overview

Your backend now has two services working together:
1. **Node.js API Server** (Port 5000) - Main backend handling auth, user data
2. **Python Gait Service** (Port 5001) - Specialized gait analysis processing

The Node.js server acts as a gateway, forwarding gait analysis requests to the Python service.

## 📁 Project Structure

```
backend/
├── server.js                    # Main Node.js server
├── .env                         # Environment variables
├── routes/
│   ├── authRoutes.js           # Authentication endpoints
│   └── gaitRoutes.js           # NEW: Gait analysis proxy routes
├── gait-analysis/              # NEW: Python service
│   ├── app.py                  # Flask server
│   ├── gait_processor.py       # Analysis algorithms
│   ├── data_validator.py       # Input validation
│   ├── requirements.txt        # Python dependencies
│   └── README.md               # Python service docs
├── setup-gait-service.ps1      # NEW: Dependency installer
└── start-services.ps1          # NEW: Start both services
```

## 🚀 Quick Start

### 1. Install Dependencies (First Time Only)

```powershell
cd backend
.\setup-gait-service.ps1
```

This will:
- Install `axios` for Node.js (to communicate with Python service)
- Install Python packages: Flask, numpy, scipy, Flask-CORS

### 2. Start Both Services

```powershell
cd backend
.\start-services.ps1
```

This will open two PowerShell windows:
- Window 1: Python Gait Service (port 5001)
- Window 2: Node.js API Server (port 5000)

### 3. Test the Integration

```powershell
# Test Python service directly
curl http://localhost:5001/health

# Test through Node.js proxy
curl http://localhost:5000/api/gait/health
```

## 📡 API Endpoints

All gait analysis endpoints are accessed through the Node.js server:

### Health Check
```http
GET http://localhost:5000/api/gait/health
```

### Analyze Gait Data
```http
POST http://localhost:5000/api/gait/analyze
Content-Type: application/json

{
  "userId": "user123",
  "accelerometer": [
    {"x": 0.5, "y": 0.3, "z": 9.8, "timestamp": 1000},
    {"x": 0.6, "y": 0.4, "z": 9.7, "timestamp": 1100}
  ],
  "gyroscope": [
    {"x": 0.1, "y": 0.2, "z": 0.3, "timestamp": 1000},
    {"x": 0.2, "y": 0.3, "z": 0.4, "timestamp": 1100}
  ]
}
```

Response:
```json
{
  "success": true,
  "analysis": {
    "stepCount": 45,
    "cadence": 112.5,
    "stepLength": 0.65,
    "walkingSpeed": 1.22,
    "symmetryIndex": 0.85,
    "stabilityScore": 0.78,
    "gaitPhases": [...]
  }
}
```

### Real-time Analysis
```http
POST http://localhost:5000/api/gait/realtime
Content-Type: application/json

{
  "userId": "user123",
  "accelerometer": {"x": 0.5, "y": 0.3, "z": 9.8, "timestamp": 1000},
  "gyroscope": {"x": 0.1, "y": 0.2, "z": 0.3, "timestamp": 1000}
}
```

### Get User History
```http
GET http://localhost:5000/api/gait/history/user123
```

## 🔧 How It Works

1. **Frontend** → Makes request to `http://localhost:5000/api/gait/analyze`
2. **Node.js Server** → Receives request in `gaitRoutes.js`
3. **Node.js Server** → Forwards to Python service using axios
4. **Python Service** → Processes data using numpy/scipy algorithms
5. **Python Service** → Returns analysis results
6. **Node.js Server** → Returns results to frontend

## 🛠️ Manual Start (Alternative)

If you prefer to start services manually:

### Terminal 1 - Python Service:
```powershell
cd backend\gait-analysis
python app.py
```

### Terminal 2 - Node.js Service:
```powershell
cd backend
npm run dev
```

## ⚙️ Configuration

Environment variables in `backend/.env`:

```env
# Main Node.js server
PORT=5000

# Gait Analysis Service
GAIT_ANALYSIS_PORT=5001
GAIT_ANALYSIS_URL=http://localhost:5001
```

## 📊 Gait Analysis Features

The Python service provides:

### Step Detection
- Detects individual steps from accelerometer data
- Uses scipy peak detection algorithms
- Filters noise with signal processing

### Gait Metrics
- **Cadence**: Steps per minute
- **Step Length**: Average stride distance
- **Walking Speed**: Calculated velocity
- **Symmetry Index**: Balance between left/right steps (0-1)
- **Stability Score**: Gait consistency (0-1)

### Real-time Analysis
- Process streaming sensor data
- Immediate feedback for live monitoring
- Suitable for rehabilitation exercises

## 🎨 Frontend Integration

To use in your React Native app:

```javascript
// In your services/api.js or gait service file

export const analyzeGait = async (accelerometerData, gyroscopeData) => {
  try {
    const response = await fetch(`${API_URL}/api/gait/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // if you add auth
      },
      body: JSON.stringify({
        userId: currentUserId,
        accelerometer: accelerometerData,
        gyroscope: gyroscopeData
      })
    });
    
    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Gait analysis error:', error);
    throw error;
  }
};
```

## 🐛 Troubleshooting

### Port Already in Use
If you see "Port 5000/5001 already in use":
```powershell
# Find and kill process on port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Find and kill process on port 5001
Get-NetTCPConnection -LocalPort 5001 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Python Service Not Starting
```powershell
# Check Python installation
python --version

# Reinstall dependencies
cd backend\gait-analysis
pip install -r requirements.txt
```

### Node.js Can't Connect to Python
1. Verify Python service is running: `curl http://localhost:5001/health`
2. Check `.env` has correct `GAIT_ANALYSIS_URL`
3. Verify axios is installed: `npm list axios`

### CORS Errors
The Python service has CORS enabled for all origins. If issues persist:
- Check Flask-CORS is installed
- Restart both services

## 📝 Next Steps

1. **Test the Integration**: Use Postman or curl to test all endpoints
2. **Add Authentication**: Protect gait routes with JWT middleware
3. **Create Frontend Screen**: Build the gait analysis UI in React Native
4. **Collect Sensor Data**: Use Expo sensors API to gather accelerometer/gyroscope data
5. **Store History**: Save analysis results to MongoDB for user progress tracking

## 📚 Additional Resources

- Python Service Details: `backend/gait-analysis/README.md`
- Gait Analysis Algorithm: `backend/gait-analysis/gait_processor.py`
- Node.js Routes: `backend/routes/gaitRoutes.js`
- Main Server Setup: `backend/server.js`

---

**Need Help?** Check the logs in each PowerShell window for detailed error messages.
