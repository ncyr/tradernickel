import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { XCircle, AlertTriangle, RefreshCw, Clock, ExternalLink, ShieldAlert } from 'lucide-react';
import { isRateLimitError, formatRetryAfter } from '@/lib/api-utils';

interface ApiErrorAlertProps {
  error: string | null;
  title?: string;
  onRetry?: () => void;
  className?: string;
  retryAfter?: number;
  retryTimestamp?: string;
}

/**
 * A reusable component for displaying API errors
 */
export function ApiErrorAlert({ 
  error, 
  title = 'Error', 
  onRetry, 
  className = '',
  retryAfter,
  retryTimestamp
}: ApiErrorAlertProps) {
  if (!error) return null;

  const isRateLimit = isRateLimitError(error);
  
  // Format retry time if available
  const retryTimeFormatted = retryAfter ? formatRetryAfter(retryAfter) : '5 minutes';
  
  // Format retry timestamp if available
  const retryTimeDisplay = retryTimestamp 
    ? new Date(retryTimestamp).toLocaleTimeString() 
    : retryAfter 
      ? new Date(Date.now() + retryAfter * 1000).toLocaleTimeString()
      : null;
  
  return (
    <Alert 
      variant="destructive" 
      className={`
        mb-4 border-l-4 shadow-lg rounded-lg backdrop-blur-[2px]
        ${isRateLimit 
          ? 'border-l-amber-500 bg-gradient-to-r from-amber-50/90 to-amber-50/70 dark:from-amber-950/60 dark:to-amber-900/40 dark:border-amber-600 dark:text-amber-200' 
          : 'border-l-red-500 bg-gradient-to-r from-red-50/90 to-red-50/70 dark:from-red-950/60 dark:to-red-900/40 dark:border-red-600 dark:text-red-200'
        } 
        ${className}
      `}
    >
      <div className="flex flex-col space-y-3">
        <AlertTitle className="flex items-center text-lg font-semibold mb-1">
          {isRateLimit 
            ? <AlertTriangle className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" /> 
            : <XCircle className="h-5 w-5 mr-2 text-red-500 dark:text-red-400" />}
          <span className={`
            ${isRateLimit 
              ? 'text-amber-800 dark:text-amber-300' 
              : 'text-red-800 dark:text-red-300'} 
            font-bold tracking-tight
          `}>
            {title}
          </span>
        </AlertTitle>
        
        <div className={`
          text-base px-3 py-2 rounded-md
          ${isRateLimit 
            ? 'text-amber-700 dark:text-amber-200 bg-amber-100/50 dark:bg-amber-900/20' 
            : 'text-red-700 dark:text-red-200 bg-red-100/50 dark:bg-red-900/20'
          }`
        }>
          {error}
        </div>
        
        {isRateLimit && (
          <div className="text-sm bg-amber-100/80 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800/60 shadow-inner">
            <div className="flex items-center mb-2">
              <ShieldAlert className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
              <p className="text-amber-800 dark:text-amber-200 font-medium">Rate Limit Information</p>
            </div>
            
            <p className="text-amber-700 dark:text-amber-300 mb-3 pl-6">
              The Tradovate API is rate limited. Please wait <span className="font-semibold">{retryTimeFormatted}</span> before trying again.
            </p>
            
            <div className="pl-6 mb-2">
              <a 
                href="https://trader.tradovate.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                <span className="underline underline-offset-2">Log in to Tradovate</span>
              </a>
              <span className="text-amber-600 dark:text-amber-400 ml-1">to reset the rate limit</span>
            </div>
            
            {(retryAfter || retryTimestamp) && (
              <CountdownTimer 
                retryAfter={retryAfter} 
                retryTimestamp={retryTimestamp} 
              />
            )}
          </div>
        )}
        
        {onRetry && (
          <div className="flex justify-end mt-2">
            <button 
              onClick={onRetry} 
              className={`
                flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all
                shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isRateLimit 
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 hover:scale-105 dark:bg-amber-800/40 dark:text-amber-100 dark:hover:bg-amber-700/60 focus:ring-amber-500 dark:focus:ring-amber-600 dark:focus:ring-offset-gray-900' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200 hover:scale-105 dark:bg-red-800/40 dark:text-red-100 dark:hover:bg-red-700/60 focus:ring-red-500 dark:focus:ring-red-600 dark:focus:ring-offset-gray-900'}
              `}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        )}
      </div>
    </Alert>
  );
}

interface CountdownTimerProps {
  retryAfter?: number;
  retryTimestamp?: string;
}

function CountdownTimer({ retryAfter, retryTimestamp }: CountdownTimerProps) {
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [progress, setProgress] = useState<number>(100);
  const [isReady, setIsReady] = useState<boolean>(false);
  
  useEffect(() => {
    let targetTime: number;
    let totalSeconds: number;
    
    if (retryTimestamp) {
      targetTime = new Date(retryTimestamp).getTime();
      totalSeconds = Math.floor((targetTime - Date.now()) / 1000);
    } else if (retryAfter) {
      targetTime = Date.now() + retryAfter * 1000;
      totalSeconds = retryAfter;
    } else {
      // Default to 5 minutes if no retry information is provided
      targetTime = Date.now() + 5 * 60 * 1000;
      totalSeconds = 5 * 60;
    }
    
    // Initial calculation
    const initialSeconds = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
    setRemainingTime(formatRemainingTime(initialSeconds));
    setProgress(Math.max(0, Math.min(100, (initialSeconds / totalSeconds) * 100)));
    setIsReady(initialSeconds <= 0);
    
    // Update every second
    const interval = setInterval(() => {
      const seconds = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
      setRemainingTime(formatRemainingTime(seconds));
      setProgress(Math.max(0, Math.min(100, (seconds / totalSeconds) * 100)));
      setIsReady(seconds <= 0);
      
      if (seconds <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [retryAfter, retryTimestamp]);
  
  // Format remaining time as MM:SS
  function formatRemainingTime(seconds: number): string {
    if (seconds <= 0) return 'Ready to retry';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return (
    <div className="mt-3 bg-amber-50/80 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200/70 dark:border-amber-800/40">
      <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 text-xs mb-2">
        <div className="flex items-center">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          <span>Time remaining:</span>
        </div>
        <span className={`font-medium ${isReady ? 'text-green-600 dark:text-green-400' : ''}`}>
          {remainingTime}
        </span>
      </div>
      
      <div className="w-full bg-amber-200/70 dark:bg-amber-800/50 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ease-linear ${
            isReady 
              ? 'bg-green-500 dark:bg-green-500/80' 
              : 'bg-amber-500/90 dark:bg-amber-500/80'
          }`}
          style={{ width: isReady ? '100%' : `${progress}%` }}
        ></div>
      </div>
      
      {isReady && (
        <div className="mt-2 text-center text-xs text-green-600 dark:text-green-400 font-medium animate-pulse">
          You can now retry your request
        </div>
      )}
    </div>
  );
} 