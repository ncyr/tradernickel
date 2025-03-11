'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authService } from '@/services/api/auth';

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          console.log('Found stored user and token');
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Initialize auth service with token
          const initialized = await authService.initializeAuth();
          console.log('Auth service initialized:', initialized);
          
          if (!initialized) {
            console.log('Auth initialization failed, clearing user');
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('expiresAt');
          }
        } else {
          console.log('No stored user or token found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setUser(null);
        // Clear all auth data on error
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('expiresAt');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider; 