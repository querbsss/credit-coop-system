// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.token && { token: localStorage.token }),
      ...options.headers,
    },
    ...options,
  };
  
  const response = await fetch(url, config);
  return response;
};

export default API_BASE_URL;