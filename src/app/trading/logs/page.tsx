"use client";

import { useState, useEffect } from 'react';
import { tradeLogService, TradeLog, TradeLogFilters, TradeLogStats } from '@/services/api/tradeLogs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Default filter values
const defaultFilters: TradeLogFilters = {
  page: 1,
  symbol: undefined,
  trade_type: undefined,
  status: undefined,
  start_date: undefined,
  end_date: undefined,
  bot_name: undefined,
  sort_by: 'created_at',
  sort_order: 'desc'
};

export default function TradeLogsPage() {
  const router = useRouter();
  
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Initialize with default filters
  const [filters, setFilters] = useState<TradeLogFilters>(defaultFilters);
  const [stats, setStats] = useState<TradeLogStats | null>(null);
  const [showStats, setShowStats] = useState(false);

  const fetchTradeLogs = async () => {
    try {
      setLoading(true);
      const response = await tradeLogService.getTradeLogsByUser(filters);
      setTradeLogs(response.tradeLogs);
      setPagination(response.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load trade logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { start_date, end_date, bot_name } = filters;
      const stats = await tradeLogService.getTradeLogStats({ start_date, end_date, bot_name });
      setStats(stats);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  // Update filters from URL after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlFilters: TradeLogFilters = {
        page: params.get('page') ? parseInt(params.get('page') as string) : defaultFilters.page,
        symbol: params.get('symbol') || defaultFilters.symbol,
        trade_type: params.get('trade_type') || defaultFilters.trade_type,
        status: params.get('status') || defaultFilters.status,
        start_date: params.get('start_date') || defaultFilters.start_date,
        end_date: params.get('end_date') || defaultFilters.end_date,
        bot_name: params.get('bot_name') || defaultFilters.bot_name,
        sort_by: params.get('sort_by') || defaultFilters.sort_by,
        sort_order: (params.get('sort_order') as 'asc' | 'desc') || defaultFilters.sort_order
      };
      setFilters(urlFilters);
    }
  }, []);

  useEffect(() => {
    fetchTradeLogs();
    if (showStats) {
      fetchStats();
    }
  }, [filters, showStats]);

  const handleFilterChange = (name: string, value: string | number) => {
    const newFilters: TradeLogFilters = {
      ...filters,
      [name]: value,
      // Reset to page 1 when changing filters, ensure page is always a number
      page: name === 'page' ? Number(value) : 1
    };
    setFilters(newFilters);
    
    // Update URL query params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        params.set(key, val.toString());
      }
    });
    
    router.push(`/trading/logs?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bot Trade Logs</h1>
        <Link href="/trading" className="text-blue-500 hover:text-blue-700">
          Back to Trading
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setShowStats(!showStats)}
          className="mb-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {showStats ? 'Hide Statistics' : 'Show Statistics'}
        </button>

        {showStats && stats && (
          <div className="bg-white shadow-md rounded p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Trade Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="text-lg font-semibold mb-2">By Status</h3>
                <div className="space-y-2">
                  {stats.status_counts.map((item) => (
                    <div key={item.status} className="flex justify-between">
                      <span className={`px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="text-lg font-semibold mb-2">By Type</h3>
                <div className="space-y-2">
                  {stats.type_counts.map((item) => (
                    <div key={item.trade_type} className="flex justify-between">
                      <span>{item.trade_type}</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="text-lg font-semibold mb-2">Total Values</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Buy:</span>
                    <span className="font-bold">
                      {stats.total_values.total_buy_value 
                        ? formatCurrency(parseFloat(stats.total_values.total_buy_value)) 
                        : '$0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Sell:</span>
                    <span className="font-bold">
                      {stats.total_values.total_sell_value 
                        ? formatCurrency(parseFloat(stats.total_values.total_sell_value)) 
                        : '$0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="text-lg font-semibold mb-2">Popular Symbols</h3>
                <div className="space-y-2">
                  {stats.popular_symbols.map((item) => (
                    <div key={item.symbol} className="flex justify-between">
                      <span>{item.symbol}</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="text-lg font-semibold mb-2">By Bot</h3>
                <div className="space-y-2">
                  {stats.bot_counts.map((item) => (
                    <div key={item.bot_name || 'unnamed'} className="flex justify-between">
                      <span>{item.bot_name || 'Unnamed Bot'}</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Filter Logs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Symbol</label>
            <input
              type="text"
              value={filters.symbol || ''}
              onChange={(e) => handleFilterChange('symbol', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="BTC/USD"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Trade Type</label>
            <select
              value={filters.trade_type || ''}
              onChange={(e) => handleFilterChange('trade_type', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Types</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="limit_buy">Limit Buy</option>
              <option value="limit_sell">Limit Sell</option>
              <option value="market_buy">Market Buy</option>
              <option value="market_sell">Market Sell</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Bot Name</label>
            <input
              type="text"
              value={filters.bot_name || ''}
              onChange={(e) => handleFilterChange('bot_name', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="My Trading Bot"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.start_date || ''}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.end_date || ''}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Sort By</label>
            <select
              value={filters.sort_by || 'created_at'}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="created_at">Date</option>
              <option value="symbol">Symbol</option>
              <option value="trade_type">Trade Type</option>
              <option value="price">Price</option>
              <option value="quantity">Quantity</option>
              <option value="total_value">Total Value</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Sort Order</label>
            <select
              value={filters.sort_order || 'desc'}
              onChange={(e) => handleFilterChange('sort_order', e.target.value as 'asc' | 'desc')}
              className="w-full p-2 border rounded"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bot</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center">Loading...</td>
              </tr>
            ) : tradeLogs.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center">No trade logs found.</td>
              </tr>
            ) : (
              tradeLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(log.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.trade_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(log.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(log.total_value)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.bot_name || 'Unnamed Bot'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/trading/logs/${log.id}`}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className={`px-4 py-2 rounded ${
                pagination.page === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              // Show 5 pages at most
              let pageNum;
              if (pagination.pages <= 5) {
                // If we have 5 or fewer pages, show all
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                // If we're at the start, show pages 1-5
                pageNum = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                // If we're at the end, show the last 5 pages
                pageNum = pagination.pages - 4 + i;
              } else {
                // Otherwise show 2 pages before and after the current page
                pageNum = pagination.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handleFilterChange('page', pageNum)}
                  className={`px-4 py-2 rounded ${
                    pagination.page === pageNum
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handleFilterChange('page', Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page === pagination.pages}
              className={`px-4 py-2 rounded ${
                pagination.page === pagination.pages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 