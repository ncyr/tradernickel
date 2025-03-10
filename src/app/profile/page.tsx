'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { authService, UpdateUserDTO, User } from '@/services/api/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateUserDTO>();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    reset(userData);
    authService.initializeAuth();
  }, [reset, router]);

  const onSubmit = async (data: UpdateUserDTO) => {
    if (!user) return;

    try {
      const updatedUser = await authService.updateUser(user.id, data);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile updated successfully');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
      setSuccess('');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        
        {success && <div className="text-green-500">{success}</div>}
        {error && <div className="text-red-500">{error}</div>}
        
        <div>
          <label className="block mb-1">Username</label>
          <input
            {...register('username')}
            className="w-full p-2 border rounded"
          />
          {errors.username && (
            <span className="text-red-500">{errors.username.message}</span>
          )}
        </div>

        <div>
          <label className="block mb-1">New Password (optional)</label>
          <input
            type="password"
            {...register('password')}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Name</label>
          <input
            {...register('name')}
            className="w-full p-2 border rounded"
          />
          {errors.name && (
            <span className="text-red-500">{errors.name.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
} 