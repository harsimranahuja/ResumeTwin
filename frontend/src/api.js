/**
 * Dynamic API Base URL configuration
 * Switches between local development and production Render backend
 */

const getApiBaseUrl = () => {
  // If we are running locally (localhost or 127.0.0.1)
  if (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  ) {
    return 'http://localhost:5000/api';
  }
  
  // Otherwise use the deployed Render backend
  return 'https://resumetwin.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;
