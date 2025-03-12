'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/api/auth';
import { useUser } from './UserProvider';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Divider,
  Tooltip,
  Switch,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  SmartToy as BotIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Support as SupportIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  DarkMode as DarkModeIcon,
  Key as KeyIcon,
  ShowChart as ChartIcon,
  Business as BrokerIcon,
} from '@mui/icons-material';

interface NavigationProps {
  variant: 'sidebar' | 'user-menu';
}

const Navigation = ({ variant }: NavigationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const muiTheme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { user, setUser, loading } = useUser();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  // Add console logs to help debug navigation issues
  const handleNavigation = (href: string | undefined) => {
    if (!href) return;
    console.log(`Navigation: Navigating to ${href}`);
    router.push(href);
  };

  if (loading || !user) {
    return null;
  }

  const navigationItems = [
    { path: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/bots', icon: <BotIcon />, label: 'Bots' },
    { path: '/schedules', icon: <ScheduleIcon />, label: 'Schedules' },
    { path: '/charts', icon: <ChartIcon />, label: 'Charts' },
    { path: '/brokers', icon: <BrokerIcon />, label: 'Brokers' },
    { path: '/user-brokers', icon: <KeyIcon />, label: 'Broker Integrations' },
    { path: '/plans', icon: <KeyIcon />, label: 'Plans' },
    { path: '/bot-plans', icon: <KeyIcon />, label: 'Bot Plans' },
    { path: '/test-token', icon: <KeyIcon />, label: 'Test Token' },
    { path: '/settings', icon: <SettingsIcon />, label: 'Settings' },
    { path: '/support', icon: <SupportIcon />, label: 'Support' },
  ];

  const userMenuItems = [
    { href: '/profile', label: 'Profile', icon: <AccountIcon /> },
    {
      component: 'div',
      label: 'Dark Mode',
      icon: <DarkModeIcon />,
      action: (
        <Switch
          checked={mode === 'dark'}
          onChange={toggleTheme}
          color="default"
          size="small"
        />
      ),
    },
    { onClick: handleLogout, label: 'Logout', icon: <LogoutIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ 
      width: 240, 
      color: 'text.primary',
      bgcolor: 'background.paper',
      height: '100%',
      borderRight: 1,
      borderColor: 'divider',
      ...(variant === 'sidebar' && {
        display: { xs: 'none', md: 'block' },
      })
    }}>
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              href={item.path}
              selected={pathname === item.path}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (variant === 'user-menu') {
    return (
      <>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleUserMenuOpen}
            size="small"
            sx={{ color: 'text.primary' }}
            aria-label="account"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {(user.name || user.username || 'U').charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>

        {/* User menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          onClick={handleUserMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              },
            },
          }}
        >
          {userMenuItems.map((item) => (
            <MenuItem
              key={item.label}
              component={item.component || (item.href ? Link : 'button')}
              href={item.href}
              onClick={item.href ? () => handleNavigation(item.href) : item.onClick}
              sx={{
                gap: 1.5,
                minWidth: 150,
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: 20,
                  color: 'primary.main',
                },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {item.icon}
                <Typography>{item.label}</Typography>
              </Box>
              {item.action}
            </MenuItem>
          ))}
        </Menu>

        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          anchor="left"
          open={isMobile && mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              backgroundColor: 'background.paper',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'text.primary' }}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
          <Divider />
          {drawerContent}
        </Drawer>
      </>
    );
  }

  return drawerContent;
};

export default Navigation; 