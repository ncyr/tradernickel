import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-local.tradernickel.com';

console.log('API URL:', apiUrl);

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

// Create a custom HTTPS agent that ignores SSL certificate errors
// This is needed for local development with self-signed certificates
const getHttpsAgent = () => {
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    const https = require('https');
    return new https.Agent({
      rejectUnauthorized: false
    });
  }
  return undefined;
};

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: false, // Disable credentials to avoid CORS preflight
  httpsAgent: getHttpsAgent(),
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

// Function to process the queue of failed requests
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

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
      baseURL: config.baseURL,
      hasAuthHeader: !!headers.Authorization
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If we can't get the config, just reject
    if (!originalRequest) {
      return Promise.reject(error);
    }
    
    // Check if the error is due to an expired token
    const isTokenExpiredError = 
      error.response?.status === 401 && 
      (error.response?.data as any)?.code === 'TOKEN_EXPIRED';
    
    // If token is expired and we're not already refreshing
    if (isTokenExpiredError && !isRefreshing && typeof window !== 'undefined') {
      isRefreshing = true;
      
      // Create a new promise that will be resolved when the token is refreshed
      return new Promise((resolve, reject) => {
        // Try to get a new token
        axios.post('/api/auth/token', {
          username: 'test', // This should be replaced with actual user credentials
          password: 'test'  // This should be replaced with actual user credentials
        })
          .then(({ data }) => {
            if (data.token) {
              // Save the new token
              localStorage.setItem('token', data.token);
              
              // Update the failed request with the new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${data.token}`;
              }
              
              // Process the queue with the new token
              processQueue(null, data.token);
              
              // Retry the original request
              resolve(axios(originalRequest));
            } else {
              processQueue(new Error('Failed to refresh token'));
              reject(error);
            }
          })
          .catch((refreshError) => {
            processQueue(refreshError);
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }
    
    // If we're already refreshing, add this request to the queue
    if (isTokenExpiredError && isRefreshing && typeof window !== 'undefined') {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axios(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }
    
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: originalRequest.url,
      method: originalRequest.method
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