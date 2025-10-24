# Quick Start Guide

## Prerequisites Check

Before starting, verify you have:

- [ ] Node.js installed (v16+): `node --version`
- [ ] npm installed: `npm --version`
- [ ] MongoDB installed: Check if `mongod` command exists
- [ ] FFmpeg installed: `ffmpeg -version`

## 🚀 5-Minute Setup

### Step 1: Start MongoDB

**Windows:**
```bash
# Option 1: As a service
net start MongoDB

# Option 2: Manual
mongod
```

**macOS/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or run mongod directly
mongod --dbpath ~/data/db
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

### Step 5: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

You should see:
```
Local: http://localhost:5173/
```

### Step 6: Open the Application

Open your browser and navigate to: **http://localhost:5173**

## 🎯 First Use

### 1. Create Your Account

1. Click "Register here"
2. Fill in the form:
   - Username: `admin`
   - Email: `admin@example.com`
   - Password: `admin123`
   - Role: `Admin`
   - Organization: `MyCompany`
3. Click "Register"

### 2. Upload Your First Video

1. Go to "Upload Video" tab
2. Click "Choose File" and select a video
3. Fill in the title
4. Click "Upload Video"
5. Watch the upload progress

### 3. Monitor Processing

1. Switch to "Processing Queue" tab
2. Watch real-time sensitivity analysis progress
3. Wait for completion (simulated, takes ~5 seconds)

### 4. Watch Your Video

1. Go to "My Videos" tab
2. Click "Play" on your completed video
3. Enjoy seamless streaming!

## ⚡ Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoDB connection error: connect ECONNREFUSED`

**Solution:**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill
```

### FFmpeg Not Found

**Error:** `FFmpeg command not found`

**Solution:**
```bash
# Windows (Chocolatey)
choco install ffmpeg

# macOS
brew install ffmpeg

# Linux
sudo apt-get install ffmpeg
```

## 📝 Environment Variables

### Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video_streaming_app
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=104857600
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🎨 Default Roles Explained

| Role | Upload | Edit | Delete | View All |
|------|--------|------|--------|----------|
| Viewer | ❌ | ❌ | ❌ | Own only |
| Editor | ✅ | ✅ | ✅ | Own only |
| Admin | ✅ | ✅ | ✅ | ✅ All |

## 🔧 Development Tips

### Backend Hot Reload

Changes to backend files automatically restart the server (nodemon)

### Frontend Hot Reload

Changes to React components refresh automatically in the browser

### Viewing Logs

- Backend: Check terminal where `npm run dev` is running
- Frontend: Check browser console (F12)

## 📊 Testing the Application

### Test User Accounts

Create these test users:

1. **Admin User**
   - Email: `admin@test.com`
   - Password: `admin123`
   - Role: Admin

2. **Editor User**
   - Email: `editor@test.com`
   - Password: `editor123`
   - Role: Editor

3. **Viewer User**
   - Email: `viewer@test.com`
   - Password: `viewer123`
   - Role: Viewer

### Test Scenarios

1. **Upload as Editor** → Should succeed
2. **Upload as Viewer** → Should show disabled button
3. **View videos as different users** → Should see only own videos
4. **Admin access** → Should see all videos

## 🌐 Network Access

To access from other devices on your network:

### Find Your IP Address

**Windows:**
```bash
ipconfig
```

**macOS/Linux:**
```bash
ifconfig
```

### Update Environment Variables

**Backend `.env`:**
```env
FRONTEND_URL=http://YOUR_IP:5173
```

**Frontend `.env`:**
```env
VITE_API_URL=http://YOUR_IP:5000/api
VITE_SOCKET_URL=http://YOUR_IP:5000
```

### Start Servers

```bash
# Backend
npm run dev

# Frontend
npm run dev -- --host
```

Access from other devices: `http://YOUR_IP:5173`

## 🎬 Sample Videos

For testing, you can use:

- **Small videos**: < 10MB recommended for quick testing
- **Formats**: MP4, MOV, AVI, MKV, WebM
- **Free sources**: 
  - [Pexels Videos](https://www.pexels.com/videos/)
  - [Pixabay Videos](https://pixabay.com/videos/)

## 📱 Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

## 🔒 Security Notes

### For Development

- The JWT_SECRET in `.env` is for development only
- Change it in production to a strong, random string

### For Production

1. Use strong JWT secrets (min 32 characters)
2. Enable HTTPS
3. Set secure CORS policies
4. Use environment-specific configs
5. Enable rate limiting
6. Implement file scanning
7. Use cloud storage (AWS S3, etc.)

## 💡 Pro Tips

1. **Clear Browser Cache**: If you see outdated UI
2. **Check Both Consoles**: Backend terminal + Browser DevTools
3. **MongoDB Compass**: Use it to view database records visually
4. **Postman**: Test API endpoints independently
5. **React DevTools**: Install for better React debugging

## 🆘 Getting Help

If you encounter issues:

1. Check error messages in terminal
2. Check browser console (F12)
3. Verify all services are running
4. Check the full README.md
5. Ensure MongoDB is accessible

## 🎓 Learning Resources

- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Socket.io Guide](https://socket.io/docs/)

---

**Happy Coding! 🚀**
