'use client';

import { useEffect } from 'react';
import { authService } from '@/services/api/auth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cleanup = authService.setupTokenRenewal();
    return () => {
      cleanup();
    };
  }, []);

  return <>{children}</>;
} 