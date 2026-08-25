import axios from 'axios';
import apiCache from '../utils/apiCache';

// Base URL for API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Determine if we're in development mode
const isDev = !import.meta.env.PROD;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a timeout to prevent hanging requests
  timeout: 15000,
});

// Request interceptor - Adds auth token to requests
api.interceptors.request.use(
  (config) => {
    // Log requests in development mode
    if (isDev) {
      console.log(`🔄 API Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to GET requests to prevent caching by the browser
    if (config.method === 'get' && !config.skipCache) {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handles token expiration and error responses
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development mode
    if (isDev) {
      console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, 
        response.data.success ? 'SUCCESS' : 'FAILED');
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log failed responses in development mode
    if (isDev) {
      console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase() || 'UNKNOWN'} ${originalRequest?.url || 'UNKNOWN'}`, 
        error.response?.status || error.message);
    }
    
    // Handle network errors in development
    if (isDev && (error.message.includes('Network Error') || error.code === 'ECONNREFUSED')) {
      console.info('Network error in development - API might not be running');
      
      // Return mock data for specific endpoints if needed
      if (originalRequest.url.includes('/auth/login')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              token: 'mock-token-for-development',
              user: {
                id: 'mock-user-id',
                name: 'Demo User',
                email: originalRequest.data.email || 'demo@example.com',
                role: 'client'
              }
            }
          }
        });
      }
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      if (!originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
        originalRequest._retry = true;
        
        // Clear token and cached data
        localStorage.removeItem('token');
        apiCache.clear();
        
        // Notify user about session expiration
        const event = new CustomEvent('session-expired');
        window.dispatchEvent(event);
        
        // Redirect to login (with a delay to allow event handlers to process)
        setTimeout(() => {
          window.location.href = '/login?expired=true';
        }, 100);
      }
    }
    
    // Handle other error statuses
    if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      const event = new CustomEvent('permission-denied', {
        detail: {
          message: error.response.data.message || 'You do not have permission to access this resource'
        }
      });
      window.dispatchEvent(event);
    }
    
    if (error.response?.status === 429) {
      // Too many requests
      const event = new CustomEvent('rate-limited', {
        detail: {
          message: error.response.data.message || 'Too many requests, please try again later'
        }
      });
      window.dispatchEvent(event);
    }
    
    if (error.response?.status >= 500) {
      // Server error
      const event = new CustomEvent('server-error', {
        detail: {
          message: error.response.data.message || 'Server error, please try again later'
        }
      });
      window.dispatchEvent(event);
    }
    
    return Promise.reject(error);
  }
);

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export default api;
