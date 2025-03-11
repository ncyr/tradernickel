import { createTheme, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Common palette values
const commonPalette = {
  primary: {
    main: '#2563eb', // Bright blue - represents trust and professionalism
    light: '#60a5fa',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#10b981', // Emerald green - represents growth and success
    light: '#34d399',
    dark: '#059669',
    contrastText: '#ffffff',
  },
  success: {
    main: '#059669',
    light: '#34d399',
    dark: '#047857',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  error: {
    main: '#dc2626',
    light: '#ef4444',
    dark: '#b91c1c',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
  },
};

// Typography configuration
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 600,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
  },
  body1: {
    fontSize: '1rem',
  },
  body2: {
    fontSize: '0.875rem',
  },
};

// Component overrides
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 500,
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
};

// Create theme based on mode
export const createAppTheme = (mode: PaletteMode): Theme => {
  const isLight = mode === 'light';
  
  return createTheme({
    palette: {
      mode,
      ...commonPalette,
      background: {
        default: isLight ? '#f8fafc' : '#0f172a', // Light: Slate 50, Dark: Slate 900
        paper: isLight ? '#ffffff' : '#1e293b', // Light: White, Dark: Slate 800
      },
      text: {
        primary: isLight ? '#1e293b' : '#f1f5f9', // Light: Slate 800, Dark: Slate 100
        secondary: isLight ? '#64748b' : '#94a3b8', // Light: Slate 500, Dark: Slate 400
      },
    },
    typography,
    components,
    shape: {
      borderRadius: 8,
    },
  });
};

// Default theme (light mode)
const theme = createAppTheme('light');
export default theme; 