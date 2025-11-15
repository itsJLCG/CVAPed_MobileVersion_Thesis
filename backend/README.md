# CVACare Mobile - Backend Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Mailtrap account (for OTP emails)

## Installation

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Configuration**

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/cvacare

# JWT Secret (change this in production!)
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# Mailtrap Configuration
# Get your credentials from https://mailtrap.io
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_username_here
MAILTRAP_PASS=your_mailtrap_password_here
```

3. **Get Mailtrap Credentials**

   - Go to [https://mailtrap.io](https://mailtrap.io)
   - Sign up for a free account
   - Go to "Email Testing" → "Inboxes"
   - Click on your inbox
   - Copy the SMTP credentials:
     - Host
     - Port
     - Username
     - Password
   - Paste them into your `.env` file

4. **Start MongoDB**

If using local MongoDB:
```bash
mongod
```

If using MongoDB Atlas, update the `MONGODB_URI` in `.env`

5. **Start the Backend Server**

```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- Body: 
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- Returns: User info (unverified) and sends OTP to email

#### Verify OTP
- **POST** `/api/auth/verify-otp`
- Body:
  ```json
  {
    "email": "john@example.com",
    "otp": "123456"
  }
  ```
- Returns: User info with JWT token

#### Resend OTP
- **POST** `/api/auth/resend-otp`
- Body:
  ```json
  {
    "email": "john@example.com"
  }
  ```
- Returns: Success message (new OTP sent)

#### Login
- **POST** `/api/auth/login`
- Body:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- Returns: User info with JWT token

#### Get Current User
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`
- Returns: Current user info

## Testing the Flow

1. **Register a new user** - OTP will be sent to Mailtrap inbox
2. **Check Mailtrap** - View the OTP email in your Mailtrap inbox
3. **Verify OTP** - Enter the 6-digit code to complete registration
4. **Login** - Use email and password to login

## Frontend Configuration

The frontend is configured to connect to `http://localhost:5000/api` by default.

If running on a physical device:
1. Find your computer's local IP address
2. Update `frontend/services/api.js`:
   ```javascript
   const API_URL = 'http://YOUR_LOCAL_IP:5000/api';
   ```

## Troubleshooting

- **MongoDB Connection Error**: Ensure MongoDB is running
- **Email Not Sending**: Check Mailtrap credentials in `.env`
- **CORS Error**: CORS is enabled by default for all origins in development
- **Port Already in Use**: Change `PORT` in `.env`

## Production Notes

⚠️ **Important**: Before deploying to production:

1. Change `JWT_SECRET` to a strong, random string
2. Replace Mailtrap with a real email service (SendGrid, AWS SES, etc.)
3. Set `NODE_ENV=production`
4. Enable proper CORS configuration
5. Add rate limiting for API endpoints
6. Use HTTPS
