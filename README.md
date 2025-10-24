# Video Upload, Sensitivity Processing, and Streaming Application

A comprehensive full-stack application for video upload, content sensitivity analysis, and seamless video streaming with real-time progress tracking.

## 🎯 Features

### Core Functionality
- **Full-Stack Architecture**: Node.js + Express + MongoDB (backend) and React + Vite (frontend)
- **Video Management**: Complete video upload and secure storage system
- **Content Analysis**: Automated video sensitivity detection (safe/flagged classification)
- **Real-Time Updates**: Live processing progress using Socket.io
- **Video Streaming**: HTTP range request support for efficient video playback
- **Multi-Tenant Architecture**: User isolation and data segregation
- **Role-Based Access Control (RBAC)**: Three roles - Viewer, Editor, and Admin

### User Roles
- **Viewer**: Read-only access to assigned videos
- **Editor**: Upload, edit, and manage video content
- **Admin**: Full system access including user management

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Multer
- **Video Processing**: FFmpeg

### Frontend Stack
- **Build Tool**: Vite
- **Framework**: React
- **Routing**: React Router
- **HTTP Client**: Axios
- **Real-Time**: Socket.io Client
- **Styling**: CSS Modules

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **FFmpeg** (for video processing)
- **Git** (for version control)

### Installing FFmpeg

#### Windows
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

#### macOS
```bash
brew install ffmpeg
```

#### Linux
```bash
sudo apt-get install ffmpeg
```

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd full_stack_assignment
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create .env file with the following content:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video_streaming_app
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=104857600
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
# Create .env file with the following content:
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

## 🎬 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📖 Usage Guide

### 1. User Registration
- Navigate to `http://localhost:5173`
- Click "Register here" on the login page
- Fill in the registration form:
  - Username (min 3 characters)
  - Email
  - Password (min 6 characters)
  - Select Role (Viewer/Editor/Admin)
  - Organization name (optional, defaults to "default")
- Click "Register"

### 2. User Login
- Enter your email and password
- Click "Login"
- You'll be redirected to the dashboard

### 3. Upload Video (Editor/Admin only)
- Navigate to the "Upload Video" tab
- Select a video file (supported formats: MP4, MOV, AVI, MKV, WebM)
- Fill in metadata:
  - Title (required)
  - Description (optional)
  - Tags (comma-separated, optional)
  - Category
- Click "Upload Video"
- View real-time upload progress

### 4. Monitor Processing
- Switch to "Processing Queue" tab
- Watch real-time progress of sensitivity analysis
- Processing includes automated content screening

### 5. View Videos
- Go to "My Videos" tab
- Use filters to sort by:
  - Status (uploading/processing/completed/failed)
  - Sensitivity Status (pending/safe/flagged)
  - Category
- View video details and metadata

### 6. Play Videos
- Click "Play" button on completed videos
- Video player opens with full controls
- Supports HTTP range requests for smooth streaming

### 7. Manage Videos (Editor/Admin)
- Update video metadata
- Delete videos
- View detailed information

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "editor",
  "organization": "default"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Video Endpoints

#### Upload Video
```http
POST /api/videos/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- video: <file>
- title: "Video Title"
- description: "Video Description"
- tags: "tag1,tag2,tag3"
- category: "Technology"
```

#### Get All Videos
```http
GET /api/videos?status=completed&sensitivityStatus=safe&category=Technology
Authorization: Bearer <token>
```

#### Get Single Video
```http
GET /api/videos/:id
Authorization: Bearer <token>
```

#### Stream Video
```http
GET /api/videos/:id/stream
Authorization: Bearer <token>
Headers:
- Range: bytes=0-1024
```

#### Update Video
```http
PUT /api/videos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description",
  "tags": "new,tags",
  "category": "Education"
}
```

#### Delete Video
```http
DELETE /api/videos/:id
Authorization: Bearer <token>
```

## 🔄 Real-Time Events (Socket.io)

### Client Events to Listen

```javascript
// Video uploaded successfully
socket.on('video:uploaded', (data) => {
  // data: { videoId, filename }
});

// Processing progress update
socket.on('video:progress', (data) => {
  // data: { videoId, progress }
});

// Video processing completed
socket.on('video:completed', (data) => {
  // data: { videoId, sensitivityStatus, sensitivityScore }
});

// Video processing failed
socket.on('video:failed', (data) => {
  // data: { videoId, error }
});
```

## 🏢 Multi-Tenant Architecture

The application supports multi-tenant functionality:

- **User Isolation**: Each user can only access their own content
- **Organization-Based**: Users belong to organizations
- **Admin Override**: Admin users can access all content
- **Role-Based Permissions**: Different capabilities based on user role

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Role-Based Access Control**: Fine-grained permissions
- **Input Validation**: Express-validator for request validation
- **File Type Validation**: Only video files accepted
- **File Size Limits**: Configurable upload size limits

## 📁 Project Structure

```
full_stack_assignment/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── videoController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Video.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── videos.js
│   │   ├── utils/
│   │   │   └── videoProcessor.js
│   │   └── server.js
│   ├── uploads/
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── ProcessingQueue.jsx
│   │   │   ├── VideoList.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   └── VideoUpload.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── socketService.js
│   │   │   └── videoService.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🧪 Testing

### Manual Testing Workflow

1. **User Registration & Login**
   - Create multiple users with different roles
   - Verify JWT token storage
   - Test logout functionality

2. **Video Upload**
   - Upload various video formats
   - Test file size limits
   - Verify progress tracking

3. **Processing Queue**
   - Monitor real-time updates
   - Verify progress percentages
   - Check completion notifications

4. **Video Streaming**
   - Test video playback
   - Verify range request support
   - Check different video formats

5. **Filtering & Search**
   - Filter by status
   - Filter by sensitivity
   - Filter by category

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Solution: Ensure MongoDB is running on port 27017
```

**FFmpeg Not Found**
```
Solution: Install FFmpeg and ensure it's in your system PATH
```

**Port Already in Use**
```
Solution: Change PORT in .env file or kill the process using the port
```

**CORS Errors**
```
Solution: Verify FRONTEND_URL in backend .env matches your frontend URL
```

## 🎨 Customization

### Changing Sensitivity Analysis

The sensitivity analysis is simulated in `backend/src/utils/videoProcessor.js`. To integrate real ML models:

```javascript
// Replace analyzeSensitivity function with your ML API
const analyzeSensitivity = async (filePath) => {
  const response = await fetch('YOUR_ML_API_ENDPOINT', {
    method: 'POST',
    body: videoFile
  });
  return response.json();
};
```

### Modifying Upload Limits

Edit `backend/.env`:
```
MAX_FILE_SIZE=209715200  # 200MB in bytes
```

### Adding Video Categories

Update both frontend and backend category options in:
- `frontend/src/components/VideoUpload.jsx`
- `frontend/src/components/VideoList.jsx`

## 📦 Deployment

### Backend Deployment (Heroku Example)

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_atlas_uri

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel Example)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Created for Full-Stack Development Assignment

## 📞 Support

For issues or questions, please open an issue in the GitHub repository.

---

**Note**: This is an educational project demonstrating full-stack development capabilities including video processing, real-time communication, and secure authentication.
