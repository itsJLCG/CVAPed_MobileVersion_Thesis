# Firebase Admin SDK Setup Guide

This guide will help you set up Firebase Admin SDK to sync users to Firebase Authentication.

## What This Does

When users sign in with Google (or verify their email), they will automatically be created in **Firebase Authentication** in addition to your MongoDB database. This allows you to:
- See all users in Firebase Console
- Use Firebase Authentication features
- Have a backup of user data
- Enable Firebase-specific features later

## Setup Steps

### Step 1: Download Service Account Key from Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `cvaped-mobile`
3. **Click the gear icon (⚙️)** next to "Project Overview"
4. **Click "Project settings"**
5. **Go to "Service accounts" tab**
6. **Click "Generate new private key"**
7. **Click "Generate key"** in the confirmation dialog
8. **A JSON file will download** - this is your service account key

**IMPORTANT**: Keep this file **SECURE**! It has admin access to your Firebase project.

### Step 2: Save the Service Account Key

1. **Rename the downloaded file** to `serviceAccountKey.json`
2. **Move it to**: `d:\VSC\CVACare-Mobile\backend\config\serviceAccountKey.json`

Your backend folder structure should look like:
```
backend/
├── config/
│   ├── database.js
│   ├── firebaseAdmin.js
│   └── serviceAccountKey.json  ← Place it here
├── controllers/
├── models/
└── ...
```

### Step 3: Verify .gitignore

The file is already configured to ignore `serviceAccountKey.json`. Verify it's there:

```gitignore
# In backend/.gitignore
serviceAccountKey.json
**/serviceAccountKey.json
firebase-adminsdk-*.json
```

**NEVER commit this file to git!** It contains sensitive credentials.

### Step 4: (Optional) Use Environment Variable

If you want to store the key elsewhere, update your `.env`:

```env
# Optional: Custom path to service account key
FIREBASE_SERVICE_ACCOUNT_PATH=D:\path\to\serviceAccountKey.json
```

If not set, it defaults to `backend/config/serviceAccountKey.json`.

### Step 5: Restart Your Backend Server

```powershell
cd d:\VSC\CVACare-Mobile\backend
npm run dev
```

You should see:
```
✅ Firebase Admin SDK initialized successfully
```

If the file is missing, you'll see:
```
⚠️  Firebase Admin: Service account key not found
⚠️  Users will NOT be synced to Firebase Authentication
```

## How It Works

### When a User Signs In with Google:

1. **Frontend** sends Google ID token to backend
2. **Backend** verifies token with Google
3. **Backend** creates/updates user in **MongoDB**
4. **Backend** creates/updates user in **Firebase Authentication** ✅
5. User appears in Firebase Console!

### When a User Verifies Email (OTP):

1. User receives OTP via email
2. User enters OTP
3. **Backend** verifies OTP
4. **Backend** marks user as verified in **MongoDB**
5. **Backend** creates user in **Firebase Authentication** ✅
6. User appears in Firebase Console!

## Verification

### Check if it's working:

1. **Start backend**: `npm run dev`
2. **Look for**: `✅ Firebase Admin SDK initialized successfully`
3. **Test Google Sign-In** on your app
4. **Check Firebase Console**: https://console.firebase.google.com/
   - Go to **Authentication** → **Users**
   - You should see the new user!

### Backend Logs:

Successful sync:
```
✅ Firebase Admin SDK initialized successfully
✅ Created Firebase Auth user: user@gmail.com
```

Missing service account:
```
⚠️  Firebase Admin: Service account key not found
⚠️  Users will NOT be synced to Firebase Authentication
```

## Troubleshooting

### Error: "Service account key not found"

**Solution**: 
- Make sure `serviceAccountKey.json` is in `backend/config/`
- Check the file name (case-sensitive)
- Verify the path in `.env` if you set a custom path

### Error: "Permission denied" or "Invalid credentials"

**Solution**:
- Download a fresh service account key from Firebase Console
- Make sure you selected the correct Firebase project
- Ensure the JSON file is valid (not corrupted)

### Users not appearing in Firebase

**Solution**:
1. Check backend logs for Firebase sync messages
2. Verify Firebase Admin initialized successfully
3. Check Firebase Console → Authentication → Sign-in method → Google is enabled
4. Try signing in again and check logs

### Error: "Cannot find module './serviceAccountKey.json'"

**Solution**:
- The file is missing or in the wrong location
- Place it in `backend/config/serviceAccountKey.json`
- Or set `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env`

## Security Notes

### ⚠️ CRITICAL SECURITY:

1. **NEVER commit `serviceAccountKey.json` to git**
   - It's already in `.gitignore`
   - Double-check before committing

2. **NEVER share this file publicly**
   - It has full admin access to your Firebase project
   - Anyone with this file can read/write/delete data

3. **Keep it secure**
   - Store in a safe location
   - Don't upload to public servers
   - Don't share in screenshots

4. **Rotate keys if compromised**
   - Go to Firebase Console → Service accounts
   - Delete old key
   - Generate new key

## What Changed in Your Code

### Files Created:
- ✅ `backend/config/firebaseAdmin.js` - Firebase Admin SDK initialization

### Files Modified:
- ✅ `backend/controllers/authController.js` - Added Firebase user sync
- ✅ `backend/.gitignore` - Added service account exclusion

### Your Existing Flow:
- ✅ **NOT CHANGED** - All existing functionality works the same
- ✅ **ENHANCED** - Users now also appear in Firebase Authentication
- ✅ **SAFE** - If Firebase sync fails, your app still works

## Benefits

✅ Users visible in Firebase Console  
✅ Backup of user data  
✅ Can use Firebase features later  
✅ No breaking changes to existing code  
✅ Graceful fallback if Firebase is unavailable  

## Next Steps

1. ✅ Download service account key
2. ✅ Place in `backend/config/serviceAccountKey.json`
3. ✅ Restart backend server
4. ✅ Test Google Sign-In
5. ✅ Check Firebase Console for users

---

**Need Help?** Check the troubleshooting section above or review backend logs for detailed error messages.
