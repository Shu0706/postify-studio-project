import api from './api';
import apiCache from '../utils/apiCache';

/**
 * Base class for API services with caching capabilities
 */
class CacheableService {
  constructor(basePath) {
    this.API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.basePath = basePath;
  }

  /**
   * Get the full API URL
   * @param {string} endpoint - API endpoint
   * @returns {string} - Full API URL
   */
  getUrl(endpoint) {
    return `${this.API_URL}${this.basePath}${endpoint}`;
  }

  /**
   * Generate a cache key for the request
   * @param {string} endpoint - API endpoint
   * @param {object} params - Request parameters
   * @returns {string} - Cache key
   */
  getCacheKey(endpoint, params = {}) {
    return `${this.basePath}${endpoint}:${JSON.stringify(params)}`;
  }

  /**
   * Perform a GET request with caching
   * @param {string} endpoint - API endpoint
   * @param {object} params - Query parameters
   * @param {object} options - Request options
   * @returns {Promise<any>} - Response data
   */
  async get(endpoint, params = {}, options = {}) {
    const { useCache = true, ttl = undefined, forceRefresh = false } = options;
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // Check cache first if useCache is true and not forcing refresh
    if (useCache && !forceRefresh) {
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    try {
      // Make the request using shared api instance (interceptors handle auth)
      const response = await api.get(this.getUrl(endpoint), {
        params,
      });
      
      // If the request was successful, cache the response
      if (response.data.success && useCache) {
        apiCache.set(cacheKey, response.data, ttl);
      }
      
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Perform a POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @param {object} options - Request options
   * @returns {Promise<any>} - Response data
   */
  async post(endpoint, data = {}, options = {}) {
    const { invalidateCache = [], invalidatePattern = null } = options;
    
    try {
  // Make the request using shared api instance (interceptors handle auth)
  const response = await api.post(this.getUrl(endpoint), data);
      
      // Invalidate specific cache keys if needed
      if (invalidateCache.length > 0) {
        invalidateCache.forEach(key => apiCache.remove(key));
      }
      
      // Invalidate cache based on pattern (prefix)
      if (invalidatePattern) {
        // This is a simple implementation - we're just checking if the key starts with the pattern
        Array.from(apiCache.cache.keys()).forEach(key => {
          if (key.startsWith(invalidatePattern)) {
            apiCache.remove(key);
          }
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Perform a PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @param {object} options - Request options
   * @returns {Promise<any>} - Response data
   */
  async put(endpoint, data = {}, options = {}) {
    const { invalidateCache = [], invalidatePattern = null } = options;
    
    try {
  // Make the request using shared api instance (interceptors handle auth)
  const response = await api.put(this.getUrl(endpoint), data);
      
      // Invalidate specific cache keys if needed
      if (invalidateCache.length > 0) {
        invalidateCache.forEach(key => apiCache.remove(key));
      }
      
      // Invalidate cache based on pattern (prefix)
      if (invalidatePattern) {
        Array.from(apiCache.cache.keys()).forEach(key => {
          if (key.startsWith(invalidatePattern)) {
            apiCache.remove(key);
          }
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Perform a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} params - Query parameters
   * @param {object} options - Request options
   * @returns {Promise<any>} - Response data
   */
  async delete(endpoint, params = {}, options = {}) {
    const { invalidateCache = [], invalidatePattern = null } = options;
    
    try {
      // Make the request using shared api instance (interceptors handle auth)
      const response = await api.delete(this.getUrl(endpoint), {
        params,
      });
      
      // Invalidate specific cache keys if needed
      if (invalidateCache.length > 0) {
        invalidateCache.forEach(key => apiCache.remove(key));
      }
      
      // Invalidate cache based on pattern (prefix)
      if (invalidatePattern) {
        Array.from(apiCache.cache.keys()).forEach(key => {
          if (key.startsWith(invalidatePattern)) {
            apiCache.remove(key);
          }
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

export default CacheableService;
