"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { authService, ApiKeyListItem, CreateApiKeyDTO, ApiKeyResponse } from '@/services/api/auth';
import Link from 'next/link';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<ApiKeyResponse | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateApiKeyDTO>({
    defaultValues: {
      name: '',
      expiresAt: null
    }
  });

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await authService.getApiKeys();
      setApiKeys(keys);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleGenerateKey = async (data: CreateApiKeyDTO) => {
    try {
      setLoading(true);
      const key = await authService.generateApiKey(data);
      setNewKey(key);
      setShowGenerateForm(false);
      reset();
      await fetchApiKeys();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate API key');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      try {
        setLoading(true);
        await authService.deleteApiKey(id);
        await fetchApiKeys();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete API key');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (timestamp: number | null | string) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <Link href="/account" className="text-blue-500 hover:text-blue-700">
          Back to Account
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {newKey && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold mb-2">New API Key Generated</p>
          <p className="mb-2">Name: {newKey.name}</p>
          <p className="mb-2">Key: <span className="font-mono bg-gray-100 p-1 rounded">{newKey.key}</span></p>
          <p className="mb-2">Expires: {newKey.expiresAt ? formatDate(newKey.expiresAt) : 'Never'}</p>
          <p className="text-red-500 font-bold">Make sure to copy your API key now. You won't be able to see it again!</p>
          <button 
            onClick={() => setNewKey(null)}
            className="mt-2 bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
          >
            Got it
          </button>
        </div>
      )}

      {showGenerateForm ? (
        <div className="bg-white shadow-md rounded p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Generate New API Key</h2>
          <form onSubmit={handleSubmit(handleGenerateKey)}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Name (for your reference)</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full p-2 border rounded"
                placeholder="e.g., My App Integration"
              />
              {errors.name && <p className="text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Expiration</label>
              <select
                {...register('expiresAt')}
                className="w-full p-2 border rounded"
              >
                <option value="">Never (no expiration)</option>
                <option value={Date.now() + 30 * 24 * 60 * 60 * 1000}>30 days</option>
                <option value={Date.now() + 90 * 24 * 60 * 60 * 1000}>90 days</option>
                <option value={Date.now() + 365 * 24 * 60 * 60 * 1000}>1 year</option>
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowGenerateForm(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate API Key'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowGenerateForm(true)}
          className="bg-blue-500 text-white py-2 px-4 rounded mb-6 hover:bg-blue-600"
          disabled={loading}
        >
          Generate New API Key
        </button>
      )}

      <div className="bg-white shadow-md rounded overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
              </tr>
            ) : apiKeys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">No API keys found. Generate one to get started.</td>
              </tr>
            ) : (
              apiKeys.map((key) => (
                <tr key={key.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{key.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(key.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{key.expiresAt ? formatDate(key.expiresAt) : 'Never'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{key.lastUsed ? formatDate(key.lastUsed) : 'Never'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="text-red-500 hover:text-red-700 mr-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded border">
        <h2 className="text-lg font-bold mb-2">Using Your API Key</h2>
        <p className="mb-2">Include your API key in the Authorization header of your requests:</p>
        <pre className="bg-gray-800 text-white p-3 rounded overflow-x-auto">
          Authorization: Bearer YOUR_API_KEY
        </pre>
        <p className="mt-2 text-sm text-gray-600">
          Keep your API key secure. Do not share it or expose it in client-side code.
          If compromised, delete the key and generate a new one.
        </p>
      </div>
    </div>
  );
} 