import React from 'react';
import { Box, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true }) => {
  const sizes = {
    small: {
      icon: 24,
      text: '1.2rem',
    },
    medium: {
      icon: 32,
      text: '1.5rem',
    },
    large: {
      icon: 48,
      text: '2rem',
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: 'primary.main',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: sizes[size].icon,
          height: sizes[size].icon,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #1a237e 0%, #00838f 100%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <TrendingUpIcon
          sx={{
            color: '#ffffff',
            fontSize: sizes[size].icon * 0.7,
          }}
        />
      </Box>
      {showText && (
        <Typography
          variant="h6"
          sx={{
            fontSize: sizes[size].text,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #1a237e 0%, #00838f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          Trader Nickel
        </Typography>
      )}
    </Box>
  );
};

export default Logo; 