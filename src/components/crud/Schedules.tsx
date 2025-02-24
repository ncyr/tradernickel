'use client'

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Schedule } from '@/types/models';
import { getEntities, createEntity, updateEntity, deleteEntity } from '@/services/api';

export const Schedules: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Schedule>();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const data = await getEntities('/schedules');
    setSchedules(data);
  };

  const onSubmit = async (data: Schedule) => {
    try {
      if (isEditing && selectedSchedule) {
        await updateEntity('/schedules', selectedSchedule.id.toString(), data);
      } else {
        await createEntity('/schedules', data);
      }
      fetchSchedules();
      setIsEditing(false);
      setSelectedSchedule(null);
      reset();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Schedules Management</h1>
      
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

        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Start At
            </label>
            <input
              type="datetime-local"
              {...register('start_at', { required: 'Start time is required' })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {errors.start_at && <p className="text-red-500 text-xs italic">{errors.start_at.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              End At
            </label>
            <input
              type="datetime-local"
              {...register('end_at', { required: 'End time is required' })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {errors.end_at && <p className="text-red-500 text-xs italic">{errors.end_at.message}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Weekday (0-6, Sunday = 0)
          </label>
          <input
            type="number"
            min="0"
            max="6"
            {...register('weekday', { 
              required: 'Weekday is required',
              min: { value: 0, message: 'Weekday must be between 0 and 6' },
              max: { value: 6, message: 'Weekday must be between 0 and 6' }
            })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.weekday && <p className="text-red-500 text-xs italic">{errors.weekday.message}</p>}
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isEditing ? 'Update' : 'Create'} Schedule
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Schedules List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bot Plan ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weekday</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.map((schedule: Schedule) => (
                <tr key={schedule.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{schedule.bot_plan_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(schedule.start_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(schedule.end_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{schedule.weekday}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setIsEditing(true);
                        reset(schedule);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await deleteEntity('/schedules', schedule.id.toString());
                        fetchSchedules();
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