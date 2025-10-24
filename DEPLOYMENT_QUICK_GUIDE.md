# 🚀 Quick Netlify Deployment - Visual Guide

## Step-by-Step Deployment (15 minutes)

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Deploy Backend to Render                          │
│  ⏱️  Time: ~10 minutes                                      │
└─────────────────────────────────────────────────────────────┘

1. Go to: https://render.com/
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repo: Video-Upload_Sensitivity-Processing...
5. Configure:
   ├── Name: video-streaming-backend
   ├── Root Directory: backend
   ├── Build Command: npm install
   └── Start Command: npm start

6. Add Environment Variables:
   ├── NODE_ENV=production
   ├── PORT=10000
   ├── MONGODB_URI=mongodb+srv://upload_videos:upload_videos@cluster0.4s0vlog.mongodb.net/upload_videos?retryWrites=true&w=majority
   ├── JWT_SECRET=<generate-random-string>
   ├── MAX_FILE_SIZE=104857600
   └── UPLOAD_PATH=./uploads

7. Click "Create Web Service"
8. ⏳ Wait for deployment...
9. ✅ Copy your backend URL: https://xxxxx.onrender.com


┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Deploy Frontend to Netlify                        │
│  ⏱️  Time: ~5 minutes                                       │
└─────────────────────────────────────────────────────────────┘

1. Go to: https://www.netlify.com/
2. Sign up with GitHub
3. Click "Add new site" → "Import from GitHub"
4. Select: Video-Upload_Sensitivity-Processing...
5. Configure:
   ├── Base directory: frontend
   ├── Build command: npm run build
   └── Publish directory: frontend/dist

6. Add Environment Variables (IMPORTANT!):
   ├── VITE_API_URL=https://YOUR-RENDER-URL.onrender.com/api
   └── VITE_SOCKET_URL=https://YOUR-RENDER-URL.onrender.com
   
   ⚠️  Replace YOUR-RENDER-URL with URL from Step 1!

7. Click "Deploy site"
8. ⏳ Wait for deployment...
9. ✅ Copy your frontend URL: https://xxxxx.netlify.app


┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Update Backend CORS                               │
│  ⏱️  Time: ~2 minutes                                       │
└─────────────────────────────────────────────────────────────┘

1. Go back to Render dashboard
2. Click your backend service
3. Go to "Environment" tab
4. Add new variable:
   └── FRONTEND_URL=https://YOUR-NETLIFY-URL.netlify.app
   
   ⚠️  Replace YOUR-NETLIFY-URL with URL from Step 2!

5. Click "Save"
6. ⏳ Backend will auto-redeploy


┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Test Your Application                             │
│  ⏱️  Time: ~3 minutes                                       │
└─────────────────────────────────────────────────────────────┘

1. Visit: https://your-app.netlify.app
2. Register a new user (role: Admin or Editor)
3. Upload a test video
4. Watch real-time processing
5. Play the video

✅ If everything works → YOU'RE DONE! 🎉


┌─────────────────────────────────────────────────────────────┐
│  YOUR DEPLOYED URLS                                         │
└─────────────────────────────────────────────────────────────┘

Frontend: https://______________.netlify.app
Backend:  https://______________.onrender.com
Database: MongoDB Atlas ✅ (already configured)
GitHub:   https://github.com/Mahirathood/Video-Upload_Sensitivity-Processing_and-Streaming-Application
```

---

## 🎯 Environment Variables Cheat Sheet

### Render (Backend):
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://upload_videos:upload_videos@cluster0.4s0vlog.mongodb.net/upload_videos?retryWrites=true&w=majority
JWT_SECRET=<CHANGE-TO-RANDOM-STRING>
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
FRONTEND_URL=https://YOUR-APP.netlify.app
```

### Netlify (Frontend):
```bash
VITE_API_URL=https://YOUR-BACKEND.onrender.com/api
VITE_SOCKET_URL=https://YOUR-BACKEND.onrender.com
```

---

## ⚠️ Common Mistakes to Avoid

❌ **WRONG**: `VITE_API_URL=https://backend.onrender.com`  
✅ **RIGHT**: `VITE_API_URL=https://backend.onrender.com/api` (include `/api`)

❌ **WRONG**: `VITE_SOCKET_URL=https://backend.onrender.com/api`  
✅ **RIGHT**: `VITE_SOCKET_URL=https://backend.onrender.com` (NO `/api`)

❌ **WRONG**: Deploying before backend is ready  
✅ **RIGHT**: Deploy backend first, get URL, then deploy frontend

---

## 🆘 Quick Troubleshooting

### "Cannot connect to server"
→ Check backend URL in Netlify environment variables

### "CORS error"
→ Update FRONTEND_URL in Render to match Netlify URL exactly

### "Socket.io not connecting"
→ Check VITE_SOCKET_URL (should NOT have /api at end)

### "Backend slow to respond"
→ Normal for Render free tier - first request takes 30 seconds

---

## 📱 Share Your Links!

After deployment, share these with your instructor:

1. **Live Application**: https://your-app.netlify.app
2. **GitHub Repository**: https://github.com/Mahirathood/Video-Upload_Sensitivity-Processing_and-Streaming-Application
3. **Demo Video**: (create using OBS, Loom, or screen recording)

---

**Total Deployment Time: ~15 minutes** ⏱️

Good luck! 🚀
