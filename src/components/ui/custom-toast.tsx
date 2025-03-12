'use client';

import React, { createContext, useContext } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ToastActionElement } from '@/components/ui/toast';

// Context for the custom toast provider
interface CustomToastContextType {
  showToast: (props: {
    title?: string;
    description: string;
    variant?: 'default' | 'destructive';
    action?: ToastActionElement;
    duration?: number;
  }) => void;
  showSuccessToast: (message: string, duration?: number) => void;
  showErrorToast: (message: string, duration?: number) => void;
  showWarningToast: (message: string, duration?: number) => void;
}

const CustomToastContext = createContext<CustomToastContextType | undefined>(undefined);

export function CustomToastProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  const showToast = ({
    title,
    description,
    variant = 'default',
    action,
    duration = 5000,
  }: {
    title?: string;
    description: string;
    variant?: 'default' | 'destructive';
    action?: ToastActionElement;
    duration?: number;
  }) => {
    toast({
      title,
      description,
      variant,
      action,
      duration,
    });
  };

  const showSuccessToast = (message: string, duration = 5000) => {
    toast({
      title: 'Success',
      description: message,
      duration,
    });
  };

  const showErrorToast = (message: string, duration = 5000) => {
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
      duration,
    });
  };

  const showWarningToast = (message: string, duration = 5000) => {
    toast({
      title: 'Warning',
      description: message,
      duration,
    });
  };

  return (
    <CustomToastContext.Provider
      value={{
        showToast,
        showSuccessToast,
        showErrorToast,
        showWarningToast,
      }}
    >
      {children}
    </CustomToastContext.Provider>
  );
}

export function useCustomToast() {
  const context = useContext(CustomToastContext);
  if (context === undefined) {
    throw new Error('useCustomToast must be used within a CustomToastProvider');
  }
  return context;
} 