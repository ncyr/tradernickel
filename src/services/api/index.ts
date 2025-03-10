import axios, { InternalAxiosRequestConfig } from 'axios';
import { getConfig } from '../../config/env';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-local.tradernickel.com';

console.log('Initializing API client with base URL:', API_URL + '/v1');

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL + '/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for cross-origin requests
});

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor to always include auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log request URL for debugging
    const requestUrl = `${config.baseURL || API_URL}${config.url || ''}`;
    console.log('Making request to:', requestUrl);
    console.log('Request config:', {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      headers: config.headers,
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added Authorization header with token:', token.substring(0, 10) + '...');
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 0 && error.message.includes('CORS')) {
      console.error('CORS Error - Make sure your API server allows requests from:', window.location.origin);
      console.error('API URL being used:', API_URL);
      return Promise.reject(new Error('Unable to connect to the API server. CORS error.'));
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Will retry after delay...');
      const retryAfter = error.response.headers['retry-after'] || 2;
      const retryMs = parseInt(retryAfter, 10) * 1000;
      
      return new Promise(resolve => {
        console.log(`Waiting ${retryMs}ms before retrying request...`);
        setTimeout(() => {
          console.log('Retrying rate limited request...');
          resolve(api(originalRequest));
        }, retryMs);
      });
    }

    // Handle token expiration
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          // Wait for the token to be refreshed
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to renew the token
        const response = await api.post('/users/renew-token');
        const { token, expiresAt } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('expiresAt', expiresAt.toString());
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        
        processQueue(null, token);
        return api(originalRequest);
      } catch (renewError) {
        processQueue(renewError, null);
        // If token renewal fails, clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expiresAt');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        delete api.defaults.headers.common.Authorization;
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(renewError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other 401 errors
    if (error.response?.status === 401) {
      console.error('Unauthorized - Clearing auth data and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiresAt');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      delete api.defaults.headers.common.Authorization;
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      baseURL: error.config?.baseURL,
      message: error.message,
      stack: error.stack,
    });
    return Promise.reject(error);
  }
);

export default api; 