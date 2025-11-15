# CVACare Backend - Quick Test Guide

## Test the API with curl or Postman

### 1. Health Check
```bash
curl http://localhost:5000
```

Expected response:
```json
{
  "success": true,
  "message": "CVACare Backend API is running",
  "version": "1.0.0"
}
```

### 2. Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email with the OTP sent.",
  "data": {
    "_id": "...",
    "email": "test@example.com",
    "requiresVerification": true
  }
}
```

👉 **Check your Mailtrap inbox for the OTP email!**

### 3. Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

Replace `123456` with the actual OTP from Mailtrap.

Expected response:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user",
    "isVerified": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Resend OTP (if needed)
```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### 5. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 6. Get Current User (Protected Route)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with the token from login/verify response.

## Using Postman

1. Import the following as a collection
2. Create environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: (set after login)

### Register
- Method: POST
- URL: `{{baseUrl}}/auth/register`
- Body (JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### Verify OTP
- Method: POST
- URL: `{{baseUrl}}/auth/verify-otp`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "otp": "123456"
}
```

### Login
- Method: POST
- URL: `{{baseUrl}}/auth/login`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Get Me
- Method: GET
- URL: `{{baseUrl}}/auth/me`
- Headers: `Authorization: Bearer {{token}}`

## Common Issues

### "User already exists"
- Use a different email or delete the user from MongoDB
- Delete: `db.users.deleteOne({email: "test@example.com"})`

### "MongoDB connection error"
- Make sure MongoDB is running: `mongod`
- Check MONGODB_URI in .env

### "OTP has expired"
- OTP expires in 10 minutes
- Use resend-otp endpoint to get a new one

### Email not received
- Check Mailtrap inbox
- Verify MAILTRAP credentials in .env
- Check backend console for errors
