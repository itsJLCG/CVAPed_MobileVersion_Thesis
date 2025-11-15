# Articulation Therapy Azure Speech Integration - Setup Guide

## Overview
This integration adds Azure Cognitive Services Speech SDK for pronunciation assessment to your CVACare mobile app. It's similar to your web version but adapted for React Native with expo-av for audio recording.

## What Was Added

### 1. Backend (Node.js)

#### New Files:
- `backend/routes/articulationAssessment.js` - Azure Speech API integration endpoint

#### Modified Files:
- `backend/.env` - Uncommented Azure credentials
- `backend/server.js` - Added articulation assessment route
- `backend/package.json` - Needs new dependencies (see below)

#### New Dependencies Required:
```bash
cd backend
npm install multer microsoft-cognitiveservices-speech-sdk
```

### 2. Frontend (React Native)

#### New Files:
- `frontend/components/therapy/speech/ArticulationExerciseScreen.js` - Patient exercise screen with recording

#### Modified Files:
- `frontend/components/therapy/speech/ArticulationTherapyScreen.js` - Added navigation to exercise screen

#### Dependencies Already Installed:
- `expo-av` ✅ (for audio recording)
- `@expo/vector-icons` ✅ (for icons)

## Azure Speech Service Setup

### Your Current Credentials (Already in .env):
```
AZURE_SPEECH_KEY=7dSPs6X2kbuX4mIJb4bZBOlDvRoQAOcpb7ta3ybqcVP1Ua8SmyEJJQQJ99BKACqBBLyXJ3w3AAAYACOGLC9x
AZURE_SPEECH_REGION=southeastasia
```

These are already configured and ready to use! ✅

## Installation Steps

### Step 1: Install Backend Dependencies
```powershell
cd C:\Users\ludwi\CVAPed_Mobile\CVACare-Mobile\backend
npm install multer microsoft-cognitiveservices-speech-sdk
```

### Step 2: Restart Backend Server
```powershell
# Stop current backend if running (Ctrl+C)
cd C:\Users\ludwi\CVAPed_Mobile\CVACare-Mobile\backend
node server.js
```

### Step 3: Test the Mobile App
```powershell
cd C:\Users\ludwi\CVAPed_Mobile\CVACare-Mobile\frontend
npx expo start
```

## How It Works

### User Flow:
1. **Patient navigates**: Home → Speech Therapy → Articulation Therapy
2. **Select sound**: Choose from S, R, L, K, or TH sound
3. **Exercise screen loads**:
   - Fetches active exercises from database
   - Loads patient's saved progress
   - Displays 5 progressive levels (Sound → Syllable → Word → Phrase → Sentence)

4. **Recording & Assessment**:
   - Patient presses "Record Response"
   - Records for up to 10 seconds
   - Audio sent to backend → Azure Speech API
   - Returns 4 metrics:
     - Pronunciation Score (40% weight)
     - Accuracy Score (30% weight)
     - Completeness Score (20% weight)
     - Fluency Score (10% weight)

5. **3 Trials System**:
   - Patient gets 3 attempts per item
   - Average score calculated
   - Must score ≥50% to proceed
   - Can retry if failed

6. **Progress Tracking**:
   - Current level and item saved to database
   - Level completion status tracked
   - Visual progress indicator shows completed levels

### Architecture Comparison (Web vs Mobile):

| Feature | Web Version | Mobile Version |
|---------|-------------|----------------|
| **Audio Recording** | Browser MediaRecorder | expo-av Recording |
| **Waveform** | WaveSurfer.js | Simple visual (bars can be added) |
| **Text-to-Speech** | Web Speech API | Alert/Native TTS (can add expo-speech) |
| **Assessment API** | Python Flask | Node.js Express |
| **Azure SDK** | Python SDK | Node.js SDK |
| **UI Framework** | React (Web) | React Native |

## API Endpoints Used

### Backend Endpoints:
- `POST /api/articulation/record` - Process pronunciation assessment
- `GET /api/articulation/exercises/active/:soundId` - Get exercises for sound
- `GET /api/articulation/progress/:soundId` - Get patient progress
- `POST /api/articulation/progress` - Save patient progress

### Request Format (Recording):
```javascript
FormData {
  audio: File (WAV format),
  patient_id: string,
  sound_id: string ('s', 'r', 'l', 'k', 'th'),
  level: number (1-5),
  item_index: number,
  target: string (e.g., "sun"),
  trial: number (1-3)
}
```

### Response Format:
```json
{
  "success": true,
  "transcription": "sun",
  "target": "sun",
  "scores": {
    "pronunciation_score": 0.92,
    "accuracy_score": 0.88,
    "completeness_score": 1.0,
    "fluency_score": 0.85,
    "computed_score": 0.91
  },
  "feedback": "Excellent pronunciation! Keep up the great work."
}
```

## Features Implemented

### ✅ Core Functionality:
- [x] Azure Speech API integration
- [x] Audio recording with expo-av
- [x] 3-trial assessment system
- [x] 4-metric scoring (pronunciation, accuracy, completeness, fluency)
- [x] Progress tracking across 5 levels
- [x] Exercise database integration
- [x] Pass/fail threshold (50%)
- [x] Visual progress indicators
- [x] Retry functionality

