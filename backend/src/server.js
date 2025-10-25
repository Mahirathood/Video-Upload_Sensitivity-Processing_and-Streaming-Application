// Load environment configuration
require('dotenv').config();

// Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server: SocketServer } = require('socket.io');
const jwt = require('jsonwebtoken');

// Application routes
const authenticationRoutes = require('./routes/auth');
const videoManagementRoutes = require('./routes/videos');

// Application initialization
const application = express();
const httpServer = http.createServer(application);

// WebSocket server configuration
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
const socketIO = new SocketServer(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Configure middleware stack
application.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
application.use(express.json());
application.use(express.urlencoded({ extended: true }));

// Inject socket instance into application
application.socketIO = socketIO;

// API endpoint routing
application.use('/api/auth', authenticationRoutes);
application.use('/api/videos', videoManagementRoutes);

// Server health monitoring endpoint
application.get('/api/health', (request, response) => {
  response.json({ status: 'OK', message: 'Server is running' });
});

// Global error handler
application.use((error, request, response, next) => {
  console.error('Application Error:', error);
  
  // Handle file upload errors
  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return response.status(400).json({ error: 'File size exceeds maximum limit' });
    }
    return response.status(400).json({ error: error.message });
  }
  
  // Generic error response
  response.status(error.status || 500).json({
    error: error.message || 'Internal server error'
  });
});

// Handle undefined routes
application.use((request, response) => {
  response.status(404).json({ error: 'Requested route not found' });
});

// WebSocket authentication layer
socketIO.use((clientSocket, next) => {
  const authToken = clientSocket.handshake.auth.token;
  
  if (!authToken) {
    return next(new Error('Authentication required'));
  }

  try {
    const decodedPayload = jwt.verify(authToken, process.env.JWT_SECRET);
    clientSocket.authenticatedUserId = decodedPayload.userId;
    next();
  } catch (verificationError) {
    next(new Error('Invalid authentication credentials'));
  }
});

// WebSocket connection management
socketIO.on('connection', (clientSocket) => {
  console.log('WebSocket client connected:', clientSocket.authenticatedUserId);
  
  // Create dedicated channel for user-specific broadcasts
  clientSocket.join(clientSocket.authenticatedUserId);
  
  clientSocket.on('disconnect', () => {
    console.log('WebSocket client disconnected:', clientSocket.authenticatedUserId);
  });
});

// Establish database connectivity
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('Successfully connected to MongoDB database');
  
  // Initialize HTTP server
  const serverPort = process.env.PORT || 5000;
  httpServer.listen(serverPort, () => {
    console.log(`Application server listening on port ${serverPort}`);
  });
})
.catch((connectionError) => {
  console.error('Database connection failed:', connectionError);
  console.log('Verify MongoDB service is running');
  console.log('Proceeding without database connectivity...');
  
  // Fallback server startup for development
  const serverPort = process.env.PORT || 5000;
  httpServer.listen(serverPort, () => {
    console.log(`Server active on port ${serverPort} (database unavailable)`);
  });
});

// Handle graceful shutdown signals
process.on('SIGTERM', () => {
  console.log('Shutdown signal received, closing connections gracefully');
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log('All connections closed successfully');
      process.exit(0);
    });
  });
});

module.exports = { app: application, server: httpServer, io: socketIO };
