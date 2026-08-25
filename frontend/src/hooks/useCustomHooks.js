import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  useDataFetching, 
  usePaginatedData, 
  useDataMutation 
} from './useDataFetching';

/**
 * Custom hook for form handling
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Function to run on form submission
 * @param {Function} validate - Validation function (optional)
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues, onSubmit, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if there are no errors and form is being submitted
    if (Object.keys(errors).length === 0 && isSubmitting) {
      onSubmit(values);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
    }
  }, [errors, isSubmitting, onSubmit, values]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate) {
      setErrors(validate(values));
    }
    
    setIsSubmitting(true);
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setValues
  };
};

/**
 * Custom hook for fetching data with debouncing
 * @param {Function} fetchFunction - Function that returns a promise with data
 * @param {number} debounceTime - Debounce time in milliseconds
 * @param {Array} dependencies - Dependencies array (similar to useEffect)
 * @returns {Object} Data, loading state, and error
 */
export const useDebouncedFetch = (fetchFunction, debounceTime = 500, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  const debouncedFetch = useCallback(() => {
    setLoading(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await fetchFunction();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message || 'Something went wrong');
        setData(null);
      } finally {
        setLoading(false);
      }
    }, debounceTime);
  }, [fetchFunction, debounceTime]);

  useEffect(() => {
    debouncedFetch();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, debouncedFetch]);

  return { data, loading, error, refetch: debouncedFetch };
};

/**
 * Custom hook for window dimensions
 * @returns {Object} Window width and height
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

/**
 * Custom hook for detecting when user is inactive
 * @param {number} timeoutDuration - Timeout duration in milliseconds
 * @param {Function} onTimeout - Function to call when user is inactive
 * @returns {boolean} - Whether the user is currently inactive
 */
export const useIdleTimeout = (timeoutDuration = 30 * 60 * 1000, onTimeout) => {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isIdle) {
      setIsIdle(false);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      if (onTimeout) {
        onTimeout();
      }
    }, timeoutDuration);
  }, [isIdle, onTimeout, timeoutDuration]);

  useEffect(() => {
    // Events that reset the timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Reset timer on mount
    resetTimer();
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer, timeoutDuration]);

  return isIdle;
};

// Export the enhanced data fetching hooks from useDataFetching.js
export { useDataFetching, usePaginatedData, useDataMutation };
