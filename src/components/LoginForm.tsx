'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService, LoginDTO } from '@/services/api/auth';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDTO>();

  useEffect(() => {
    if (searchParams?.get('registered')) {
      setMessage('Registration successful! Please login.');
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginDTO) => {
    try {
      const response = await authService.login(data);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-96">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        
        {message && <div className="text-green-500">{message}</div>}
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

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>

        <p className="text-center text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-500 hover:text-blue-600">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
} 