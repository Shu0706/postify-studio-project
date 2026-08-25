/**
 * ApiCache utility to cache API responses and reduce redundant network requests
 */

class ApiCache {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }
    
    // Return cached value
    return this.cache.get(key);
  }

  /**
   * Set a value in the cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, value, ttl = this.defaultTTL) {
    // Clear any existing timeout for this key
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }
    
    // Set the value in cache
    this.cache.set(key, value);
    
    // Set expiry timeout
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.timeouts.delete(key);
    }, ttl);
    
    this.timeouts.set(key, timeout);
  }

  /**
   * Remove a value from the cache
   * @param {string} key - Cache key
   */
  remove(key) {
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
    
    this.cache.delete(key);
  }

  /**
   * Clear all cached values
   */
  clear() {
    // Clear all timeouts
    for (const timeout of this.timeouts.values()) {
      clearTimeout(timeout);
    }
    
    // Clear maps
    this.cache.clear();
    this.timeouts.clear();
  }

  /**
   * Check if a key exists in the cache
   * @param {string} key - Cache key
   * @returns {boolean} - True if key exists
   */
  has(key) {
    return this.cache.has(key);
  }
}

// Create singleton instance
const apiCache = new ApiCache();
export default apiCache;
