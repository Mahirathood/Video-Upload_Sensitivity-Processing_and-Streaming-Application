import { io } from 'socket.io-client';

const WEBSOCKET_ENDPOINT = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class WebSocketManager {
  constructor() {
    this.socketConnection = null;
  }

  connect() {
    const authenticationToken = localStorage.getItem('token');
    
    if (!authenticationToken) {
      console.error('Authentication token not found for WebSocket');
      return;
    }

    this.socketConnection = io(WEBSOCKET_ENDPOINT, {
      auth: {
        token: authenticationToken
      }
    });

    this.socketConnection.on('connect', () => {
      console.log('WebSocket connection established');
    });

    this.socketConnection.on('disconnect', () => {
      console.log('WebSocket connection terminated');
    });

    this.socketConnection.on('connect_error', (connectionError) => {
      console.error('WebSocket connection failed:', connectionError);
    });

    return this.socketConnection;
  }

  disconnect() {
    if (this.socketConnection) {
      this.socketConnection.disconnect();
      this.socketConnection = null;
    }
  }

  on(eventName, eventHandler) {
    if (this.socketConnection) {
      this.socketConnection.on(eventName, eventHandler);
    }
  }

  off(eventName, eventHandler) {
    if (this.socketConnection) {
      this.socketConnection.off(eventName, eventHandler);
    }
  }

  emit(eventName, eventData) {
    if (this.socketConnection) {
      this.socketConnection.emit(eventName, eventData);
    }
  }

  isConnected() {
    return this.socketConnection && this.socketConnection.connected;
  }
}

export default new WebSocketManager();
