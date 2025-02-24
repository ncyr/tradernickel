import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Broker } from '@/types/models';
import { getEntities, createEntity, updateEntity, deleteEntity } from '@/services/api';

export const Brokers: React.FC = () => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Broker>();

  useEffect(() => {
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    const data = await getEntities('/brokers');
    setBrokers(data);
  };

  const onSubmit = async (data: Broker) => {
    try {
      if (isEditing && selectedBroker) {
        await updateEntity('/brokers', selectedBroker.id.toString(), data);
      } else {
        await createEntity('/brokers', data);
      }
      fetchBrokers();
      setIsEditing(false);
      setSelectedBroker(null);
      reset();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Brokers Management</h1>
      
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
            Demo URL
          </label>
          <input
            type="url"
            {...register('demo_url', { required: 'Demo URL is required', maxLength: 200 })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.demo_url && <p className="text-red-500 text-xs italic">{errors.demo_url.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Production URL
          </label>
          <input
            type="url"
            {...register('prod_url', { required: 'Production URL is required', maxLength: 200 })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.prod_url && <p className="text-red-500 text-xs italic">{errors.prod_url.message}</p>}
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

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Active
          </label>
          <input
            type="checkbox"
            {...register('active')}
            className="mr-2 leading-tight"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isEditing ? 'Update' : 'Create'} Broker
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Brokers List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demo URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prod URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {brokers.map((broker: Broker) => (
                <tr key={broker.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{broker.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a href={broker.demo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                      {broker.demo_url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a href={broker.prod_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                      {broker.prod_url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{broker.active ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedBroker(broker);
                        setIsEditing(true);
                        reset(broker);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await deleteEntity('/brokers', broker.id.toString());
                        fetchBrokers();
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