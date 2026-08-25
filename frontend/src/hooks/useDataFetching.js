import { useState, useEffect, useCallback } from 'react';
import apiCache from '../utils/apiCache';

/**
 * Custom hook for data fetching with caching and loading states
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {any[]} deps - Dependencies for the fetch function
 * @param {object} options - Options for the hook
 * @returns {object} - { data, loading, error, refetch }
 */
export const useDataFetching = (fetchFunction, deps = [], options = {}) => {
  const { 
    initialData = null, 
    cacheKey = null, 
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    skipInitialFetch = false,
    onSuccess = null,
    onError = null
  } = options;
  
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!skipInitialFetch);
  const [error, setError] = useState(null);
  
  // Check cache for initial data
  useEffect(() => {
    if (cacheKey && apiCache.has(cacheKey)) {
      setData(apiCache.get(cacheKey));
      setLoading(false);
    }
  }, [cacheKey]);
  
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (skipInitialFetch && !forceRefresh) return;
    
    // Don't refetch if already have data from cache and not forcing refresh
    if (!forceRefresh && cacheKey && apiCache.has(cacheKey)) {
      setData(apiCache.get(cacheKey));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setData(result);
      
      // Cache the result if cacheKey is provided
      if (cacheKey) {
        apiCache.set(cacheKey, result, cacheTTL);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, cacheKey, cacheTTL, skipInitialFetch, onSuccess, onError, ...deps]);
  
  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch: fetchData };
};

/**
 * Custom hook for paginated data fetching
 * @param {Function} fetchFunction - Async function that accepts pagination params
 * @param {object} initialParams - Initial pagination parameters
 * @param {any[]} deps - Dependencies for the fetch function
 * @param {object} options - Options for the hook
 * @returns {object} - { data, loading, error, page, setPage, limit, setLimit, refetch }
 */
export const usePaginatedData = (fetchFunction, initialParams = {}, deps = [], options = {}) => {
  const {
    page: initialPage = 1,
    limit: initialLimit = 10,
    ...otherParams
  } = initialParams;
  
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [params, setParams] = useState(otherParams);
  
  // Generate a cache key based on pagination params
  const cacheKey = options.cacheKey ? 
    `${options.cacheKey}:page=${page}:limit=${limit}:${JSON.stringify(params)}` : 
    null;
  
  // Modified options with dynamic cache key
  const paginationOptions = {
    ...options,
    cacheKey
  };
  
  // Create the fetch function with pagination params
  const paginatedFetch = useCallback(async () => {
    return fetchFunction({ page, limit, ...params });
  }, [fetchFunction, page, limit, params]);
  
  const { data, loading, error, refetch } = useDataFetching(
    paginatedFetch,
    [page, limit, ...Object.values(params), ...deps],
    paginationOptions
  );
  
  // Update other params while preserving pagination
  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
    // Reset to page 1 when filters change
    setPage(1);
  }, []);
  
  return {
    data,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    params,
    updateParams,
    refetch
  };
};

/**
 * Custom hook for data mutations (create, update, delete)
 * @param {Function} mutationFunction - Async function to perform the mutation
 * @param {object} options - Options for the hook
 * @returns {object} - { mutate, loading, error, data, reset }
 */
export const useDataMutation = (mutationFunction, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    cacheInvalidations = []
  } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);
  
  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mutationFunction(...args);
      setData(result);
      
      // Invalidate cached data
      cacheInvalidations.forEach(key => {
        apiCache.remove(key);
      });
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFunction, onSuccess, onError, cacheInvalidations]);
  
  return { mutate, loading, error, data, reset };
};

export default {
  useDataFetching,
  usePaginatedData,
  useDataMutation
};
