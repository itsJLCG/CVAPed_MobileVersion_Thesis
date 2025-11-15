# 🔧 Configuration Guide

## Quick Setup: Changing IP Address

When running this app on your local network, you need to configure the IP address so the mobile app can communicate with your backend server.

### Step 1: Find Your IPv4 Address

**Windows:**
1. Open Command Prompt (CMD)
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet)
4. Example: `192.168.1.64`

**Mac/Linux:**
1. Open Terminal
2. Type: `ifconfig` or `ip addr show`
3. Look for `inet` address under your active network interface
4. Example: `192.168.1.64`

### Step 2: Update Configuration Files

You only need to change **ONE FILE**:

📝 **`frontend/config/apiConfig.js`**

```javascript
// Change this line to your IP address:
const BASE_IP = '192.168.1.64';  // ⚠️ UPDATE THIS
```

That's it! All API calls will automatically use your configured IP address.

---

## Configuration Details

### Frontend Configuration
- **File**: `frontend/config/apiConfig.js`
- **What it does**: Centralizes all API endpoint URLs
- **Ports configured**:
  - Port 5000: Main Node.js backend (auth, users)
  - Port 5001: Gait Analysis service (Python)
  - Port 5002: Therapy Exercises service (Python)

### Backend Configuration
- **File**: `backend/.env`
- **What it does**: Configures backend services and database
- **Important variables**:
  ```env
  PORT=5000
  GAIT_ANALYSIS_PORT=5001
  THERAPY_PORT=5002
  MONGODB_URI=your_mongodb_connection_string
  ```

---

## Testing Your Configuration

After updating the IP address:

1. **Start Backend Services**:
   ```powershell
   cd backend
   .\start-all.ps1
   ```

2. **Check Console Output**:
   - Frontend should log: `📡 API Configuration: ...`
   - Verify the URLs show your correct IP address

3. **Test Connection**:
   - Open the mobile app
   - Try logging in
   - If you see "Network Error", double-check your IP address

---

## Troubleshooting

### "Network Error" or "Cannot connect"
- ✅ Verify your IP address is correct
- ✅ Ensure your computer and phone are on the same WiFi network
- ✅ Check that backend services are running (ports 5000, 5001, 5002)
- ✅ Try disabling firewall temporarily to test

### "Connection Refused"
- ✅ Make sure all backend services started successfully
- ✅ Check for port conflicts (another app using the same port)

### Backend works but exercises don't load
- ✅ Verify Python services are running (ports 5001, 5002)
- ✅ Check `backend/start-all.ps1` output for errors

---

## For Developers

### Adding New Services

If you add a new backend service:

1. Add port to `backend/.env`:
   ```env
   NEW_SERVICE_PORT=5003
   NEW_SERVICE_URL=http://192.168.1.64:5003
   ```

2. Add to `frontend/config/apiConfig.js`:
   ```javascript
   const PORTS = {
     // ... existing ports
     NEW_SERVICE: 5003,
   };
   
   export const API_CONFIG = {
     // ... existing config
     NEW_SERVICE_URL: `http://${BASE_IP}:${PORTS.NEW_SERVICE}`,
   };
   ```

3. Use in your service file:
   ```javascript
   import { API_CONFIG } from '../config/apiConfig';
   const API_URL = API_CONFIG.NEW_SERVICE_URL;
   ```

---

## Quick Reference

| Service | Port | Purpose |
|---------|------|---------|
| Main Backend | 5000 | Authentication, User Management |
| Gait Analysis | 5001 | Gait Analysis Processing |
| Therapy Exercises | 5002 | Exercise CRUD Operations |

**Remember**: Only change the `BASE_IP` in `frontend/config/apiConfig.js` - everything else updates automatically! 🚀
