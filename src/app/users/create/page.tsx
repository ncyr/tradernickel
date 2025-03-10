'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { authService, CreateUserDTO } from '@/services/api/auth';

export default function CreateUserPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserDTO>();

  const onSubmit = async (data: CreateUserDTO) => {
    try {
      await authService.createUser(data);
      router.push('/users');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-6">Create New User</h1>
        
        {error && <div className="text-red-500">{error}</div>}
        
        <div>
          <label className="block mb-1">Username</label>
          <input
            {...register('username', { required: 'Username is required' })}
            className="w-full p-2 border rounded"
          />
          {errors.username && (
            <span className="text-red-500">{errors.username.message}</span>
          )}
        </div>

        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="w-full p-2 border rounded"
          />
          {errors.password && (
            <span className="text-red-500">{errors.password.message}</span>
          )}
        </div>

        <div>
          <label className="block mb-1">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full p-2 border rounded"
          />
          {errors.name && (
            <span className="text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div>
          <label className="block mb-1">Role</label>
          <select
            {...register('role')}
            className="w-full p-2 border rounded"
          >
            <option value="user">User</option>
            <option value="premium">Premium</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('active')}
            />
            Active
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create User
        </button>
      </form>
    </div>
  );
} 