'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { ChartControls } from '@/components/charts/ChartControls';
import DrawingToolbar from '@/components/charts/DrawingToolbar';
import { useTheme } from 'next-themes';
import { parseApiError, isRateLimitError, formatRetryAfter } from '@/lib/api-utils';
import { ApiErrorAlert } from '@/components/ui/api-error-alert';
import { useCustomToast } from '@/components/ui/custom-toast';

interface ChartContainerProps {
  data: any[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
}

export default function ChartsPage() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [interval, setInterval] = useState('1D');
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [symbol, setSymbol] = useState('ESH4'); // Default to E-mini S&P 500 March 2024 Future
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | undefined>(undefined);
  const [retryTimestamp, setRetryTimestamp] = useState<string | undefined>(undefined);
  const { showToast, showErrorToast, showWarningToast } = useCustomToast();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const newChart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: theme === 'dark' ? '#1B1B1B' : '#FFFFFF' },
        textColor: theme === 'dark' ? '#D9D9D9' : '#191919',
      },
      width: chartContainerRef.current.clientWidth,
      height: 600,
      crosshair: {
        mode: 1,
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#2B2B2B' : '#E6E6E6' },
        horzLines: { color: theme === 'dark' ? '#2B2B2B' : '#E6E6E6' },
      },
    });

    setChart(newChart);

    const candlestickSeries = newChart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Handle window resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        newChart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    // Fetch initial data
    fetchMarketData(newChart);

    return () => {
      window.removeEventListener('resize', handleResize);
      newChart.remove();
      setChart(null);
    };
  }, [theme]);

  const fetchMarketData = async (targetChart: IChartApi | null = chart) => {
    if (!targetChart) return;
    
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      setRetryAfter(undefined);
      setRetryTimestamp(undefined);
      
      // Convert interval to backend format (remove the '1' prefix)
      const backendInterval = interval.replace(/^1/, '');
      const response = await fetch(`/api/market-data?symbol=${symbol}&interval=${backendInterval}`);
      
      // Check if the response is not ok
      if (!response.ok) {
        const errorResult = await parseApiError(response);
        
        // Store retry information if available
        if (errorResult.retryAfter) {
          setRetryAfter(errorResult.retryAfter);
        }
        
        if (errorResult.details?.retryTimestamp) {
          setRetryTimestamp(errorResult.details.retryTimestamp);
        } else if (errorResult.retryAfter) {
          // Calculate retry timestamp if not provided
          const timestamp = new Date(Date.now() + errorResult.retryAfter * 1000).toISOString();
          setRetryTimestamp(timestamp);
        }
        
        // Show toast notification for rate limit errors
        if (isRateLimitError(errorResult.message)) {
          const retryTime = errorResult.retryAfter 
            ? formatRetryAfter(errorResult.retryAfter)
            : '5 minutes';
            
          showWarningToast(`The Tradovate API is rate limited. Please wait ${retryTime} before trying again.`, 8000);
        } else {
          showErrorToast(errorResult.message, 5000);
        }
        
        throw new Error(errorResult.message);
      }
      
      const data = await response.json();
      
      // Remove existing series and create a new one
      // The IChartApi doesn't have a getSeries method, so we'll create a new series
      // and ensure we don't have multiple series
      targetChart.removeSeries(targetChart.addCandlestickSeries());
      
      const candlestickSeries = targetChart.addCandlestickSeries();
      candlestickSeries.setData(data);
    } catch (error: any) {
      console.error('Error fetching market data:', error);
      setError(error.message || 'Failed to load chart data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntervalChange = (newInterval: string) => {
    setInterval(newInterval);
    fetchMarketData();
  };

  return (
    <div className="flex flex-col w-full h-full p-4 gap-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Trading Charts</h1>
        <ChartControls
          interval={interval}
          onIntervalChange={handleIntervalChange}
          symbol={symbol}
          onSymbolChange={setSymbol}
        />
      </div>
      
      <div className="sticky top-4 z-50 mx-auto w-full max-w-4xl">
        <ApiErrorAlert 
          error={error} 
          title="Chart Data Error" 
          onRetry={() => fetchMarketData()} 
          retryAfter={retryAfter}
          retryTimestamp={retryTimestamp}
        />
      </div>
      
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
        <div ref={chartContainerRef} className="w-full h-[600px]" />
        {chart && <DrawingToolbar chart={chart} />}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <span className="text-white font-medium">Loading chart data...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Data provided by Tradovate API. Chart updates automatically when changing symbol or interval.</p>
      </div>
    </div>
  );
} 