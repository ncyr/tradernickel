/**
 * Utility functions for API error handling
 */

/**
 * Standard error response structure
 */
export interface ApiErrorResponse {
  error: string;
  errorType?: string;
  details?: {
    timestamp?: string;
    symbol?: string | null;
    interval?: string | null;
    retryAfter?: number;
    retryAfterHuman?: string;
    retryTimestamp?: string;
    [key: string]: any;
  };
}

/**
 * Parse an API error response
 * @param response The fetch Response object
 * @returns A promise that resolves to the error message and details
 */
export async function parseApiError(response: Response): Promise<{
  message: string;
  details?: ApiErrorResponse['details'];
  retryAfter?: number;
}> {
  try {
    const data = await response.json() as ApiErrorResponse;
    
    // Get retry-after header if present
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;
    
    // Handle rate limiting specifically
    if (response.status === 429 || data.errorType === 'RateLimitError') {
      return {
        message: `Rate limit exceeded: ${data.error || 'Please try again later'}`,
        details: data.details,
        retryAfter: retryAfter || data.details?.retryAfter
      };
    }
    
    return {
      message: data.error || `Error: ${response.status} ${response.statusText}`,
      details: data.details,
      retryAfter
    };
  } catch (e) {
    // If we can't parse the JSON, return a generic error
    return {
      message: `Error: ${response.status} ${response.statusText}`
    };
  }
}

/**
 * Format a retry-after duration in seconds to a human-readable string
 * @param seconds The number of seconds to wait
 * @returns A human-readable string
 */
export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  } else if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.ceil(seconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
}

/**
 * Handle API errors in a consistent way
 * @param error The error object
 * @returns A user-friendly error message
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred. Please try again later.';
}

/**
 * Check if an error is related to rate limiting
 * @param error The error message or object
 * @returns True if the error is related to rate limiting
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('rate limit') || 
           error.message.includes('Rate limit') ||
           error.message.includes('429');
  }
  
  if (typeof error === 'string') {
    return error.includes('rate limit') || 
           error.includes('Rate limit') ||
           error.includes('429');
  }
  
  return false;
} 