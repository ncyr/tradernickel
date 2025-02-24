'use client'

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BotPlan } from '@/types/models';
import { getEntities, createEntity, updateEntity, deleteEntity } from '@/services/api';

export const BotPlans: React.FC = () => {
  const [botPlans, setBotPlans] = useState<BotPlan[]>([]);
  const [selectedBotPlan, setSelectedBotPlan] = useState<BotPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BotPlan>();

  useEffect(() => {
    fetchBotPlans();
  }, []);

  const fetchBotPlans = async () => {
    const data = await getEntities('/bot-plans');
    setBotPlans(data);
  };

  const onSubmit = async (data: BotPlan) => {
    try {
      if (isEditing && selectedBotPlan) {
        await updateEntity('/bot-plans', selectedBotPlan.id.toString(), data);
      } else {
        await createEntity('/bot-plans', data);
      }
      fetchBotPlans();
      setIsEditing(false);
      setSelectedBotPlan(null);
      reset();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bot Plans Management</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Bot ID
          </label>
          <input
            type="number"
            {...register('bot_id', { required: 'Bot ID is required' })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.bot_id && <p className="text-red-500 text-xs italic">{errors.bot_id.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Plan ID
          </label>
          <input
            type="number"
            {...register('plan_id', { required: 'Plan ID is required' })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.plan_id && <p className="text-red-500 text-xs italic">{errors.plan_id.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Metadata (JSON)
          </label>
          <textarea
            {...register('metadata')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isEditing ? 'Update' : 'Create'} Bot Plan
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Bot Plans List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bot ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {botPlans.map((botPlan: BotPlan) => (
                <tr key={botPlan.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{botPlan.bot_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{botPlan.plan_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(botPlan.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedBotPlan(botPlan);
                        setIsEditing(true);
                        reset(botPlan);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await deleteEntity('/bot-plans', botPlan.id.toString());
                        fetchBotPlans();
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