import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Bot } from '@/types/models';
import { getEntities, createEntity, updateEntity, deleteEntity } from '@/services/api';

export const Bots: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Bot>();

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    const data = await getEntities('/bots');
    setBots(data);
  };

  const onSubmit = async (data: Bot) => {
    try {
      if (isEditing && selectedBot) {
        await updateEntity('/bots', selectedBot.id.toString(), data);
      } else {
        await createEntity('/bots', data);
      }
      fetchBots();
      setIsEditing(false);
      setSelectedBot(null);
      reset();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bots Management</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            {...register('name', { required: 'Name is required', maxLength: 50 })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.name && <p className="text-red-500 text-xs italic">{errors.name.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            {...register('description', { required: 'Description is required', maxLength: 100 })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.description && <p className="text-red-500 text-xs italic">{errors.description.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Region
          </label>
          <input
            {...register('region', { required: 'Region is required', maxLength: 25 })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.region && <p className="text-red-500 text-xs italic">{errors.region.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Provider
          </label>
          <input
            {...register('provider', { required: 'Provider is required', maxLength: 25 })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.provider && <p className="text-red-500 text-xs italic">{errors.provider.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Owner ID
          </label>
          <input
            type="number"
            {...register('owner_id', { required: 'Owner ID is required' })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.owner_id && <p className="text-red-500 text-xs italic">{errors.owner_id.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Broker ID
          </label>
          <input
            type="number"
            {...register('broker_id', { required: 'Broker ID is required' })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.broker_id && <p className="text-red-500 text-xs italic">{errors.broker_id.message}</p>}
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

        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Active
            </label>
            <input
              type="checkbox"
              {...register('active')}
              className="mr-2 leading-tight"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Copy Active
            </label>
            <input
              type="checkbox"
              {...register('copy_active')}
              className="mr-2 leading-tight"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isEditing ? 'Update' : 'Create'} Bot
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Bots List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Copy Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bots.map((bot: Bot) => (
                <tr key={bot.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{bot.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bot.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bot.region}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bot.provider}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bot.active ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bot.copy_active ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedBot(bot);
                        setIsEditing(true);
                        reset(bot);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await deleteEntity('/bots', bot.id.toString());
                        fetchBots();
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