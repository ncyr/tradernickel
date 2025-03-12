// JWT Secret from environment variable
export const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

// API URL from environment variable
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-local.tradernickel.com';

// Environment
export const ENV = process.env.NEXT_PUBLIC_ENV || 'local';

// Token expiration time in seconds (24 hours)
export const TOKEN_EXPIRATION = 24 * 60 * 60; 