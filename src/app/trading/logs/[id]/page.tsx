"use client";

import { useState, useEffect } from 'react';
import { tradeLogService, TradeLog } from '@/services/api/tradeLogs';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TradeLogDetailsPage() {
  const params = useParams();
  const logId = params?.id ? parseInt(params.id as string) : null;
  
  const [tradeLog, setTradeLog] = useState<TradeLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!logId) {
      setError('Invalid trade log ID');
      setLoading(false);
      return;
    }

    const fetchTradeLog = async () => {
      try {
        const response = await tradeLogService.getTradeLogById(logId);
        setTradeLog(response);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch trade log');
      } finally {
        setLoading(false);
      }
    };

    fetchTradeLog();
  }, [logId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Trade Log Details</h1>
          <Link href="/trading/logs" className="text-blue-500 hover:text-blue-700">
            Back to Trade Logs
          </Link>
        </div>
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  if (error || !tradeLog) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Trade Log Details</h1>
          <Link href="/trading/logs" className="text-blue-500 hover:text-blue-700">
            Back to Trade Logs
          </Link>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Trade log not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trade Log Details</h1>
        <Link href="/trading/logs" className="text-blue-500 hover:text-blue-700">
          Back to Trade Logs
        </Link>
      </div>

      <div className="bg-white shadow-md rounded p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">
            {tradeLog.trade_type.toUpperCase()} {tradeLog.symbol}
          </h2>
          <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(tradeLog.status)}`}>
            {tradeLog.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Trade Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span>{formatDate(tradeLog.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Symbol:</span>
                <span>{tradeLog.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span>{tradeLog.trade_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span>{tradeLog.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span>{formatCurrency(tradeLog.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-semibold">{formatCurrency(tradeLog.total_value)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Bot Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Bot Name:</span>
                <span>{tradeLog.bot_name || 'Unnamed Bot'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Exchange:</span>
                <span>{tradeLog.exchange || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-xs">{tradeLog.order_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>{tradeLog.updated_at ? formatDate(tradeLog.updated_at) : 'N/A'}</span>
              </div>
            </div>
          </div>

          {tradeLog.error_message && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-red-600">Error Information</h3>
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <p className="text-red-700">{tradeLog.error_message}</p>
              </div>
            </div>
          )}
        </div>

        {tradeLog.metadata && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Additional Metadata</h3>
            <div className="bg-gray-50 p-4 rounded border overflow-x-auto">
              <pre className="text-sm">{JSON.stringify(tradeLog.metadata, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 