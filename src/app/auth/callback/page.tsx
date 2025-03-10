'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api/auth';

export default function AuthCallback() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Only access window.location after component mounts
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          await authService.handleSocialCallback(params);
          router.push('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/login?error=Authentication failed');
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [router]);

  // Show loading spinner while handling callback
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return null;
} 