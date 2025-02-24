'use client'

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Trade } from '@/types/models';
import { getEntities, createEntity, updateEntity, deleteEntity } from '@/services/api';

export const Trades: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Trade>();

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    const data = await getEntities('/trades');
    setTrades(data);
  };

  const onSubmit = async (data: Trade) => {
    try {
      if (isEditing && selectedTrade) {
        await updateEntity('/trades', selectedTrade.id.toString(), data);
      } else {
        await createEntity('/trades', data);
      }
      fetchTrades();
      setIsEditing(false);
      setSelectedTrade(null);
      reset();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trades Management</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Bot Plan ID
          </label>
          <input
            type="number"
            {...register('bot_plan_id', { required: 'Bot Plan ID is required' })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.bot_plan_id && <p className="text-red-500 text-xs italic">{errors.bot_plan_id.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            External Position ID
          </label>
          <input
            {...register('ext_position_id', { required: 'External Position ID is required', maxLength: 50 })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.ext_position_id && <p className="text-red-500 text-xs italic">{errors.ext_position_id.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              {...register('price', { required: 'Price is required' })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {errors.price && <p className="text-red-500 text-xs italic">{errors.price.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Stop Loss
            </label>
            <input
              type="number"
              step="0.01"
              {...register('stop_loss', { required: 'Stop Loss is required' })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {errors.stop_loss && <p className="text-red-500 text-xs italic">{errors.stop_loss.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Take Profit
            </label>
            <input
              type="number"
              step="0.01"
              {...register('take_profit', { required: 'Take Profit is required' })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {errors.take_profit && <p className="text-red-500 text-xs italic">{errors.take_profit.message}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Time to Complete (seconds)
          </label>
          <input
            type="number"
            {...register('time_to_complete', { required: 'Time to Complete is required' })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.time_to_complete && <p className="text-red-500 text-xs italic">{errors.time_to_complete.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Run End
          </label>
          <input
            type="datetime-local"
            {...register('run_end', { required: 'Run End is required' })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.run_end && <p className="text-red-500 text-xs italic">{errors.run_end.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Metadata (JSON)
            </label>
            <textarea
              {...register('metadata')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Route Meta (JSON)
            </label>
            <textarea
              {...register('route_meta')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isEditing ? 'Update' : 'Create'} Trade
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Trades List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bot Plan ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stop Loss</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Take Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trades.map((trade: Trade) => (
                <tr key={trade.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{trade.bot_plan_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{trade.ext_position_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{trade.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{trade.stop_loss}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{trade.take_profit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(trade.run_end).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedTrade(trade);
                        setIsEditing(true);
                        reset(trade);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await deleteEntity('/trades', trade.id.toString());
                        fetchTrades();
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 