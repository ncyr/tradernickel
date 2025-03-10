import api from './index';

export interface LoginResponse {
  user: User;
  token: string;
  expiresAt: number;
}

export interface User {
  id: number;
  username: string;
  name: string;
  active: boolean;
  role: 'admin' | 'premium' | 'user';
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface CreateUserDTO {
  username: string;
  password: string;
  name: string;
  active: boolean;
  role?: string;
}

export interface UpdateUserDTO extends Partial<CreateUserDTO> {}

export interface RegisterDTO {
  username: string;
  password: string;
  name: string;
}

export interface TokenResponse {
  token: string;
  user: User;
  expiresAt: number;
}

export interface PatchUserDTO {
  [key: string]: string | boolean;
}

export interface UserDetails extends User {
  created_at: string;
  updated_at: string;
}

export interface ApiKeyResponse {
  id: number;
  name: string;
  key: string;
  expiresAt: number | null;
  createdAt: string;
}

export interface ApiKeyListItem {
  id: number;
  name: string;
  createdAt: string;
  expiresAt: number | null;
  lastUsed: string | null;
}

export interface CreateApiKeyDTO {
  name: string;
  expiresAt?: number | null; // null means no expiration
}

export const authService = {
  login: async (credentials: LoginDTO): Promise<LoginResponse> => {
    console.log('Auth service login called with:', { username: credentials.username });
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('API base URL:', api.defaults.baseURL);
    console.log('Full request URL will be:', api.defaults.baseURL + '/users/login');
    
    try {
      console.log('Sending login request to:', '/users/login');
      const response = await api.post('/users/login', credentials);
      console.log('Login API response:', response);
      
      const { token, expiresAt, user } = response.data;
      
      // Store all auth data at once
      const authData = {
        token,
        expiresAt: expiresAt.toString(),
        user: JSON.stringify(user)
      };
      
      console.log('Storing auth data:', { token: token.substring(0, 10) + '...', expiresAt, user });
      
      // Batch localStorage operations
      Object.entries(authData).forEach(([key, value]) => {
        try {
          localStorage.setItem(key, value);
          console.log(`Successfully stored ${key} in localStorage`);
        } catch (error) {
          console.error(`Error storing ${key} in localStorage:`, error);
        }
      });
      
      // Set cookie with proper path and expiry
      try {
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}`; // 24 hours
        console.log('Successfully set token cookie');
      } catch (error) {
        console.error('Error setting token cookie:', error);
      }
      
      // Set authorization header
      try {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        console.log('Successfully set Authorization header');
      } catch (error) {
        console.error('Error setting Authorization header:', error);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  createUser: async (userData: CreateUserDTO): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id: number, userData: UpdateUserDTO): Promise<User> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  register: async (userData: RegisterDTO): Promise<User> => {
    try {
      // Validate lengths before sending
      if (userData.username.length > 50) {
        throw new Error('Username must be 50 characters or less');
      }
      if (userData.name.length > 100) {
        throw new Error('Name must be 100 characters or less');
      }
      if (userData.password.length > 100) {
        throw new Error('Password must be 100 characters or less');
      }

      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiresAt');

      // Clear cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

      // Clear Authorization header
      delete api.defaults.headers.common.Authorization;

      console.log('Successfully logged out');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  initializeAuth: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // Only set if not already set
    if (!api.defaults.headers.common.Authorization) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    // Only set cookie if not present
    if (!document.cookie.includes('token=')) {
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}`;
    }

    return true;
  },

  renewToken: async (): Promise<TokenResponse> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await api.post('/users/renew-token');
      
      // Update stored token and expiration
      const { token: newToken, expiresAt } = response.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());
      localStorage.setItem('user', JSON.stringify(response.data.user));
      document.cookie = `token=${newToken}; path=/`;
      
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        authService.logout();
      }
      throw error;
    }
  },

  setupTokenRenewal: () => {
    let intervalId: NodeJS.Timeout | null = null;
    
    const renewToken = async () => {
      try {
        const token = localStorage.getItem('token');
        const expiresAt = localStorage.getItem('tokenExpiresAt');
        
        if (!token || !expiresAt) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          return;
        }

        const expiryTime = new Date(expiresAt).getTime();
        const now = new Date().getTime();
        const timeUntilExpiry = expiryTime - now;

        // If token expires in less than 5 minutes, renew it
        if (timeUntilExpiry < 5 * 60 * 1000) {
          const response = await api.post('/auth/refresh');
          const { token: newToken, expiresAt: newExpiresAt } = response.data;

          localStorage.setItem('token', newToken);
          localStorage.setItem('tokenExpiresAt', newExpiresAt);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        }
      } catch (error) {
        console.error('Token renewal failed:', error);
        // Clear interval on error to prevent repeated failed attempts
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    // Initial check
    renewToken();
    
    // Set up interval for subsequent checks
    intervalId = setInterval(renewToken, 60 * 1000); // Check every minute

    // Return cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  },

  patchUser: async (id: number, field: string, value: string | boolean): Promise<User> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const response = await api.patch(`/users/${id}`, { [field]: value });
    
    // If updating current user, update stored user data
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.id === id && field !== 'password') {
        localStorage.setItem('user', JSON.stringify({
          ...user,
          [field]: value,
        }));
      }
    }
    
    return response.data;
  },

  getUsers: async (): Promise<UserDetails[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const response = await api.get('/users');
    return response.data;
  },

  getUser: async (id: number): Promise<UserDetails> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  handleSocialCallback: async (params: URLSearchParams): Promise<void> => {
    const token = params.get('token');
    const expiresAt = params.get('expiresAt');
    const userStr = params.get('user');

    if (!token || !expiresAt || !userStr) {
      throw new Error('Invalid authentication response');
    }

    const user = JSON.parse(decodeURIComponent(userStr));

    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiresAt', expiresAt);
    localStorage.setItem('user', JSON.stringify(user));
    document.cookie = `token=${token}; path=/`;
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  },

  loginWithGoogle: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  },

  loginWithApple: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/apple`;
  },

  loginWithMicrosoft: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft`;
  },

  // API Key management
  generateApiKey: async (data: CreateApiKeyDTO): Promise<ApiKeyResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const response = await api.post('/users/api-keys', data);
    return response.data;
  },

  getApiKeys: async (): Promise<ApiKeyListItem[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const response = await api.get('/users/api-keys');
    return response.data;
  },

  deleteApiKey: async (id: number): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    await api.delete(`/users/api-keys/${id}`);
  },

  renewApiKey: async (id: number): Promise<ApiKeyResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const response = await api.post(`/users/api-keys/${id}/renew`);
    return response.data;
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      console.log('getCurrentUser called');
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        return null;
      }
      console.log('Token found in localStorage:', token.substring(0, 10) + '...');
      
      // Check token expiration
      const expiresAt = localStorage.getItem('expiresAt');
      if (expiresAt && parseInt(expiresAt, 10) < Date.now()) {
        console.log('Token expired, clearing auth data');
        authService.logout();
        return null;
      }
      
      const user = localStorage.getItem('user');
      if (!user) {
        console.log('No user found in localStorage');
        return null;
      }
      
      const parsedUser = JSON.parse(user);
      console.log('User retrieved from localStorage:', parsedUser);

      // Ensure the Authorization header is set
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      
      return parsedUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
};