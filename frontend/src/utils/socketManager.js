import { io } from 'socket.io-client';
import logger from './logger';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      logger.info('Socket already connected');
      return this.socket;
    }

    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      logger.error('Max connection attempts reached. Please check server status.');
      return null;
    }

    this.connectionAttempts++;
    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // Remove /api from the socket URL as socket.io runs on root
    const socketUrl = serverUrl.replace('/api', '');
    
    logger.info('Connecting to socket server:', socketUrl);
    
    try {
      // Create new socket connection with proper configuration
      this.socket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        forceNew: true, // Force a new connection to avoid namespace issues
        timeout: 5000
      });

      // Set up event listeners
      this.socket.on('connect', () => {
        logger.info('Socket connected successfully with ID:', this.socket.id);
        this.isConnected = true;
        this.connectionAttempts = 0; // Reset attempts on successful connection
      });

      this.socket.on('disconnect', (reason) => {
        logger.info('Socket disconnected:', reason);
        this.isConnected = false;
        
        // Don't automatically attempt to reconnect on manual disconnect
        if (reason === 'io client disconnect') {
          this.connectionAttempts = this.maxConnectionAttempts;
        }
      });

      this.socket.on('connect_error', (error) => {
        logger.error('Socket connection error:', error.message);
        this.isConnected = false;
        
        // If authentication error, don't retry
        if (error.message.includes('Authentication error') || error.message.includes('Invalid namespace')) {
          logger.error('Authentication failed or invalid namespace, disconnecting socket');
          this.connectionAttempts = this.maxConnectionAttempts; // Stop retrying
          this.disconnect();
        }
      });

      // Additional error handling
      this.socket.on('error', (error) => {
        logger.error('Socket error:', error);
      });

      return this.socket;
    } catch (error) {
      logger.error('Error creating socket connection:', error);
      this.isConnected = false;
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      logger.info('Disconnecting socket');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionAttempts = 0; // Reset connection attempts on manual disconnect
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      logger.warn('Cannot emit - socket not connected');
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      logger.warn('Cannot add listener - socket not initialized');
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

// Create a singleton instance
const socketManager = new SocketManager();
export default socketManager;
