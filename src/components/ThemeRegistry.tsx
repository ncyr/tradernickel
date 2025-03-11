'use client';

import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';

interface ThemeRegistryProps {
  children: React.ReactNode;
}

const ThemeRegistry: React.FC<ThemeRegistryProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default ThemeRegistry; 