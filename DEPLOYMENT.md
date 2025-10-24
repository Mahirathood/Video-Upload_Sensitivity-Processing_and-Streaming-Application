# Deployment Guide

## 📦 Deployment Options

This guide covers deploying the Video Streaming Platform to various cloud providers.

---

## Option 1: Heroku (Backend) + Vercel (Frontend)

### Prerequisites
- Heroku account
- Vercel account
- MongoDB Atlas account (free tier)
- Git repository

### Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IPs (0.0.0.0/0) for testing
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/video_streaming_app
   ```

### Step 2: Deploy Backend to Heroku

```bash
# Install Heroku CLI
# Windows: Download from https://devcenter.heroku.com/articles/heroku-cli
# macOS: brew tap heroku/brew && brew install heroku

# Login to Heroku
heroku login

# Navigate to backend
cd backend

# Create Heroku app
heroku create your-video-app-backend

# Add FFmpeg buildpack
heroku buildpacks:add --index 1 https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"
heroku config:set MAX_FILE_SIZE=104857600
heroku config:set FRONTEND_URL="https://your-frontend-app.vercel.app"

# Deploy
git init
git add .
git commit -m "Initial backend deployment"
heroku git:remote -a your-video-app-backend
git push heroku main

# Check logs
heroku logs --tail
```

**Your backend will be at:** `https://your-video-app-backend.herokuapp.com`

### Step 3: Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Update .env for production
VITE_API_URL=https://your-video-app-backend.herokuapp.com/api
VITE_SOCKET_URL=https://your-video-app-backend.herokuapp.com

# Deploy
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? your-video-app
# - Directory? ./
# - Override settings? No
```

**Your frontend will be at:** `https://your-video-app.vercel.app`

### Step 4: Update CORS Settings

Update backend to allow your Vercel domain:

```bash
heroku config:set FRONTEND_URL="https://your-video-app.vercel.app"
```

---

## Option 2: AWS EC2 (Full Stack)