### 📊 Assessment Metrics Display:
- [x] Individual trial scores
- [x] Color-coded progress bars per metric
- [x] Average score calculation
- [x] Pass/fail status indicator
- [x] Transcription display ("You said: ...")

### 🎯 User Experience:
- [x] Clean, professional UI
- [x] Color-coded sound themes
- [x] Level progression system
- [x] Item navigation
- [x] Loading states
- [x] Error handling
- [x] Permission requests (microphone)

## Testing Checklist

### Backend Testing:
```powershell
# Test if backend starts without errors
cd backend
node server.js
# Should see: "CVACare Backend API running on port 5000"
```

### Frontend Testing:
1. **Navigate to Articulation**:
   - Login as patient
   - Go to Therapy → Speech Therapy → Articulation Therapy
   - Click any sound card's "BEGIN ASSESSMENT"

2. **Check Exercise Loading**:
   - Should show "Loading exercises..." briefly
   - Then display Level 1 exercises with target word

3. **Test Recording**:
   - Grant microphone permission when prompted
   - Press "Record Response"
   - Speak the target word
   - Press "Stop Recording"
   - Should show "Processing assessment..."

4. **Verify Results**:
   - Check if 4 metric bars display
   - Verify score percentages
   - Check transcription text
   - Try 3 trials
   - Verify average score calculation

5. **Test Progression**:
   - Complete an item (score >50%)
   - Click "Next Item →"
   - Verify moves to next target
   - Complete all items in level
   - Verify moves to next level

## Troubleshooting

### Common Issues:

#### 1. "Failed to process recording"
**Cause**: Backend not running or Azure credentials invalid
**Fix**:
```powershell
# Check backend logs
cd backend
node server.js
# Look for Azure configuration errors
```

#### 2. "No audio data recorded"
**Cause**: Microphone permission denied
**Fix**: Settings → CVACare → Allow Microphone

#### 3. "Exercise not found"
**Cause**: No exercises seeded in database
**Fix**: Use therapist dashboard to add exercises or seed default data

#### 4. Backend crashes on recording
**Cause**: Missing npm dependencies
**Fix**:
```powershell
cd backend
npm install multer microsoft-cognitiveservices-speech-sdk
```

#### 5. "Token is missing"
**Cause**: User not logged in
**Fix**: Logout and login again to refresh token

## Future Enhancements (Optional)

### Potential Additions:
1. **Waveform Visualization**: 
   - Add `react-native-audio-waveform` library
   - Display real-time recording waveform

2. **Text-to-Speech Model Audio**:
   - Install `expo-speech`
   - Replace Alert with actual TTS playback

3. **Progress Charts**:
   - Add `react-native-chart-kit`
   - Show historical performance graphs

4. **Offline Mode**:
   - Cache recordings locally
   - Upload when connection restored

5. **Video Recording**:
   - Add `expo-camera`
   - Record mouth movements for visual feedback

## Differences from Web Version

### What's the Same:
- ✅ Azure Speech API assessment
- ✅ 4-metric scoring system
- ✅ 3-trial format
- ✅ Level progression (5 levels)
- ✅ Exercise database structure
- ✅ Progress tracking

### What's Different:
| Feature | Web | Mobile |
|---------|-----|--------|
| Recording | MediaRecorder API | expo-av |
| Waveform | WaveSurfer.js | Simple bars (can enhance) |
| TTS | Web Speech API | Alert (can add expo-speech) |
| UI | CSS/React | React Native StyleSheet |
| Navigation | React Router | State-based |
| File Upload | FormData (browser) | FormData (React Native) |

## Mobile-Specific Considerations

### Audio Format:
- **Web**: Browser handles encoding
- **Mobile**: Configured for 16kHz WAV (optimal for Azure)

### Permissions:
- **Web**: Browser prompts automatically
- **Mobile**: Explicit permission request via expo-av

### Performance:
- **Mobile**: Smaller screen → optimized layout
- **Mobile**: Limited memory → efficient state management

### Network:
- **Mobile**: Cellular data → show upload progress
- **Mobile**: WiFi-only option in settings (future)

## API Rate Limits

### Azure Speech Service (Free Tier):
- 5 audio hours per month
- ~10,000 transactions per month
- Sufficient for testing and small deployments

### Upgrade Path:
If you exceed limits, upgrade to Standard tier:
- $1 per audio hour
- Pay-as-you-go pricing

## Summary

Your mobile articulation therapy is now fully integrated with Azure Speech Services! 

### What You Can Do Now:
1. Install backend dependencies (`multer`, `microsoft-cognitiveservices-speech-sdk`)
2. Restart backend server
3. Test on mobile app
4. Patients can record pronunciations and get AI-assessed feedback
5. Progress automatically saves across sessions

### Key Files to Know:
- **Backend API**: `backend/routes/articulationAssessment.js`
- **Patient Screen**: `frontend/components/therapy/speech/ArticulationExerciseScreen.js`
- **Sound Selection**: `frontend/components/therapy/speech/ArticulationTherapyScreen.js`
- **Exercises CRUD**: `backend/therapy-exercises/articulation_crud.py` (already exists)

The system is ready to test! Just install the backend dependencies and restart the servers.
