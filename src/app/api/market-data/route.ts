import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import WebSocket from 'ws';
import fetch from 'node-fetch';
import type { RequestInit } from 'node-fetch';

// Disable SSL verification in development
const agent = process.env.NODE_ENV === 'development'
  ? new https.Agent({
      rejectUnauthorized: false,
      requestCert: false,
      secureOptions: require('constants').SSL_OP_NO_TLSv1_2
    })
  : undefined;

interface ChartBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface WebSocketMessage {
  e: string;
  d?: ChartBar[];
  err?: string;
  i?: number;
  completed?: boolean;
  success?: boolean;
}

async function getAccessToken(): Promise<string> {
  try {
    console.log('Authenticating with Tradovate...');
    
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      agent,
      body: JSON.stringify({
        name: process.env.TRADOVATE_USERNAME,
        password: process.env.TRADOVATE_PASSWORD,
        appId: process.env.TRADOVATE_APP_ID,
        appVersion: process.env.TRADOVATE_APP_VERSION,
        cid: process.env.TRADOVATE_CID,
        sec: process.env.TRADOVATE_SECRET,
        deviceId: process.env.TRADOVATE_DEVICE_ID
      })
    };

    const response = await fetch('https://live.tradovateapi.com/v1/auth/accesstokenrequest', fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Authentication failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to authenticate with Tradovate: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check for rate limiting/CAPTCHA challenge
    if (data['p-captcha'] === true) {
      throw new Error('Authentication rate limited. Please wait a few minutes before trying again. If this persists, you may need to log in to the Tradovate website directly to reset the rate limit.');
    }

    // Check which token field is present
    const token = data.accessToken || data.mdAccessToken || data.token;
    if (!token) {
      console.error('Unexpected authentication response:', {
        ...data,
        accessToken: data.accessToken ? '[REDACTED]' : undefined,
        mdAccessToken: data.mdAccessToken ? '[REDACTED]' : undefined,
        token: data.token ? '[REDACTED]' : undefined
      });
      throw new Error('No access token found in response. Authentication may be rate limited.');
    }

    console.log('Successfully authenticated with Tradovate');
    return token;
  } catch (error) {
    console.error('Error authenticating with Tradovate:', error);
    throw error;
  }
}