### Prerequisites
- AWS account
- Domain name (optional)
- SSL certificate (Let's Encrypt)

### Step 1: Launch EC2 Instance

1. Choose Ubuntu Server 22.04 LTS
2. Instance type: t2.micro (free tier) or t2.small
3. Configure security groups:
   - SSH (22): Your IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0
   - Custom (5000): 0.0.0.0/0 (for API)
4. Launch and download key pair

### Step 2: Connect to EC2

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install FFmpeg
sudo apt install -y ffmpeg

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### Step 4: Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd full_stack_assignment

# Setup Backend
cd backend
npm install
cp .env.example .env
nano .env  # Edit with production values

# Start backend with PM2
pm2 start src/server.js --name video-backend
pm2 startup
pm2 save

# Build Frontend
cd ../frontend
npm install
npm run build

# Copy build to Nginx
sudo cp -r dist/* /var/www/html/
```

### Step 5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/default
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

## Option 3: DigitalOcean App Platform

### Step 1: Prepare Repository

Ensure your code is in a Git repository (GitHub, GitLab, etc.)

### Step 2: Create App

1. Go to DigitalOcean App Platform
2. Click "Create App"
3. Connect your repository
4. Configure components:

**Backend Component:**
- Type: Web Service
- Source: backend/
- Build Command: `npm install`
- Run Command: `npm start`
- HTTP Port: 5000
- Environment Variables:
  ```
  NODE_ENV=production
  MONGODB_URI=<atlas_uri>
  JWT_SECRET=<random_secret>
  ```

**Frontend Component:**
- Type: Static Site
- Source: frontend/
- Build Command: `npm run build`
- Output Directory: dist/

### Step 3: Deploy

Click "Deploy" and wait for build to complete.

---

## Option 4: Docker Deployment

### Create Dockerfile for Backend

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
```

### Create Dockerfile for Frontend

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_DATABASE: video_streaming_app
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://mongodb:27017/video_streaming_app
      JWT_SECRET: ${JWT_SECRET}
      FRONTEND_URL: http://localhost
    depends_on:
      - mongodb
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

### Deploy with Docker Compose

```bash
# Create .env file
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Environment Variables Reference

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/video_streaming_app

# Security
JWT_SECRET=your_very_long_and_secure_random_string_here

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=104857600

# CORS
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

---

## Post-Deployment Checklist

- [ ] MongoDB is accessible and secured
- [ ] Environment variables are set correctly
- [ ] SSL certificate is configured (HTTPS)
- [ ] CORS is configured for your frontend domain
- [ ] File upload size limits are appropriate
- [ ] Monitoring is set up (logs, errors)
- [ ] Backups are configured for MongoDB
- [ ] Domain DNS is pointing correctly
- [ ] Application is accessible via domain
- [ ] Socket.io connections work
- [ ] Video upload and streaming work
- [ ] User authentication works
- [ ] Email notifications work (if implemented)

---

## Monitoring & Maintenance

### Heroku

```bash
# View logs
heroku logs --tail -a your-app

# Restart
heroku restart -a your-app

# Scale
heroku ps:scale web=2 -a your-app
```

### PM2 (EC2)

```bash
# Monitor
pm2 monit

# View logs
pm2 logs

# Restart
pm2 restart all

# Update after changes
cd ~/full_stack_assignment/backend
git pull
npm install
pm2 restart video-backend
```

### Docker

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update
git pull
docker-compose down
docker-compose up -d --build
```

---

## Backup Strategy

### MongoDB Atlas
- Automatic backups included
- Configure retention period
- Test restore procedure

### Self-Hosted MongoDB

```bash
# Backup
mongodump --uri="mongodb://localhost:27017/video_streaming_app" --out=/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/video_streaming_app" /backups/20250115

# Automate with cron
0 2 * * * /usr/bin/mongodump --uri="mongodb://localhost:27017/video_streaming_app" --out=/backups/$(date +\%Y\%m\%d)
```

### Video Files

Consider using cloud storage:
- AWS S3
- Google Cloud Storage
- DigitalOcean Spaces
- Cloudinary

---

## Performance Optimization

1. **Use CDN** for video delivery
2. **Enable compression** in Nginx
3. **Implement caching** for static assets
4. **Use video transcoding** for multiple qualities
5. **Implement lazy loading** in frontend
6. **Add database indexes** for frequently queried fields
7. **Use Redis** for session management
8. **Enable Gzip** compression

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (AWS ELB, Nginx)
- Run multiple backend instances
- Use sticky sessions for Socket.io
- Implement Redis adapter for Socket.io

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add database indexes
- Use caching layer

---

## Cost Estimation

### Free Tier Options
- **Heroku**: 1 free dyno (sleeps after 30 min)
- **Vercel**: Unlimited deployments
- **MongoDB Atlas**: 512MB free
- **Total**: $0/month (with limitations)

### Production Setup
- **Heroku**: $7/month (Hobby)
- **Vercel**: Free
- **MongoDB Atlas**: $9/month (M10)
- **Cloudinary**: $89/month (Plus) or use S3
- **Total**: ~$16-105/month

### AWS EC2 (Self-Hosted)
- **EC2 t2.small**: $17/month
- **Storage (30GB)**: $3/month
- **Bandwidth**: Variable
- **Total**: ~$20-40/month

---

## Troubleshooting

### Issue: 502 Bad Gateway
**Solution**: Check if backend is running, verify port numbers

### Issue: CORS Errors
**Solution**: Verify FRONTEND_URL in backend matches frontend domain

### Issue: Socket.io Not Connecting
**Solution**: Ensure WebSocket support in reverse proxy configuration

### Issue: File Upload Fails
**Solution**: Check file size limits, disk space, permissions

---

For more help, refer to:
- [README.md](README.md) - Main documentation
- [API.md](API.md) - API reference
- [QUICKSTART.md](QUICKSTART.md) - Local setup guide

---

**Happy Deploying! 🚀**
