import CacheableService from './CacheableService';
import { setAuthToken } from './api';
import apiCache from '../utils/apiCache';

class AuthService extends CacheableService {
  constructor() {
    super('/auth');
  }

  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} - User data and token
   */
  async login(email, password) {
    try {
      const response = await this.post('/login', { email, password });
      
      if (response.success) {
        // Set the auth token
        setAuthToken(response.data.token);
        
        // Clear any cached data
        apiCache.clear();
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }
  
  /**
   * Register a new user
   * @param {object} userData - User registration data
   * @returns {Promise<object>} - Registered user data
   */
  async register(userData) {
    try {
      const response = await this.post('/signup', userData);
      
      if (response.success) {
        // Set the auth token
        setAuthToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }
  
  /**
   * Log out the current user
   */
  logout() {
    setAuthToken(null);
    apiCache.clear();
  }
  
  /**
   * Get the current user's profile
   * @returns {Promise<object>} - User profile data
   */
  async getCurrentUser() {
    return this.get('/profile', {}, { useCache: true, ttl: 5 * 60 * 1000 }); // Cache for 5 minutes
  }
  
  /**
   * Update the current user's profile
   * @param {object} userData - Updated user data
   * @returns {Promise<object>} - Updated user profile
   */
  async updateProfile(userData) {
    return this.put('/profile', userData, {
      invalidateCache: [this.getCacheKey('/profile')],
    });
  }
  
  /**
   * Change the current user's password
   * @param {object} passwordData - Password change data
   * @returns {Promise<object>} - Result of password change
   */
  async changePassword(passwordData) {
    return this.put('/password', passwordData);
  }
}

export const authService = new AuthService();
