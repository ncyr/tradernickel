import axios, { InternalAxiosRequestConfig } from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-local.tradernickel.com';

// Create a function to get headers based on the environment
const getHeaders = () => {
  const headers: { [key: string]: string } = {};
  
  // Only try to get token from localStorage in browser environment
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: false, // Disable credentials to avoid CORS preflight
  httpsAgent: new (require('https').Agent)({
    rejectUnauthorized: false // Ignore SSL certificate issues in development
  })
});

// Add a request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add headers from the getHeaders function
    const headers = getHeaders();
    config.headers = config.headers || {};
    Object.assign(config.headers, headers);
    
    // Log the request for debugging
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      hasAuthHeader: !!headers.Authorization
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    return Promise.reject(error);
  }
);

// Function to set auth token directly (useful for server-side or testing)
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api; 