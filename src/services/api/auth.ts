import api, { setAuthToken } from './index';

// Extend Window interface to include our custom property
declare global {
  interface Window {
    tokenRenewalInterval?: NodeJS.Timeout;
  }
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresAt: number;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
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
    try {
      const response = await api.post('/v1/auth/login', credentials);
      const { token, user, expiresAt } = response.data;

      // Only store in localStorage if we're in a browser environment
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('expiresAt', expiresAt.toString());

        // Set cookie with expiration
        const maxAge = Math.floor((expiresAt - Date.now()) / 1000); // Convert to seconds
        document.cookie = `token=${token}; path=/; max-age=${maxAge}`;
      }

      // Set authorization header
      setAuthToken(token);

      // Setup token renewal
      authService.setupTokenRenewal();

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
    const response = await api.post('/v1/users', userData);
    return response.data;
  },

  updateUser: async (id: number, userData: UpdateUserDTO): Promise<User> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const response = await api.put(`/v1/users/${id}`, userData);
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

      const response = await api.post('/v1/users/register', userData);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expiresAt');

        // Clear cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      }

      // Clear Authorization header
      setAuthToken(null);

      console.log('Successfully logged out');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  initializeAuth: () => {
    if (typeof window === 'undefined') {
      return false;
    }

    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('expiresAt');
    const user = localStorage.getItem('user');

    if (!token || !expiresAt || !user) {
      console.log('Missing auth data:', { token: !!token, expiresAt: !!expiresAt, user: !!user });
      return false;
    }

    // Check if token is expired
    const expiryTime = parseInt(expiresAt, 10);
    const now = Date.now();
    if (now >= expiryTime) {
      console.log('Token expired:', { expiryTime, now });
      return false;
    }

    // Set authorization header
    setAuthToken(token);

    // Set cookie with expiration
    const maxAge = Math.floor((expiryTime - now) / 1000); // Convert to seconds
    document.cookie = `token=${token}; path=/; max-age=${maxAge}`;

    // Setup token renewal
    authService.setupTokenRenewal();

    return true;
  },

  renewToken: async (): Promise<TokenResponse> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await api.post('/v1/auth/renew-token');
      
      // Update stored token and expiration
      const { token: newToken, expiresAt, user } = response.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('expiresAt', expiresAt.toString());
      localStorage.setItem('user', JSON.stringify(user));

      // Set cookie with expiration
      const maxAge = Math.floor((expiresAt - Date.now()) / 1000); // Convert to seconds
      document.cookie = `token=${newToken}; path=/; max-age=${maxAge}`;
      
      // Update API client
      setAuthToken(newToken);
      
      return response.data;
    } catch (error: any) {
      console.error('Token renewal failed:', error);
      if (error.response?.status === 401) {
        await authService.logout();
      }
      throw error;
    }
  },

  setupTokenRenewal: () => {
    // Clear any existing interval
    if (typeof window !== 'undefined' && window.tokenRenewalInterval) {
      clearInterval(window.tokenRenewalInterval);
    }
    
    const checkAndRenewToken = async () => {
      try {
        const token = localStorage.getItem('token');
        const expiresAt = localStorage.getItem('expiresAt');
        
        if (!token || !expiresAt) {
          console.log('No token or expiration found, clearing renewal interval');
          if (typeof window !== 'undefined' && window.tokenRenewalInterval) {
            clearInterval(window.tokenRenewalInterval);
            window.tokenRenewalInterval = undefined;
          }
          return;
        }

        const expiryTime = parseInt(expiresAt, 10);
        const now = Date.now();
        const timeUntilExpiry = expiryTime - now;

        // If token expires in less than 15 minutes, renew it
        if (timeUntilExpiry < 15 * 60 * 1000) {
          console.log('Token expiring soon, renewing...');
          await authService.renewToken();
        }
      } catch (error) {
        console.error('Error in token renewal check:', error);
      }
    };

    // Check token every 5 minutes
    if (typeof window !== 'undefined') {
      window.tokenRenewalInterval = setInterval(checkAndRenewToken, 5 * 60 * 1000);
      
      // Also check immediately
      checkAndRenewToken();
    }
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
    const response = await api.post('/v1/users/api-keys', data);
    return response.data;
  },

  getApiKeys: async (): Promise<ApiKeyListItem[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const response = await api.get('/v1/users/api-keys');
    return response.data;
  },

  deleteApiKey: async (id: number): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    await api.delete(`/v1/users/api-keys/${id}`);
  },

  renewApiKey: async (id: number): Promise<ApiKeyResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const response = await api.post(`/v1/users/api-keys/${id}/renew`);
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