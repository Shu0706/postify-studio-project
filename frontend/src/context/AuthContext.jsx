import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import socketManager from '../utils/socketManager';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode instead of default import
import logger from '../utils/logger';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenRefreshing, setTokenRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // When we come back online, refresh user data
      if (currentUser) {
        fetchUserData(localStorage.getItem('token'));
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  // Initialize axios with authentication header
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set global axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // This function checks if the token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      logger.error('Error decoding token:', error);
      return true;
    }
  };

  // Check auth status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('🔍 AuthContext: Starting authentication check...');
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ AuthContext: No token found in localStorage');
        logger.info('No token found in localStorage');
        setLoading(false);
        return;
      }
      
      console.log('🎫 AuthContext: Token found:', token ? 'YES' : 'NO');
      
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('⏰ AuthContext: Token is expired, logging out');
        logger.info('Token is expired, logging out');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      
      // Valid token exists, set it for future requests and fetch user data
      console.log('✅ AuthContext: Valid token found, setting up authentication');
      logger.info('Valid token found, setting up authentication');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await fetchUserData(token);
    };
    
    checkAuthStatus();
  }, []);

  // Connect socket when user is set
  useEffect(() => {
    if (currentUser && !loading && !socketManager.isConnected && isOnline) {
      const token = localStorage.getItem('token');
      if (token) {
        logger.info('Attempting to connect socket for user:', currentUser.name);
        socketManager.connect(token);
      } else {
        logger.warn('No token available for socket connection');
      }
    }
    
    // Cleanup socket on unmount
    return () => {
      if (socketManager.isConnected) {
        socketManager.disconnect();
      }
    };
  }, [currentUser, loading, isOnline]);

  const fetchUserData = async (token) => {
    try {
      setTokenRefreshing(true);
      setError('');
      
      console.log('📡 AuthContext: Fetching user data...');
      logger.info('Fetching user data...');
      
      // Make direct API call to get user profile instead of using cached service
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/profile`;
      console.log('📡 AuthContext: Making request to:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('📡 AuthContext: API Response:', response.data);
      logger.info('API Response:', response.data);
      
      if (response.data.success) {
        console.log('✅ AuthContext: User data fetched successfully:', response.data.data.user);
        logger.info('User data fetched successfully:', response.data.data.user);
        setCurrentUser(response.data.data.user);
      } else {
        throw new Error('Failed to fetch user data: ' + response.data.message);
      }
    } catch (error) {
      console.error('❌ AuthContext: Error fetching user data:', error);
      logger.error('Error fetching user data:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.log('🔒 AuthContext: Authentication failed, removing token');
        logger.info('Authentication failed, removing token');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setCurrentUser(null);
        setError('Session expired. Please login again.');
      } else if (error.response?.status === 500) {
        console.error('🔥 AuthContext: Server error');
        setError('Server error. Please try again later.');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.error('🌐 AuthContext: Network error');
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        console.error('🚨 AuthContext: Unknown error:', error);
        setError('Failed to authenticate. Please try refreshing the page.');
      }
    } finally {
      console.log('🏁 AuthContext: Finished authentication check');
      setLoading(false);
      setTokenRefreshing(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authService.login(email, password);
      
      if (response.success) {
        // Set the token in axios defaults immediately after successful login
        const token = response.data.token;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setCurrentUser(response.data.user);
        return response.data.user;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authService.register(userData);
      
      if (response.success) {
        setCurrentUser(response.data.user);
        return response.data.user;
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear token from localStorage and axios defaults
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    
    // Call authService logout
    authService.logout();
    
    // Disconnect socket
    socketManager.disconnect();
    
    // Clear user state
    setCurrentUser(null);
    setError('');
  };

  const updateProfile = async (userData) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authService.updateProfile(userData);
      
      if (response.success) {
        setCurrentUser(response.data.user);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    tokenRefreshing,
    error,
    isOnline,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
