# 🔥 Firebase Admin - Quick Setup (2 Minutes)

## What You Need to Do NOW:

### 1️⃣ Download Service Account Key

🌐 Go to: https://console.firebase.google.com/

1. Select project: **cvaped-mobile**
2. Click ⚙️ → **Project settings**
3. Click **Service accounts** tab
4. Click **"Generate new private key"**
5. Click **"Generate key"** (downloads JSON file)

### 2️⃣ Place the File

1. **Rename** downloaded file to: `serviceAccountKey.json`
2. **Move** to: `D:\VSC\CVACare-Mobile\backend\config\serviceAccountKey.json`

### 3️⃣ Restart Backend

```powershell
cd D:\VSC\CVACare-Mobile\backend
npm run dev
```

Look for:
```
✅ Firebase Admin SDK initialized successfully
```

### 4️⃣ Test

1. Sign in with Google on your app
2. Check Firebase Console → Authentication → Users
3. Your user should appear! ✅

---

## ⚠️ IMPORTANT

**NEVER commit `serviceAccountKey.json` to git!**
- It's already in `.gitignore` ✅
- Contains admin credentials 🔐
- Keep it secret! 🤫

---

## What This Does

✅ Users now appear in Firebase Authentication  
✅ MongoDB still works as before  
✅ No breaking changes  
✅ If Firebase fails, app still works  

---

## Troubleshooting

**"Service account key not found"**
→ Check file is at: `backend/config/serviceAccountKey.json`

**Users not appearing**
→ Check backend logs for Firebase messages

**Full Guide**: See `FIREBASE_ADMIN_SETUP.md`

---

That's it! Just download the key and place it in the right folder. 🚀
