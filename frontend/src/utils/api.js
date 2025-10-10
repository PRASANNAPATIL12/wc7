// API utility functions

/**
 * Get the backend URL for API calls
 * In production/deployed environments, uses window.location.origin
 * In development, uses REACT_APP_BACKEND_URL from .env
 */
export const getBackendUrl = () => {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  
  // If REACT_APP_BACKEND_URL is explicitly set and not empty, use it
  if (envUrl && envUrl.trim() !== '') {
    return envUrl;
  }
  
  // Otherwise, use current origin (works for deployed environments)
  return window.location.origin;
};

/**
 * Make an API call with proper error handling
 */
export const apiCall = async (endpoint, options = {}) => {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    return response;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};
