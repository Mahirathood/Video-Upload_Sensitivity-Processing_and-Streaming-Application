# 🚀 Netlify + Render Deployment Guide

This guide will help you deploy your Video Streaming Platform with:
- **Frontend**: Netlify (React app)
- **Backend**: Render (Node.js API)
- **Database**: MongoDB Atlas (already set up)

---

## 📋 Prerequisites

✅ You already have:
- GitHub repository: https://github.com/Mahirathood/Video-Upload_Sensitivity-Processing_and-Streaming-Application
- MongoDB Atlas database configured
- Code pushed to GitHub

---

## Part 1: Deploy Backend to Render (Free)

### Step 1: Create Render Account

1. Go to https://render.com/
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### Step 2: Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository:
   - Find: `Video-Upload_Sensitivity-Processing_and-Streaming-Application`
   - Click "Connect"

### Step 3: Configure Web Service

**Basic Settings:**
- **Name**: `video-streaming-backend` (or your choice)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`

**Build Settings:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 4: Set Environment Variables

Click "Advanced" → Add these environment variables:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://upload_videos:upload_videos@cluster0.4s0vlog.mongodb.net/upload_videos?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
```

**Important**: 
- Change `JWT_SECRET` to a strong random string
- You can generate one here: https://www.uuidgenerator.net/

### Step 5: Add FFmpeg Buildpack (IMPORTANT!)

In "Advanced" settings:
- Scroll to "Build & Deploy"
- Add build command: `npm install`

**Note**: Render includes FFmpeg by default in Node environments

### Step 6: Deploy!

1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Your backend URL will be: `https://video-streaming-backend.onrender.com`
4. **SAVE THIS URL** - you'll need it for frontend!

### Step 7: Test Backend

Once deployed, test it:
```
https://your-backend-url.onrender.com/api/health
```

Should return: `{"status":"OK","message":"Server is running"}`

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Update Frontend Environment Variables

**IMPORTANT**: Before deploying, you need to update the API URL!

1. After backend is deployed, copy your Render backend URL
2. You'll set this in Netlify environment variables

### Step 2: Create Netlify Account

1. Go to https://www.netlify.com/
2. Click "Sign up" → "Sign up with GitHub"
3. Authorize Netlify

### Step 3: Deploy from GitHub

1. Click "Add new site" → "Import an existing project"
2. Click "Deploy with GitHub"
3. Authorize Netlify to access your repositories
4. Select: `Video-Upload_Sensitivity-Processing_and-Streaming-Application`

### Step 4: Configure Build Settings

**Site Settings:**
- **Branch to deploy**: `main`
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

### Step 5: Set Environment Variables

Click "Show advanced" → Add environment variables:

```
VITE_API_URL=https://YOUR-RENDER-BACKEND-URL.onrender.com/api
VITE_SOCKET_URL=https://YOUR-RENDER-BACKEND-URL.onrender.com
```

**Replace** `YOUR-RENDER-BACKEND-URL` with your actual Render backend URL!

Example:
```
VITE_API_URL=https://video-streaming-backend.onrender.com/api
VITE_SOCKET_URL=https://video-streaming-backend.onrender.com
```

### Step 6: Deploy!

1. Click "Deploy site"
2. Wait 3-5 minutes
3. Your site will be at: `https://random-name-12345.netlify.app`

### Step 7: Custom Domain (Optional)

1. Go to "Domain settings"
2. Click "Options" → "Edit site name"
3. Change to: `your-video-platform` (if available)
4. New URL: `https://your-video-platform.netlify.app`

---

## Part 3: Update Backend CORS Settings

### CRITICAL: Update Backend Environment Variable

1. Go back to Render dashboard
2. Click your backend service
3. Go to "Environment"
4. Update/Add this variable:

```
FRONTEND_URL=https://your-netlify-app.netlify.app
```

Replace with your actual Netlify URL!

5. Click "Save Changes"
6. Render will automatically redeploy