async function getChartData(symbol: string, interval: string): Promise<ChartBar[]> {
  const accessToken = await getAccessToken();

  return new Promise((resolve, reject) => {
    const ws = new WebSocket('wss://live.tradovateapi.com/v1/websocket', {
      agent,
      rejectUnauthorized: false // Add this to disable SSL verification for WebSocket
    });
    
    const bars: ChartBar[] = [];
    let timeoutId: NodeJS.Timeout;
    let isAuthenticated = false;
    let requestId = Date.now();
    let isSocketReady = false;
    let heartbeatInterval: NodeJS.Timeout;
    let isHandshakeComplete = false;

    function startHeartbeat() {
      heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('h');
        }
      }, 5000);
    }

    function stopHeartbeat() {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    }

    function sendMessage(message: Record<string, unknown>) {
      if (ws.readyState === WebSocket.OPEN) {
        const sanitizedMessage = { ...message };
        if (sanitizedMessage.token) {
          sanitizedMessage.token = '[REDACTED]';
        }
        if (sanitizedMessage.accessToken) {
          sanitizedMessage.accessToken = '[REDACTED]';
        }
        console.log('Sending WebSocket message:', sanitizedMessage);
        ws.send(JSON.stringify(message));
      } else {
        console.log('WebSocket not ready, state:', ws.readyState);
      }
    }

    function authenticate() {
      if (!isSocketReady || !isHandshakeComplete) {
        console.log('Socket not ready for authentication');
        return;
      }

      console.log('Preparing to authenticate WebSocket with token:', accessToken ? '[REDACTED]' : 'undefined');

      // Reset timeout for authentication
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        stopHeartbeat();
        ws.close();
        reject(new Error('Authentication timed out'));
      }, 10000);

      // Send authentication request
      const authMessage = {
        e: 'authorize',
        token: accessToken, // Try using 'token' instead of 'accessToken'
        md: true // Request market data access
      };

      console.log('Sending authentication message with structure:', {
        ...authMessage,
        token: authMessage.token ? '[REDACTED]' : undefined
      });

      sendMessage(authMessage);
    }

    // Set up initial connection timeout
    timeoutId = setTimeout(() => {
      stopHeartbeat();
      ws.close();
      reject(new Error('WebSocket connection timed out'));
    }, 10000);

    ws.on('open', () => {
      console.log('WebSocket connected');
      isSocketReady = true;
      startHeartbeat();
    });

    ws.on('message', (data: Buffer) => {
      try {
        const rawData = data.toString();

        // Handle heartbeat
        if (rawData === 'h') {
          ws.send('h');
          return;
        }

        // Handle initial handshake
        if (rawData === 'o') {
          console.log('Received WebSocket handshake');
          isHandshakeComplete = true;
          setTimeout(() => authenticate(), 100); // Small delay before auth
          return;
        }

        // Handle JSON messages
        const message: WebSocketMessage = JSON.parse(rawData);
        console.log('Received message:', message.e);

        // Handle authentication response
        if (message.e === 'authorize') {
          if (message.success) {
            console.log('Successfully authenticated WebSocket connection');
            isAuthenticated = true;
            
            // Reset timeout for the chart data request
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              stopHeartbeat();
              ws.close();
              reject(new Error('Chart data request timed out'));
            }, 10000);

            // Send chart data request
            const chartRequest = {
              e: 'getHistoricalData',
              symbol: symbol,
              contractMaturity: 0, // Get front month
              chartDescription: {
                underlyingType: 'Futures',
                elementSize: 1,
                timeframe: interval,
                chartType: 'Candlestick'
              },
              i: requestId
            };
            sendMessage(chartRequest);
          } else {
            console.error('Authentication failed:', message);
            stopHeartbeat();
            ws.close();
            reject(new Error(`WebSocket authentication failed: ${JSON.stringify(message)}`));
          }
          return;
        }

        // Handle chart data response
        if (message.e === 'historicalData') {
          console.log('Received historical data response');
          
          if (message.err) {
            console.error('Chart data error:', message.err);
            stopHeartbeat();
            ws.close();
            reject(new Error(`Chart data error: ${message.err}`));
            return;
          }

          if (message.d && Array.isArray(message.d)) {
            console.log('Found chart bars in d array, length:', message.d.length);
            bars.push(...message.d);
          }

          // Check if this is the response to our request and it's complete
          if (message.i === requestId && message.completed) {
            console.log('Request completed, total bars:', bars.length);
            clearTimeout(timeoutId);
            stopHeartbeat();
            ws.close();
            resolve(bars);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        console.error('Raw message:', data.toString());
      }
    });

    ws.on('error', (error: Error) => {
      clearTimeout(timeoutId);
      stopHeartbeat();
      console.error('WebSocket error:', error);
      reject(error);
    });

    ws.on('close', () => {
      clearTimeout(timeoutId);
      stopHeartbeat();
      console.log('WebSocket connection closed');
      if (!isSocketReady) {
        reject(new Error('WebSocket connection failed'));
      } else if (!isHandshakeComplete) {
        reject(new Error('WebSocket closed before handshake'));
      } else if (!isAuthenticated) {
        reject(new Error('WebSocket closed before authentication'));
      } else if (bars.length === 0) {
        reject(new Error('No chart data received before connection closed'));
      }
    });
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval');

  if (!symbol || !interval) {
    return NextResponse.json(
      { 
        error: 'Symbol and interval are required',
        errorType: 'ValidationError'
      },
      { status: 400 }
    );
  }

  try {
    // Convert interval to backend format
    const backendInterval = interval === 'D' ? '1D' : 
                          interval === 'W' ? '1W' : 
                          `${interval}min`;

    console.log('Fetching market data with:', {
      symbol,
      interval: backendInterval,
      originalInterval: interval
    });

    const chartData = await getChartData(symbol, backendInterval);
    console.log('Received chart data:', chartData.slice(0, 2)); // Log first two bars for debugging

    // Transform data to match TradingView format
    const transformedData = chartData.map((candle: ChartBar) => ({
      time: candle.timestamp / 1000, // Convert to seconds
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume || 0, // Default to 0 if volume is missing
    }));

    console.log('Transformed data:', transformedData.slice(0, 2)); // Log first two transformed bars

    // Add CORS headers
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    return NextResponse.json(transformedData, { headers });
  } catch (error: any) {
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      cause: error?.cause,
      stack: error?.stack
    });
    
    // Determine if this is a rate limiting error
    const isRateLimitError = error?.message?.includes('rate limited') || 
                            error?.message?.includes('p-captcha');
    
    // Create details object with proper typing
    const details: {
      timestamp: string;
      symbol: string | null;
      interval: string | null;
      retryAfter?: number;
      retryAfterHuman?: string;
      retryTimestamp?: string;
    } = {
      timestamp: new Date().toISOString(),
      symbol,
      interval
    };
    
    // Add Retry-After information for rate limiting errors
    if (isRateLimitError) {
      details.retryAfter = 300;
      details.retryAfterHuman = '5 minutes';
      details.retryTimestamp = new Date(Date.now() + 300 * 1000).toISOString();
    }
    
    // Create a structured error response
    const errorResponse = {
      error: error?.message || 'Unknown error',
      errorType: isRateLimitError ? 'RateLimitError' : 'FetchError',
      details
    };
    
    // Use 429 status code for rate limiting errors
    const statusCode = isRateLimitError ? 429 : 500;
    
    // Add CORS headers to error response
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    
    // Add Retry-After header for rate limiting errors (5 minutes)
    if (isRateLimitError) {
      headers.append('Retry-After', '300');
    }
    
    return NextResponse.json(errorResponse, { 
      status: statusCode,
      headers 
    });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 