# CVACare Mobile

A comprehensive hybrid healthcare application designed to provide accessible therapy services (speech and physical therapy) via mobile devices. The system uses AI/ML to personalize treatment plans, track patient progress, and facilitate remote therapist monitoring.

## Table of Contents

- [Quick Start](#quick-start)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Key Features](#key-features)
- [API Endpoints](#api-endpoints)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing & Debugging](#testing--debugging)
- [Deployment](#deployment)
- [Common Tasks](#common-development-tasks)
- [Contributing](#contributing)
- [Support & Resources](#support--resources)

---

## Quick Start

### Prerequisites
- Node.js (v14+)
- Python 3.7+
- MongoDB (local or Atlas)
- npm or yarn

### Clone Repository

```bash
git clone https://github.com/itsJLCG/CVAPed_MobileVersion_Thesis
cd CVAPed_Mobile
```

---

## Technology Stack

### Frontend
- **Framework:** React Native 0.81.4 with Expo 54.0.13
- **Language:** JavaScript/JSX
- **Key Libraries:**
  - Axios (HTTP requests)
  - AsyncStorage (local persistence)
  - Firebase Authentication
  - React Native Google Sign-In
  - Expo sensors (accelerometer, gyroscope for gait analysis)
  - Expo media libraries (camera, audio, video)
  - Expo speech synthesis

### Backend - Node.js (Port 5000)
- **Framework:** Express.js 4.18.2
- **Language:** JavaScript
- **Database:** MongoDB with Mongoose
- **Key Libraries:**
  - JWT (jsonwebtoken 9.0.2)
  - Multer (file uploads)
  - Cloudinary (cloud image storage)
  - express-validator
  - bcryptjs (password hashing)
  - Firebase Admin SDK

### Backend - Python Microservices
- **Framework:** Flask 3.0.0
- **Language:** Python 3
- **Port 5001 - Gait Analysis:**
  - Sensor data processing
  - Gait abnormality detection
  - PhysioNet baseline comparison

- **Port 5002 - Therapy Exercises:**
  - ML/AI predictions (XGBoost)
  - Mastery prediction models
  - Exercise recommendations
  - Therapy prioritization
  - Expert systems (Experta framework)

**Key ML Libraries:** XGBoost, scikit-learn, pandas, numpy, networkx

---

## Project Architecture

CVACare Mobile follows a microservices architecture with separation between frontend and backend services:

```
┌─────────────────────────────────────────────────────────────┐
│                  CVACare Mobile App                         │
│              (React Native + Expo)                          │
│              Runs on iOS/Android/Web                        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/JSON
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          Main Backend Server (Node.js/Express)              │
│          Port 5000                                          │
│  • Authentication & User Management                         │
│  • API Gateway for client requests                          │
│  • MongoDB integration for data persistence                 │
└──┬──────────────────────────┬──────────────────────────────┬─┘
   │                          │                              │
   │ HTTP calls               │ HTTP calls                   │ HTTP calls
   ▼                          ▼                              ▼
┌─────────────────────┐  ┌──────────────────────┐  ┌─────────────────────┐
│ Gait Analysis       │  │ Therapy Exercises    │  │ MongoDB Database    │
│ Service             │  │ Service              │  │                     │
│ (Python/Flask)      │  │ (Python/Flask)       │  │ Collections:        │
│ Port 5001           │  │ Port 5002            │  │ • Users             │
│                     │  │                      │  │ • Progress Records  │
│ • Sensor analysis   │  │ • ML Predictions     │  │ • Appointments      │
│ • Gait detection    │  │ • XGBoost models     │  │ • Exercise Plans    │
│ • Baseline compare  │  │ • Recommendations    │  │ • Therapy Data      │
└─────────────────────┘  └──────────────────────┘  └─────────────────────┘
```

### Architecture Decisions

**Why Microservices?**
- Gait Analysis and Therapy Exercises are computationally intensive ML tasks
- Python is better suited for data processing and ML models
- Separates concerns and allows independent scaling
- Flask services can be replaced/upgraded without affecting main API

**Why MongoDB?**
- Flexible schema for different therapy types
- Supports arrays of trials/attempts naturally
- Good performance for document-based queries
- Easy horizontal scaling

**Why Expo?**
- Cross-platform development (iOS/Android from single codebase)
- Easy deployment and OTA updates
- Built-in sensor access
- Development server simplifies testing

---

## Project Structure

```
CVAPed_Mobile/
├── frontend/                           # React Native + Expo
│   ├── App.js                         # Main navigation logic
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── HomePage.js                # Patient dashboard
│   │   ├── AdminDashboard.js
│   │   ├── TherapistDashboard.js
│   │   ├── AppointmentsScreen.js
│   │   ├── HealthScreen.js
│   │   ├── PredictionsScreen.js
│   │   └── therapy/
│   │       ├── PhysicalTherapyScreen.js
│   │       ├── GaitAnalysisScreen.js
│   │       ├── SpeechTherapyScreen.js
│   │       └── speech/
│   │           ├── ArticulationTherapyScreen.js
│   │           ├── FluencyTherapyScreen.js
│   │           ├── LanguageTherapyScreen.js
│   │           └── ReceptiveLanguageScreen.js
│   ├── services/
│   │   └── api.js                     # Centralized Axios API wrapper
│   ├── config/
│   │   ├── apiConfig.js               # Dynamic API URLs
│   │   └── firebase.js                # Firebase setup
│   ├── app.json
│   └── package.json
│
├── backend/                            # Node.js + Python microservices
│   ├── server.js                      # Main Express server
│   ├── start-all.ps1                  # Windows: Start all services
│   ├── routes/                        # API endpoints (16 route files)
│   │   ├── authRoutes.js
│   │   ├── gaitRoutes.js
│   │   ├── exerciseRoutes.js
│   │   ├── articulationRoutes.js
│   │   ├── fluencyRoutes.js
│   │   ├── receptiveRoutes.js
│   │   ├── expressiveRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── therapistRoutes.js
│   │   ├── appointmentRoutes.js
│   │   └── [other specialty routes]
│   ├── controllers/                   # Business logic
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── therapistController.js
│   │   ├── appointmentController.js
│   │   └── diagnosticComparisonController.js
│   ├── models/                        # MongoDB schemas
│   │   ├── User.js
│   │   ├── ArticulationProgress.js
│   │   ├── FluencyProgress.js
│   │   ├── LanguageProgress.js
│   │   ├── ReceptiveProgress.js
│   │   ├── GaitProgress.js
│   │   ├── [Trial models]
│   │   ├── Appointment.js
│   │   ├── ExercisePlan.js
│   │   └── FacilityDiagnostic.js
│   ├── config/
│   │   ├── database.js                # MongoDB connection
│   │   ├── firebaseAdmin.js           # Firebase Admin config
│   │   └── cloudinary.js              # Image upload service
│   ├── middleware/
│   │   └── auth.js                    # JWT verification
│   │
│   ├── gait-analysis/                 # Python Microservice (Port 5001)
│   │   ├── app.py
│   │   ├── gait_processor.py          # Sensor data processing
│   │   ├── problem_detector.py        # Abnormality detection
│   │   ├── data_validator.py
│   │   ├── generate_baselines.py
│   │   ├── process_physionet_data.py
│   │   ├── datasets/
│   │   ├── requirements.txt
│   │   └── venv/                      # Python virtual environment
│   │
│   ├── therapy-exercises/             # Python Microservice (Port 5002)
│   │   ├── app.py
│   │   ├── articulation_mastery_predictor.py    # XGBoost model
│   │   ├── fluency_mastery_predictor.py
│   │   ├── language_mastery_predictor.py
│   │   ├── receptive_mastery_predictor.py
│   │   ├── overall_speech_predictor.py
│   │   ├── exercise_recommender.py    # AI-based recommendations
│   │   ├── therapy_prioritization.py  # Sequencing logic
│   │   ├── articulation_crud.py
│   │   ├── fluency_crud.py
│   │   ├── language_crud.py
│   │   ├── receptive_crud.py
│   │   ├── models/                    # Trained ML model files
│   │   ├── requirements.txt
│   │   └── venv/                      # Python virtual environment
│   │
│   ├── package.json
│   └── .env                           # Environment variables
│
├── .github/
│   └── copilot-instructions.md        # Comprehensive documentation
│
├── AGENTS.md                          # Agentic coding guidelines
├── SETUP.md                           # Deployment guide
├── README.md                          # This file
└── .gitignore
```

---

## Getting Started

### Step 1: Clone Repository

```bash
git clone https://github.com/itsJLCG/CVAPed_MobileVersion_Thesis
cd CVAPed_Mobile
```

### Step 2: Backend Setup

#### A. Node.js Dependencies

```bash
cd backend
npm install
```

#### B. Python Dependencies

```bash
# Gait Analysis Service
cd backend/gait-analysis
python -m venv venv
venv\Scripts\activate      # Windows
# OR
source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt

# Therapy Exercises Service
cd ../therapy-exercises
python -m venv venv
venv\Scripts\activate      # Windows
# OR
source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

#### C. Setup Environment Variables

Create a `.env` file in the `backend` folder:

```env
# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Services
GAIT_SERVICE_URL=http://localhost:5001
THERAPY_SERVICE_URL=http://localhost:5002

# Node Environment
NODE_ENV=development
PORT=5000
```

**Note:** Contact project maintainers for `.env` file and `serviceAccountKey.json` (Firebase config)

### Step 3: Frontend Setup

```bash
cd frontend
npm install
```

#### Update API Configuration

Edit `frontend/config/apiConfig.js`:

```javascript
// Get your machine's IPv4 address
// Windows: Run 'ipconfig' and find IPv4 Address
// macOS/Linux: Run 'ifconfig' and find inet address

const BASE_IP = '192.168.1.100';  // Replace with your IPv4 address

export const API_CONFIG = {
  NODE_SERVER: `http://${BASE_IP}:5000`,
  GAIT_SERVICE: `http://${BASE_IP}:5001`,
  THERAPY_SERVICE: `http://${BASE_IP}:5002`,
};
```

### Step 4: Start Services

#### Option A: Start All Services (Windows PowerShell)

```powershell
cd backend
.\start-all.ps1
```

This script starts:
- Node.js server (Port 5000)
- Gait Analysis service (Port 5001)
- Therapy Exercises service (Port 5002)

#### Option B: Start Individual Services

**Terminal 1 - Node.js Backend:**
```bash
cd backend
npm run dev        # Starts with nodemon (auto-reload)
```

**Terminal 2 - Gait Analysis Service:**
```bash
cd backend/gait-analysis
venv\Scripts\activate
python app.py
```

**Terminal 3 - Therapy Exercises Service:**
```bash
cd backend/therapy-exercises
venv\Scripts\activate
python app.py
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm start          # Starts Expo development server
# or
npx expo start
```

### Step 5: Run on Mobile Device

1. Install Expo Go app on your mobile device (iOS App Store / Google Play Store)
2. Scan the QR code displayed in the terminal running `npm start`
3. App will load on your device

### Step 6: Test the Application

#### Default Test Accounts

**Admin Account:**
```
Email: admin@gmail.com
Password: password
```

**Therapist Account:**
```
Email: therapist@gmail.com
Password: password
```

**Patient Account:**
```
Register a new account in the app
```

---

## Key Features

### 1. **User Management**
- Email/password authentication
- Google Sign-In integration
- Role-based access (Patient, Therapist, Admin)
- User profile management

### 2. **Speech Therapy**
- **Articulation Therapy:** Sound pronunciation practice (s, r, l, k, th)
- **Fluency Therapy:** Stuttering management exercises
- **Language Therapy:** Vocabulary and grammar exercises
- **Receptive Language:** Comprehension training
- AI-powered mastery predictions with XGBoost

### 3. **Physical Therapy**
- **Gait Analysis:** Real-time sensor data collection (accelerometer, gyroscope)
- **Gait Abnormality Detection:** ML-based problem identification
- **PhysioNet Baseline Comparison:** Research-backed analysis
- **Exercise Tracking:** Progress monitoring

### 4. **Therapist Dashboard**
- Patient caseload management
- Progress analytics and reports
- Exercise plan customization
- Appointment scheduling
- Facility vs. home diagnostics comparison

### 5. **Admin Dashboard**
- User management
- System statistics
- System-wide analytics

### 6. **Appointment System**
- Schedule appointments with therapists
- Availability management
- Automated notifications
- Status tracking

### 7. **Progress Tracking**
- Detailed patient metrics
- Historical data analysis
- Success stories with media
- Predictive recommendations

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/verify-token` - Token verification
- `POST /api/auth/google-login` - Google Sign-In

### Gait Analysis
- `POST /api/gait/record` - Save gait session
- `GET /api/gait/history/:userId` - Get patient gait history
- `POST /api/gait/analyze` - Call Python gait service

### Speech Therapy
- `POST /api/articulation/trial` - Submit trial recording
- `GET /api/articulation/progress/:userId` - Get progress
- `POST /api/articulation/recommend` - Get recommendations
- Similar patterns for `/fluency/`, `/receptive/`, `/expressive/`

### Exercise Management
- `POST /api/exercise/create-plan` - Create therapy plan
- `GET /api/exercise/plan/:userId` - Get assigned plan
- `PUT /api/exercise/update-progress` - Update checklist
- `POST /api/exercise/recommendations` - Get AI recommendations

### Appointments
- `POST /api/appointment/create` - Book appointment
- `GET /api/appointment/therapist/:therapistId` - Therapist's appointments
- `GET /api/appointment/patient/:patientId` - Patient's appointments
- `PUT /api/appointment/:appointmentId` - Update appointment

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/statistics` - System stats
- `PUT /api/admin/user/:userId` - Manage user

### Therapist
- `GET /api/therapist/analytics` - Analytics dashboard
- `GET /api/therapist/patients` - Caseload
- `POST /api/therapist/report` - Generate report

---

## Development Workflow

### Response Format (Consistent Across All Endpoints)

All API responses follow this standard format:

```javascript
{
  success: boolean,          // true/false
  data: {...},              // Response payload
  message: string,          // Optional message
  error: null || string     // Error details if failed
}
```

### Key Workflows

#### 1. Speech Therapy (Articulation Example)
1. Patient selects sound to practice (s, r, l, k, th)
2. App records patient's attempt
3. Audio uploaded to backend
4. Python service processes audio
5. XGBoost model predicts mastery level
6. Recommends progression or additional practice
7. Progress tracked in database

**Key Files:**
- `frontend/components/therapy/speech/ArticulationTherapyScreen.js`
- `backend/therapy-exercises/articulation_mastery_predictor.py`
- `backend/routes/articulationRoutes.js`

#### 2. Gait Analysis (Physical Therapy)
1. Patient performs walking exercise
2. Device collects sensor data (accelerometer, gyroscope, magnetometer)
3. Data sent to Python gait service
4. Gait abnormality detection runs
5. Comparison with PhysioNet research baselines
6. Results displayed with recommendations

**Key Files:**
- `frontend/components/therapy/GaitAnalysisScreen.js`
- `backend/gait-analysis/gait_processor.py`
- `backend/gait-analysis/problem_detector.py`
- `backend/routes/gaitRoutes.js`

#### 3. Therapist Dashboard
1. Therapist logs in and views patient caseload
2. Reviews individual patient progress metrics
3. Adjusts therapy plans or exercises
4. Compares facility vs. home diagnostics
5. Generates performance reports
6. Sends messages/updates to patients

**Key Files:**
- `frontend/components/TherapistDashboard.js`
- `backend/routes/therapistRoutes.js`
- `backend/controllers/therapistController.js`

---

## Coding Standards

### Frontend (React Native/Expo)

**Imports:**
```javascript
// ES6 imports
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';

// Import order: React/Expo → packages → components → services → styles
```

**Naming Conventions:**
- PascalCase for component files: `UserProfile.js`
- camelCase for variables/functions: `handleSubmit()`
- UPPER_SNAKE_CASE for constants: `API_URL`
- Descriptive state: `const [isLoading, setIsLoading]`

**Component Structure:**
```javascript
export default function ComponentName() {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  const handleAction = () => {
    // Handler logic
  };
  
  return <View>{/* JSX */}</View>;
}
```

### Backend (Node.js/Express)

**Imports & Code Style:**
```javascript
// CommonJS imports
const express = require('express');
const mongoose = require('mongoose');

// camelCase for variables and functions
// 2-space indentation
// Use semicolons
```

**Error Handling:**
```javascript
try {
  const result = await operation();
  return res.status(200).json({ success: true, data: result });
} catch (error) {
  console.error('❌ Operation failed:', error);
  return res.status(500).json({ 
    success: false, 
    message: 'User-friendly error message',
    error: error.message 
  });
}
```

**Database Patterns:**
```javascript
// Use schema validation in model definitions
required: [true, 'Field is required']

// Use proper indexing for frequently queried fields
userSchema.index({ email: 1 });
```

### Backend (Python/Flask)

**Naming Conventions:**
- snake_case for functions: `process_gait_data()`
- PascalCase for classes: `GaitAnalyzer`
- Type hints in function signatures

**Error Handling:**
```python
try:
    result = process_data(sensor_data)
    return jsonify({'success': True, 'data': result}), 200
except ValueError as e:
    return jsonify({'success': False, 'error': str(e)}), 400
except Exception as e:
    return jsonify({'success': False, 'error': 'Internal server error'}), 500
```

### Logging & Comments

Use emoji prefixes for clarity:
- ✅ Success
- ❌ Error
- 🔍 Info
- 📝 Note

Comment **why** not **what** - code shows what it does.

---

## Testing & Debugging

### Current State
- **No automated testing framework** - Manual testing only
- Consider adding Jest (Node.js) and React Native testing libraries

### Debugging Tips

**Frontend:**
- Expo DevTools and console.log
- React Native Debugger
- Mobile device developer menu

**Node Backend:**
- Nodemon auto-reload during development
- console.log with emoji prefixes
- VS Code debugger

**Python Services:**
- Flask logs in terminal
- pdb debugger for Python
- print statements for tracing

**API Testing:**
- Postman or Insomnia for endpoint testing
- cURL commands for quick checks

**Database:**
- MongoDB Compass for data inspection
- Query testing in MongoDB shell

### Common Issues

| Issue | Solution |
|-------|----------|
| Port Conflicts | Ensure ports 5000, 5001, 5002 are free |
| CORS Errors | Check CORS configuration in Express |
| JWT Errors | Verify token exists in AsyncStorage |
| Sensor Data Issues | Check Expo permissions in app.json |
| MongoDB Connection | Verify connection string and network access |
| API URL Errors | Confirm correct IPv4 address in apiConfig.js |

---

## Deployment

### Frontend (Expo/EAS)

**Development:**
```bash
cd frontend
npm start
```

**Build Android APK:**
```bash
eas build --platform android
```

**Build iOS IPA:**
```bash
eas build --platform ios
```

**Current Deployment:** APK file distribution via email
**Project ID:** `6021682e-b63f-49d4-95f0-ac9f3a36c134`

**OTA Updates:** Available via Expo

### Backend (Node.js)

**Production:**
```bash
npm start        # Uses server.js
# or
npm run server
```

**Process Management:**
```bash
npm run daemon   # Uses PM2
```

**Environment Setup:**
- Set `NODE_ENV=production`
- Use MongoDB Atlas for hosted database
- Configure environment variables in `.env`

### Backend (Python Services)

**Production:**
```bash
# Use Gunicorn instead of Flask development server
gunicorn app:app -w 4 -b 0.0.0.0:5001
```

**Process Management:**
- Use systemd, supervisord, or PM2 for service management
- Monitor service health regularly

---

## Common Development Tasks

### Adding a New Therapy Type

1. Create model in `backend/models/`
2. Create CRUD routes in `backend/routes/`
3. Create controller in `backend/controllers/`
4. If ML needed: Create predictor in Python service
5. Create screen in `frontend/components/therapy/`
6. Add API methods in `frontend/services/api.js`
7. Add navigation/routing in `frontend/App.js`

### Adding ML Prediction

1. Create `[feature]_mastery_predictor.py` in therapy-exercises
2. Train/load XGBoost model
3. Create Flask endpoint: `POST /predict`
4. Call from Node backend to Python service
5. Return predictions to frontend

### Adding Admin Feature

1. Create route in `backend/routes/adminRoutes.js`
2. Add controller logic in `backend/controllers/adminController.js`
3. Add admin check middleware
4. Create screen in `frontend/components/AdminDashboard.js`
5. Add navigation and API call

### Modifying API Response Format

Keep responses in format: `{ success: boolean, data: {...}, message: string, error: null/string }`

All API calls in `frontend/services/api.js` handle this format.
Errors are passed to UI with user-friendly messages.

---

## Contributing

### Code Quality Guidelines

1. **Follow coding standards** outlined in this README
2. **Write descriptive commit messages** (use conventional commits)
3. **Test manually** before submitting changes
4. **Use meaningful variable names** (e.g., `validateUserEmail` not `check`)
5. **Keep files focused** on single responsibility (max ~400 lines)
6. **Add comments for complex logic** (explain "why" not "what")
7. **Maintain consistent response formats** across all API endpoints

### Testing Before Push

```bash
# Frontend
cd frontend
npm start          # Test on mobile device

# Backend - Terminal 1
cd backend
npm run dev

# Backend - Terminal 2
cd backend/gait-analysis
python app.py

# Backend - Terminal 3
cd backend/therapy-exercises
python app.py

# Manual testing with default accounts
# Admin: admin@gmail.com / password
# Therapist: therapist@gmail.com / password
```

### Reporting Bugs

When reporting issues, include:
- Clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Relevant logs or error messages
- Platform (iOS/Android/Web)

---

## Support & Resources

### Documentation Files
- **Setup Guide:** `SETUP.md` - Detailed deployment procedures
- **Coding Guidelines:** `AGENTS.md` - Agent-focused development standards
- **Comprehensive Docs:** `.github/copilot-instructions.md` - Full project documentation
- **This File:** `README.md` - Getting started and overview

### Key Reference Files

| File | Purpose |
|------|---------|
| `frontend/App.js` | Main navigation, role-based routing |
| `frontend/services/api.js` | All API endpoints and HTTP methods |
| `frontend/config/apiConfig.js` | API URL configuration |
| `backend/server.js` | Express server setup and middleware |
| `backend/models/User.js` | Core user schema |
| `backend/middleware/auth.js` | JWT authentication |
| `backend/therapy-exercises/exercise_recommender.py` | AI recommendations |
| `backend/gait-analysis/problem_detector.py` | Gait analysis ML |
| `backend/start-all.ps1` | Start all services (Windows) |

### Important Links

- **GitHub Repository:** https://github.com/itsJLCG/CVAPed_MobileVersion_Thesis
- **Expo Project ID:** `6021682e-b63f-49d4-95f0-ac9f3a36c134`
- **Firebase Project:** [Contact maintainers for access]

---

## Quick Reference Commands

```bash
# ============ FRONTEND ============
cd frontend
npm install                # Install dependencies
npm start                  # Start Expo dev server
npx expo start --web       # Run on web browser
npm run android            # Build for Android
npm run ios                # Build for iOS
eas build --platform android   # EAS build Android
eas build --platform ios       # EAS build iOS

# ============ BACKEND (Node.js) ============
cd backend
npm install                # Install dependencies
npm run dev                # Start with nodemon (auto-reload)
npm start                  # Production start
npm run daemon             # PM2 process management

# ============ BACKEND (Python - Gait) ============
cd backend/gait-analysis
python -m venv venv        # Create virtual environment
venv\Scripts\activate      # Windows activation
source venv/bin/activate   # macOS/Linux activation
pip install -r requirements.txt
python app.py

# ============ BACKEND (Python - Therapy) ============
cd backend/therapy-exercises
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python app.py

# ============ START ALL SERVICES (Windows) ============
cd backend
.\start-all.ps1

# ============ DATABASE ============
# MongoDB should be running locally or use Atlas connection
# Check connection with MongoDB Compass
```

---

## Current Limitations

- ⚠️ **No automated testing framework** - Manual testing only
- ⚠️ **No linting/formatting tools** - No ESLint or Prettier configured
- ⚠️ **No TypeScript** - Pure JavaScript throughout

---

## Future Enhancements

- [ ] Add automated testing suite (Jest, React Native Testing Library)
- [ ] Video consultation integration
- [ ] Real-time notifications (Firebase Cloud Messaging)
- [ ] Advanced analytics dashboard
- [ ] Machine learning model versioning
- [ ] More sophisticated therapy sequencing
- [ ] Multilingual support
- [ ] Offline-first architecture
- [ ] Advanced permission system
- [ ] HIPAA compliance audit

---

**Last Updated:** March 2026
**Version:** 1.0
**License:** [To be determined]

For questions or support, refer to the comprehensive documentation in `.github/copilot-instructions.md` or contact the project maintainers.
