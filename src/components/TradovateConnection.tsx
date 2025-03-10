import React, { useState, useEffect } from 'react';
import { tradovateService, TradovateCredentials } from '@/services/api/tradovate';

interface TradovateConnectionProps {
  onConnectionChange?: (isConnected: boolean) => void;
  autoConnect?: boolean;
}

const TradovateConnection: React.FC<TradovateConnectionProps> = ({
  onConnectionChange,
  autoConnect = true
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<TradovateCredentials>({
    name: '',
    password: '',
    appId: '',
    appVersion: ''
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if we have stored credentials
        const storedCredentials = localStorage.getItem('tradovateCredentials');
        
        if (storedCredentials && autoConnect) {
          setIsLoading(true);
          setError(null);
          
          try {
            // Try to get a token - this will refresh if needed
            await tradovateService.getAccessToken();
            setIsConnected(true);
            if (onConnectionChange) {
              onConnectionChange(true);
            }
          } catch (err) {
            console.error('Failed to auto-connect to Tradovate:', err);
            setIsConnected(false);
            if (onConnectionChange) {
              onConnectionChange(false);
            }
          } finally {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error checking Tradovate connection:', err);
      }
    };
    
    checkConnection();
  }, [autoConnect, onConnectionChange]);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await tradovateService.login(credentials);
      setIsConnected(true);
      if (onConnectionChange) {
        onConnectionChange(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Tradovate');
      setIsConnected(false);
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    tradovateService.logout();
    setIsConnected(false);
    if (onConnectionChange) {
      onConnectionChange(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Tradovate Connection</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isConnected ? (
        <div>
          <div className="flex items-center mb-4">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-green-700 font-medium">Connected to Tradovate</span>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            disabled={isLoading}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-4">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span className="text-red-700 font-medium">Not connected</span>
          </div>
          
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="name"
                value={credentials.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">App ID (optional)</label>
              <input
                type="text"
                name="appId"
                value={credentials.appId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">App Version (optional)</label>
              <input
                type="text"
                name="appVersion"
                value={credentials.appVersion}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <button
            onClick={handleConnect}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            disabled={isLoading || !credentials.name || !credentials.password}
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TradovateConnection; 