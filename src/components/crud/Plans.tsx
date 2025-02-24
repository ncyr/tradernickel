import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { planService } from '@/services/api/plans';
import type { Plan, CreatePlanDTO, UpdatePlanDTO } from '@/types/plan';

export const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreatePlanDTO>();

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const data = await planService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const onSubmit = async (data: CreatePlanDTO) => {
    try {
      setIsLoading(true);
      if (isEditing && selectedPlan) {
        await planService.updatePlan(selectedPlan.id, data);
      } else {
        await planService.createPlan(data);
      }
      fetchPlans();
      setIsEditing(false);
      setSelectedPlan(null);
      reset();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await planService.deletePlan(id);
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Plans Management</h1>
      
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
            Symbol
          </label>
          <input
            {...register('symbol', { required: 'Symbol is required', maxLength: 25 })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.symbol && <p className="text-red-500 text-xs italic">{errors.symbol.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Reverse Position Threshold
          </label>
          <input
            type="number"
            step="0.01"
            {...register('reverse_position_threshold', { required: 'Threshold is required' })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.reverse_position_threshold && <p className="text-red-500 text-xs italic">{errors.reverse_position_threshold.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Trailing Threshold Percentage
          </label>
          <input
            type="number"
            step="0.01"
            {...register('trailing_threshold_percentage', { required: 'Trailing threshold is required' })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.trailing_threshold_percentage && <p className="text-red-500 text-xs italic">{errors.trailing_threshold_percentage.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Only Action
          </label>
          <input
            {...register('only_action', { required: 'Action is required', maxLength: 50 })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.only_action && <p className="text-red-500 text-xs italic">{errors.only_action.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Expiration
          </label>
          <input
            type="datetime-local"
            {...register('expiration', { required: 'Expiration is required' })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.expiration && <p className="text-red-500 text-xs italic">{errors.expiration.message}</p>}
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
              Cancel Trade in Progress
            </label>
            <input
              type="checkbox"
              {...register('cancel_trade_in_progress')}
              className="mr-2 leading-tight"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isEditing ? 'Update' : 'Create'} Plan
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Plans List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Only Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.map((plan: Plan) => (
                <tr key={plan.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.only_action}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.active ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(plan.expiration).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsEditing(true);
                        reset(plan);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await handleDelete(plan.id);
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