# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT token.

### Headers

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "editor",
  "organization": "acme_corp"
}
```

**Validation Rules:**
- `username`: min 3 characters
- `email`: valid email format
- `password`: min 6 characters
- `role`: one of ["viewer", "editor", "admin"]
- `organization`: optional, defaults to "default"

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "editor",
    "organization": "acme_corp"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

```json
// 400 - Validation error
{
  "errors": [
    {
      "msg": "Username must be at least 3 characters",
      "param": "username"
    }
  ]
}

// 400 - User exists
{
  "error": "User with this email or username already exists"
}
```

---

### Login User

Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "editor",
    "organization": "acme_corp"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### Get User Profile

Get current authenticated user's profile.

**Endpoint:** `GET /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "editor",
    "organization": "acme_corp",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### Update User Profile

Update current user's profile information.

**Endpoint:** `PUT /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "john_updated",
  "email": "john_new@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_updated",
    "email": "john_new@example.com",
    "role": "editor",
    "organization": "acme_corp"
  }
}
```

---

## Video Endpoints

### Upload Video

Upload a new video file with metadata.

**Endpoint:** `POST /videos/upload`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Permissions:** Editor, Admin

**Form Data:**
- `video` (file): Video file (required)
- `title` (string): Video title (optional, defaults to filename)
- `description` (string): Video description (optional)
- `tags` (string): Comma-separated tags (optional)
- `category` (string): Video category (optional)

**Example (cURL):**
```bash
curl -X POST http://localhost:5000/api/videos/upload \
  -H "Authorization: Bearer <token>" \
  -F "video=@/path/to/video.mp4" \
  -F "title=My Awesome Video" \
  -F "description=This is a test video" \
  -F "tags=tutorial,coding,react" \
  -F "category=Education"
```

**Success Response (201):**
```json
{
  "message": "Video uploaded successfully",
  "video": {
    "id": "507f1f77bcf86cd799439012",
    "filename": "My Awesome Video.mp4",
    "status": "processing",
    "uploadedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

```json
// 400 - No file
{
  "error": "No video file provided"
}

// 400 - Invalid file type
{
  "error": "Invalid file type. Only video files are allowed."
}

// 400 - File too large
{
  "error": "File size too large"
}

// 403 - Permission denied
{
  "error": "Access denied. Insufficient permissions."
}
```

---

### Get All Videos

Retrieve list of videos with optional filtering.

**Endpoint:** `GET /videos`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (string): Filter by status (uploading, processing, completed, failed)
- `sensitivityStatus` (string): Filter by sensitivity (pending, safe, flagged)
- `category` (string): Filter by category
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Example:**
```
GET /videos?status=completed&sensitivityStatus=safe&category=Education&page=1&limit=10
```

**Success Response (200):**
```json
{
  "videos": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "filename": "video-1234567890.mp4",
      "originalName": "My Awesome Video.mp4",
      "fileSize": 15728640,
      "mimeType": "video/mp4",
      "duration": 120.5,
      "status": "completed",
      "processingProgress": 100,
      "sensitivityStatus": "safe",
      "sensitivityScore": 25,
      "metadata": {
        "title": "My Awesome Video",
        "description": "This is a test video",
        "tags": ["tutorial", "coding", "react"],
        "category": "Education"
      },
      "owner": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "john_doe",
        "email": "john@example.com"
      },
      "organization": "acme_corp",
      "uploadedAt": "2025-01-15T10:30:00.000Z",
      "processedAt": "2025-01-15T10:30:15.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

### Get Single Video

Retrieve details of a specific video.

**Endpoint:** `GET /videos/:id`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "video": {
    "_id": "507f1f77bcf86cd799439012",
    "filename": "video-1234567890.mp4",
    "originalName": "My Awesome Video.mp4",
    "fileSize": 15728640,
    "mimeType": "video/mp4",
    "duration": 120.5,
    "status": "completed",
    "processingProgress": 100,
    "sensitivityStatus": "safe",
    "sensitivityScore": 25,
    "metadata": {
      "title": "My Awesome Video",
      "description": "This is a test video",
      "tags": ["tutorial", "coding", "react"],
      "category": "Education"
    },
    "owner": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com"
    },
    "organization": "acme_corp",
    "uploadedAt": "2025-01-15T10:30:00.000Z",
    "processedAt": "2025-01-15T10:30:15.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Video not found"
}
```

---

### Stream Video

Stream video content with HTTP range request support.

**Endpoint:** `GET /videos/:id/stream`

**Headers:** 
- `Authorization: Bearer <token>`
- `Range: bytes=0-1024` (optional, for partial content)

**Success Response (206 or 200):**

Returns video stream with appropriate headers:

```http
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1024/15728640
Accept-Ranges: bytes
Content-Length: 1025
Content-Type: video/mp4

