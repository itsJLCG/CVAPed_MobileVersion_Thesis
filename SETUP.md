# 🚀 CVACare Mobile - Setup Guide
## 📥 Step 1: Clone ang Repository

git clone https://github.com/itsJLCG/CVAPed_MobileVersion_Thesis

## ⚙️ Step 2: Backend Setup
### A. Install Dependencies

cd backend
npm install


### B. Install Python Dependencies
cd backend
pip install flask flask-cors pymongo python-dotenv PyJWT


### C. Setup Environment Variables
Gumawa ng `.env` file sa loob ng `backend` folder:
Send ko na lang .env file sayu

## 📱 Step 3: Frontend Setup
cd frontend
npm install

### Update API Configuration
I-edit ang `frontend/config/apiConfig.js`:

palitan ang const BASE_IP = '10.109.35.145';

**Para malaman ang iyong IP address:**
ipconfig
Hanapin ang `IPv4 Address` (Example: 192.168.1.100)

Pa edit mga URL ng tamang IPV4 nyo like sa api.config.js and sa .env


# Service Json

Tapos ung serviceAccountKey.json send ko na langdin kasama ng env lalagay sya under backend -> config


## 🚀 Step 5: Run ang Application
### Backend (3 terminals kailangan)
cd backend
.\start-all.ps1


### Frontend
cd frontend
npx expo start

## 📱 Step 6: I-scan ang QR Code
1. I-scan ang QR code na lalabas sa terminal
2. Gamit ng APK file na naka-send sa Gmail


## 🧪 Step 7: Test ang Application
### Default Admin Account
Email: admin@gmail.com
Password: password

### Default User Account
Register na lang kayu

### Default Therapist Account
Email: therapist@gmail.com
Password: password



## 📁 Project Structure
CVACare-Mobile/
├── backend/
│   ├── server.js              # Main Node.js server (port 3000)
│   ├── therapy_api.py         # Python Therapy API (port 5001)
│   ├── crud_api.py            # Python CRUD API (port 5002)
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   ├── firebaseAdmin.js   # Firebase Admin config
│   │   └── serviceAccountKey.json
│   ├── routes/                # API endpoints
│   ├── models/                # Database models
│   └── middleware/            # Auth middleware
│
└── frontend/
    ├── App.js                 # Main app entry
    ├── components/            # React Native components
    ├── config/
    │   ├── apiConfig.js       # API URLs
    │   └── firebase.js        # Firebase config
    └── services/
        └── api.js             # API service layer




.env
apiConfig.js






cd backend
.\start-all.ps1



cd frontend
npx expo start



Bukas i set up natin sya sa data ko para yung ip same na lang.
