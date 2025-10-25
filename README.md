# 🎬 Video Streaming Platform

A full-stack video upload, processing, and streaming application with real-time updates and role-based access control.

## 🌐 Live Demo

**Frontend:** https://68fc218b9d3a1c76a9267ce5--genuine-crumble-5d7df2.netlify.app/
**Backend API:** https://video-streaming-backend-7vwr.onrender.com

## ✨ Features

- 🎥 Video upload with progress tracking
- 🔍 Automated sensitivity analysis (safe/flagged detection)
- ⚡ Real-time processing updates via Socket.io
- 📺 Video streaming with HTTP range requests
- 🔐 JWT authentication & role-based access (Viewer, Editor, Admin)
- 🏢 Multi-tenant architecture with organization isolation

## 🛠️ Tech Stack

**Backend:** Node.js, Express, MongoDB, Socket.io, JWT, Multer  
**Frontend:** React, Vite, React Router, Axios, Socket.io Client

## 📋 Prerequisites

- Node.js (v16+)
- MongoDB (v4.4+)
- FFmpeg ([Download here](https://ffmpeg.org/download.html))

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Mahirathood/Video-Upload_Sensitivity-Processing_and-Streaming-Application.git
cd full_stack_assignment

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend (.env):**
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video_streaming_app
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=104857600
```

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run the Application
```bash
# Start MongoDB (in separate terminal)
mongod

# Start backend (in separate terminal)
cd backend
npm run dev

# Start frontend (in separate terminal)
cd frontend
npm run dev
```

**Access:** Frontend at `http://localhost:5173`

## 📖 How to Use

1. **Register/Login** - Create account with role (Viewer/Editor/Admin)
2. **Upload Video** - Select video, add title/description/tags (Editor/Admin only)
3. **Monitor Processing** - Watch real-time sensitivity analysis progress
4. **View & Stream** - Browse videos with filters, play with full controls
5. **Manage** - Update or delete your videos (Editor/Admin)

## 🔌 API Endpoints

**Auth:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

**Videos:**
- `POST /api/videos/upload` - Upload video (multipart/form-data)
- `GET /api/videos` - Get all videos (with filters)
- `GET /api/videos/:id` - Get single video
- `GET /api/videos/:id/stream` - Stream video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

**Socket.io Events:**
- `video:uploaded` - Video uploaded successfully
- `video:progress` - Processing progress update
- `video:completed` - Processing completed
- `video:failed` - Processing failed

## 📁 Project Structure

```
full_stack_assignment/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Auth & Video logic
│   │   ├── middleware/       # Auth & Upload
│   │   ├── models/          # User & Video schemas
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Video processing
│   │   └── server.js        # Entry point
│   └── uploads/             # Video storage
└── frontend/
    ├── src/
    │   ├── components/      # UI components
    │   ├── context/         # Auth context
    │   ├── pages/           # Login, Register, Dashboard
    │   └── services/        # API & Socket services
    └── vite.config.js
```

## 🚀 Deployment

**Backend (Render):** https://video-streaming-backend-7vwr.onrender.com  
**Frontend (Netlify):** https://68fc218b9d3a1c76a9267ce5--genuine-crumble-5d7df2.netlify.app

### Deploy Your Own

**Backend on Render:**
1. Connect GitHub repo
2. Set root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables (MONGODB_URI, JWT_SECRET, FRONTEND_URL, etc.)

**Frontend on Netlify:**
1. Connect GitHub repo
2. Base directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables (VITE_API_URL, VITE_SOCKET_URL)

## 🐛 Troubleshooting

- **MongoDB Error:** Ensure MongoDB is running
- **FFmpeg Not Found:** Install FFmpeg and add to PATH
- **CORS Error:** Match FRONTEND_URL in backend with actual frontend URL
- **Port in Use:** Change PORT in .env or kill existing process

## 📄 License

ISC License - Created for Full-Stack Development Assignment

---

**Educational Project** demonstrating video streaming, real-time updates, and secure authentication.
