"use client";

import { useEffect, useState } from 'react';
import { authService, User } from '@/services/api/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Account</h1>
        <p>Please log in to view your account.</p>
        <Link href="/login" className="text-blue-500 hover:text-blue-700">
          Login
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Account</h1>
      
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Profile Information</h2>
        <div className="mb-4">
          <p className="text-gray-600">Username</p>
          <p className="font-medium">{user.username}</p>
        </div>
        <div className="mb-4">
          <p className="text-gray-600">Name</p>
          <p className="font-medium">{user.name}</p>
        </div>
        <div className="mb-4">
          <p className="text-gray-600">Role</p>
          <p className="font-medium capitalize">{user.role}</p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Account Management</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/account/profile" className="text-blue-500 hover:text-blue-700">
              Edit Profile
            </Link>
          </li>
          <li>
            <Link href="/account/password" className="text-blue-500 hover:text-blue-700">
              Change Password
            </Link>
          </li>
          <li>
            <Link href="/account/api-keys" className="text-blue-500 hover:text-blue-700">
              Manage API Keys
            </Link>
          </li>
        </ul>
      </div>

      <div className="bg-white shadow-md rounded p-6">
        <h2 className="text-xl font-bold mb-4">Security</h2>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 