---

## Part 4: Test Your Deployed Application

### Test Checklist:

1. **Visit Frontend**: `https://your-app.netlify.app`
   - ✅ Should load the login page

2. **Register New User**:
   - ✅ Should successfully create account
   - ✅ Should redirect to dashboard

3. **Upload Video** (as Editor/Admin):
   - ✅ Should show upload progress
   - ✅ Should save to MongoDB Atlas

4. **Check Processing**:
   - ✅ Should see real-time progress in Processing Queue
   - ✅ Socket.io should work

5. **Play Video**:
   - ✅ Should stream video successfully
   - ✅ Video controls should work

---

## 🎯 Quick Reference

### Your Deployed URLs:

**Backend (Render)**:
```
https://your-backend.onrender.com
```

**Frontend (Netlify)**:
```
https://your-app.netlify.app
```

**Database**:
```
MongoDB Atlas (already configured)
```

---

## 🔧 Troubleshooting

### Issue: CORS Errors

**Solution**: Make sure `FRONTEND_URL` in Render matches your Netlify URL exactly

### Issue: API Not Found (404)

**Solution**: Check that `VITE_API_URL` in Netlify includes `/api` at the end

### Issue: Socket.io Not Connecting

**Solution**: 
1. Check `VITE_SOCKET_URL` in Netlify (no `/api` at end)
2. Make sure Render backend is running

### Issue: Video Upload Fails

**Solution**: 
1. Check file size (max 100MB by default)
2. Check Render logs for errors
3. Verify MongoDB connection

### Issue: Backend Slow on First Request

**Solution**: Render free tier sleeps after 15 minutes of inactivity. First request will take ~30 seconds to wake up. This is normal for free tier.

---

## 📊 Free Tier Limitations

### Netlify Free Tier:
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Unlimited sites
- ⚠️ Videos hosted on backend (not Netlify)

### Render Free Tier:
- ✅ 750 hours/month (enough for 1 app 24/7)
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ Spins down after 15 min idle
- ⚠️ Limited to 512MB RAM

### MongoDB Atlas Free Tier:
- ✅ 512MB storage
- ✅ Shared cluster
- ⚠️ Limited to small video metadata

---

## 🚀 Upgrade Recommendations (Optional)

For production use:

**Render** ($7/month):
- No sleep
- More RAM
- Better performance

**Cloudinary** (for video storage):
- Better video handling
- Automatic optimization
- CDN delivery

---

## 📝 Environment Variables Summary

### Backend (Render):
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://upload_videos:upload_videos@cluster0.4s0vlog.mongodb.net/upload_videos?retryWrites=true&w=majority
JWT_SECRET=<your-strong-secret-here>
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
FRONTEND_URL=https://your-app.netlify.app
```

### Frontend (Netlify):
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Render
- [ ] Backend environment variables set
- [ ] Backend URL copied
- [ ] Frontend environment variables updated with backend URL
- [ ] Frontend deployed to Netlify
- [ ] Frontend URL copied
- [ ] Backend FRONTEND_URL updated with Netlify URL
- [ ] Backend redeployed with new FRONTEND_URL
- [ ] Test registration
- [ ] Test video upload
- [ ] Test video playback
- [ ] Test real-time updates

---

## 🎬 Next Steps

After deployment:

1. **Test thoroughly** with different user roles
2. **Create video demo** of the application
3. **Share your URLs**:
   - Frontend: `https://your-app.netlify.app`
   - GitHub: `https://github.com/Mahirathood/Video-Upload_Sensitivity-Processing_and-Streaming-Application`

---

## 🆘 Need Help?

### View Logs:

**Render**:
1. Go to your service dashboard
2. Click "Logs" tab
3. See real-time server logs

**Netlify**:
1. Go to your site
2. Click "Deploys"
3. Click on latest deploy
4. View build logs

---

**Good luck with your deployment! 🚀**

Your app will be live and accessible worldwide!
