'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, authService } from '@/services/api/auth';
import AuthProvider from './AuthProvider';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  SmartToy as BotIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      authService.initializeAuth();
    }
  }, []);

  const handleLogout = async () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { href: '/bots', label: 'Bots', icon: <BotIcon /> },
    { href: '/plans', label: 'Plans', icon: <SettingsIcon /> },
    { href: '/bot-plans', label: 'Bot Plans', icon: <BotIcon /> },
    { href: '/schedules', label: 'Schedules', icon: <ScheduleIcon /> },
    { href: '/brokers', label: 'Brokers', icon: <SettingsIcon /> },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (isMobile) {
    return (
      <>
        <IconButton
          edge="end"
          color="primary"
          aria-label="menu"
          onClick={handleMenuOpen}
          sx={{ ml: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.href}
              component={Link}
              href={item.href}
              onClick={handleMenuClose}
              selected={pathname === item.href}
              sx={{
                gap: 1,
                minWidth: 200,
                color: pathname === item.href ? 'primary.main' : 'text.primary',
              }}
            >
              {item.icon}
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {menuItems.map((item) => (
          <Button
            key={item.href}
            component={Link}
            href={item.href}
            variant={pathname === item.href ? 'contained' : 'text'}
            color="primary"
            startIcon={item.icon}
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1,
              '&:not(:hover)': {
                backgroundColor: pathname === item.href ? 'primary.main' : 'transparent',
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>
    </AuthProvider>
  );
};

export default Navigation; 