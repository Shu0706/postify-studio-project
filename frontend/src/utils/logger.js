/**
 * Logger utility to conditionally log based on environment
 * Removes all logs in production while preserving them in development
 */

const isDev = !import.meta.env.PROD;

const logger = {
  /**
   * Log information message - only in development
   * @param {...any} args - Arguments to log
   */
  info: (...args) => {
    if (isDev) {
      console.log('[INFO]', ...args);
    }
  },
  
  /**
   * Log warning message - only in development
   * @param {...any} args - Arguments to log
   */
  warn: (...args) => {
    if (isDev) {
      console.warn('[WARN]', ...args);
    }
  },
  
  /**
   * Log error message - preserves errors in all environments but
   * only includes detailed stack information in development
   * @param {...any} args - Arguments to log
   */
  error: (...args) => {
    if (isDev) {
      console.error('[ERROR]', ...args);
    } else {
      // In production, log minimal error information without details
      const simplified = args.map(arg => {
        if (arg instanceof Error) {
          return { name: arg.name, message: arg.message };
        }
        return arg;
      });
      console.error('[ERROR]', ...simplified);
    }
  },
  
  /**
   * Debug message - only in development
   * @param {...any} args - Arguments to log
   */
  debug: (...args) => {
    if (isDev) {
      console.debug('[DEBUG]', ...args);
    }
  },
  
  /**
   * Group related logs - only in development
   * @param {string} label - Group label
   * @param {Function} callback - Function to execute within group
   */
  group: (label, callback) => {
    if (isDev) {
      console.group(label);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  }
};

export default logger;