<binary video data>
```

**Usage in HTML:**
```html
<video controls>
  <source src="http://localhost:5000/api/videos/:id/stream?token=<your_token>" type="video/mp4">
</video>
```

---

### Update Video Metadata

Update video information.

**Endpoint:** `PUT /videos/:id`

**Headers:** `Authorization: Bearer <token>`

**Permissions:** Editor (own videos), Admin (all videos)

**Request Body:**
```json
{
  "title": "Updated Video Title",
  "description": "Updated description",
  "tags": "updated,tags,here",
  "category": "Technology"
}
```

**Success Response (200):**
```json
{
  "message": "Video updated successfully",
  "video": {
    "_id": "507f1f77bcf86cd799439012",
    "metadata": {
      "title": "Updated Video Title",
      "description": "Updated description",
      "tags": ["updated", "tags", "here"],
      "category": "Technology"
    }
  }
}
```

**Error Responses:**

```json
// 403 - Not owner
{
  "error": "Access denied"
}

// 404 - Not found
{
  "error": "Video not found"
}
```

---

### Delete Video

Delete a video and its file.

**Endpoint:** `DELETE /videos/:id`

**Headers:** `Authorization: Bearer <token>`

**Permissions:** Editor (own videos), Admin (all videos)

**Success Response (200):**
```json
{
  "message": "Video deleted successfully"
}
```

**Error Responses:**

```json
// 403 - Not owner
{
  "error": "Access denied"
}

// 404 - Not found
{
  "error": "Video not found"
}
```

---

## WebSocket Events (Socket.io)

### Connection

**Client:**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: '<your_jwt_token>'
  }
});
```

### Events from Server

#### video:uploaded
Emitted when video upload is complete.

```javascript
socket.on('video:uploaded', (data) => {
  console.log(data);
  // { videoId: "507f...", filename: "video.mp4" }
});
```

#### video:progress
Emitted during video processing with progress updates.

```javascript
socket.on('video:progress', (data) => {
  console.log(data);
  // { videoId: "507f...", progress: 45 }
});
```

#### video:completed
Emitted when video processing is complete.

```javascript
socket.on('video:completed', (data) => {
  console.log(data);
  // { 
  //   videoId: "507f...", 
  //   sensitivityStatus: "safe",
  //   sensitivityScore: 25
  // }
});
```

#### video:failed
Emitted when video processing fails.

```javascript
socket.on('video:failed', (data) => {
  console.log(data);
  // { videoId: "507f...", error: "Processing failed" }
});
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 206 | Partial Content (streaming) |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized / Invalid Token |
| 403 | Forbidden / Insufficient Permissions |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently not implemented. For production:

- Recommended: 100 requests per 15 minutes per IP
- Video uploads: 10 uploads per hour per user

---

## Example Workflows

### Complete Upload Flow

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await loginResponse.json();

// 2. Connect to Socket.io
const socket = io('http://localhost:5000', {
  auth: { token }
});

// 3. Listen for events
socket.on('video:progress', (data) => {
  console.log(`Processing: ${data.progress}%`);
});

socket.on('video:completed', (data) => {
  console.log(`Video ${data.videoId} is ready!`);
});

// 4. Upload video
const formData = new FormData();
formData.append('video', videoFile);
formData.append('title', 'My Video');

const uploadResponse = await fetch('http://localhost:5000/api/videos/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { video } = await uploadResponse.json();
console.log(`Uploaded: ${video.id}`);

// 5. Watch for processing updates via Socket.io
// (automatic via socket listeners above)
```

---

## Postman Collection

Import this JSON to test all endpoints:

```json
{
  "info": {
    "name": "Video Streaming API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

Save your token as a collection variable after login for easy reuse.

---

**For more information, see the main [README.md](README.md)**
