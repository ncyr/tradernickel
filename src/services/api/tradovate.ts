import api from './index';
import axios from 'axios';

// Configuration
const TRADOVATE_API_URL = process.env.NEXT_PUBLIC_TRADOVATE_URL || 'https://demo.tradovateapi.com/v1';
const TOKEN_EXPIRY_BUFFER = 60 * 1000; // 1 minute buffer before expiry

// Interfaces
export interface TradovateCredentials {
  name: string;
  password: string;
  appId?: string;
  appVersion?: string;
  cid?: string;
  sec?: string;
}

export interface TradovateAccessToken {
  accessToken: string;
  mdAccessToken: string;
  expirationTime: number;
  userId: number;
  name: string;
}

export interface TradovateOrder {
  accountId: number;
  symbol: string;
  orderQty: number;
  orderType: 'Limit' | 'Market' | 'Stop' | 'StopLimit';
  price?: number;
  stopPrice?: number;
  timeInForce?: 'Day' | 'GTC' | 'IOC' | 'FOK';
  action: 'Buy' | 'Sell';
  [key: string]: any;
}

export interface TradovateResponse<T> {
  d: T;
  s: number;
}

// Create a separate axios instance for Tradovate
const tradovateApi = axios.create({
  baseURL: TRADOVATE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Service
class TradovateService {
  private accessToken: TradovateAccessToken | null = null;
  private tokenPromise: Promise<TradovateAccessToken> | null = null;
  private isRefreshing = false;

  constructor() {
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage() {
    try {
      const tokenData = localStorage.getItem('tradovateToken');
      if (tokenData) {
        this.accessToken = JSON.parse(tokenData);
        
        // Initialize headers if we have a token
        if (this.accessToken && this.accessToken.accessToken) {
          tradovateApi.defaults.headers.common.Authorization = `Bearer ${this.accessToken.accessToken}`;
        }
      }
    } catch (error) {
      console.error('Failed to load Tradovate token from storage:', error);
      this.accessToken = null;
    }
  }

  private saveTokenToStorage(token: TradovateAccessToken) {
    localStorage.setItem('tradovateToken', JSON.stringify(token));
    this.accessToken = token;
    tradovateApi.defaults.headers.common.Authorization = `Bearer ${token.accessToken}`;
  }

  private isTokenExpired(): boolean {
    if (!this.accessToken) return true;
    
    // Consider the token expired if it's within our buffer time
    const currentTime = Date.now();
    return currentTime > (this.accessToken.expirationTime - TOKEN_EXPIRY_BUFFER);
  }

  private async authenticate(credentials: TradovateCredentials): Promise<TradovateAccessToken> {
    try {
      // Determine which authentication endpoint to use
      let endpoint = '/auth/accesstokenrequest';
      let payload: any = { name: credentials.name, password: credentials.password };
      
      // If cid/sec are provided, use the OAuth endpoint
      if (credentials.cid && credentials.sec) {
        endpoint = '/auth/oauthtoken';
        payload = {
          grant_type: 'password',
          username: credentials.name,
          password: credentials.password,
          client_id: credentials.cid,
          client_secret: credentials.sec
        };
      }
      
      // Add app info if provided
      if (credentials.appId) {
        payload.appId = credentials.appId;
      }
      if (credentials.appVersion) {
        payload.appVersion = credentials.appVersion;
      }

      const response = await axios.post<TradovateResponse<TradovateAccessToken>>(
        `${TRADOVATE_API_URL}${endpoint}`, 
        payload
      );

      if (response.data.s !== 200) {
        throw new Error(`Authentication failed: ${JSON.stringify(response.data)}`);
      }

      const token = response.data.d;
      this.saveTokenToStorage(token);
      return token;
    } catch (error: any) {
      console.error('Tradovate authentication error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Tradovate');
    }
  }

  private async refreshToken(): Promise<TradovateAccessToken> {
    if (this.isRefreshing) {
      if (!this.tokenPromise) {
        throw new Error('Token refresh promise is null but isRefreshing is true');
      }
      return this.tokenPromise;
    }

    this.isRefreshing = true;
    
    try {
      // Get credentials from secure storage
      const credentials = this.getStoredCredentials();
      if (!credentials) {
        throw new Error('No stored credentials found for token refresh');
      }

      // Create a new promise for the authentication
      this.tokenPromise = this.authenticate(credentials);
      const token = await this.tokenPromise;
      return token;
    } finally {
      this.isRefreshing = false;
      this.tokenPromise = null;
    }
  }

  private getStoredCredentials(): TradovateCredentials | null {
    try {
      const credentialsData = localStorage.getItem('tradovateCredentials');
      if (!credentialsData) return null;
      
      return JSON.parse(credentialsData);
    } catch (error) {
      console.error('Failed to load Tradovate credentials from storage:', error);
      return null;
    }
  }

  private storeCredentials(credentials: TradovateCredentials): void {
    localStorage.setItem('tradovateCredentials', JSON.stringify(credentials));
  }

  // Public methods
  public async login(credentials: TradovateCredentials): Promise<TradovateAccessToken> {
    // Store the credentials for future refresh needs
    this.storeCredentials(credentials);
    
    // Authenticate and get token
    const token = await this.authenticate(credentials);
    return token;
  }

  public logout(): void {
    localStorage.removeItem('tradovateToken');
    localStorage.removeItem('tradovateCredentials');
    this.accessToken = null;
    delete tradovateApi.defaults.headers.common.Authorization;
  }

  public async getAccessToken(): Promise<string> {
    if (this.isTokenExpired()) {
      await this.refreshToken();
    }
    
    if (!this.accessToken) {
      throw new Error('No access token available');
    }
    
    return this.accessToken.accessToken;
  }

  // Execute API calls with token management
  private async executeApiCall<T>(
    apiCall: () => Promise<T>,
    maxRetries = 1
  ): Promise<T> {
    try {
      // Ensure we have a valid token before making the call
      await this.getAccessToken();
      
      // Make the API call
      return await apiCall();
    } catch (error: any) {
      // Check if the error is due to authentication
      if (
        error.response?.status === 401 || 
        error.response?.data?.s === 401 ||
        error.message?.includes('authentication')
      ) {
        if (maxRetries > 0) {
          // Force token refresh and retry
          await this.refreshToken();
          return this.executeApiCall(apiCall, maxRetries - 1);
        }
      }
      throw error;
    }
  }

  // Order creation with retry logic
  public async createOrder(orderParams: TradovateOrder): Promise<any> {
    return this.executeApiCall(async () => {
      const response = await tradovateApi.post('/order/placeorder', orderParams);
      
      if (response.data.s !== 200) {
        throw new Error(`Order creation failed: ${JSON.stringify(response.data)}`);
      }
      
      return response.data.d;
    });
  }

  // Other Tradovate API methods can be added here
  public async getAccounts(): Promise<any> {
    return this.executeApiCall(async () => {
      const response = await tradovateApi.get('/account/list');
      
      if (response.data.s !== 200) {
        throw new Error(`Failed to get accounts: ${JSON.stringify(response.data)}`);
      }
      
      return response.data.d;
    });
  }

  public async getPositions(accountId: number): Promise<any> {
    return this.executeApiCall(async () => {
      const response = await tradovateApi.get(`/position/list?accountId=${accountId}`);
      
      if (response.data.s !== 200) {
        throw new Error(`Failed to get positions: ${JSON.stringify(response.data)}`);
      }
      
      return response.data.d;
    });
  }

  public async cancelOrder(orderId: number): Promise<any> {
    return this.executeApiCall(async () => {
      const response = await tradovateApi.post('/order/cancelorder', { orderId });
      
      if (response.data.s !== 200) {
        throw new Error(`Failed to cancel order: ${JSON.stringify(response.data)}`);
      }
      
      return response.data.d;
    });
  }
}

export const tradovateService = new TradovateService();
export default tradovateService; 