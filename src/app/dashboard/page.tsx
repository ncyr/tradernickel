'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Grid,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import DataCard from '@/components/DataCard';
import { authService } from '@/services/api/auth';
import api from '@/services/api/index';

// Add type definitions for API responses
interface Bot {
  id: number;
  name: string;
  active: boolean;
  [key: string]: any;
}

interface Schedule {
  id: number;
  name: string;
  active: boolean;
  [key: string]: any;
}

interface Plan {
  id: number;
  name: string;
  [key: string]: any;
}

const DashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeBots: 0,
    totalTrades: 0,
    profitToday: 0,
    profitTotal: 0,
    activeSchedules: 0,
    upcomingSchedules: 0,
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're authenticated before making requests
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setError('Authentication required. Please log in again.');
        router.push('/login');
        return;
      }

      // Set default values in case API calls fail
      let activeBots = 0;
      let activeSchedules = 0;
      let upcomingSchedules = 0;
      let tradeStats = {
        total_trades: 0,
        profit_today: 0,
        profit_total: 0,
      };

      // Wrap each API call in try/catch to prevent one failure from stopping everything
      try {
        console.log('Fetching bots data...');
        const botsResponse = await fetch('/api/bots', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000)
        });
        if (!botsResponse.ok) {
          throw new Error('Failed to fetch bots');
        }
        const bots = await botsResponse.json();
        activeBots = bots.filter((bot: Bot) => bot.active).length;
        console.log(`Fetched ${bots.length} bots, ${activeBots} active`);
      } catch (botErr) {
        console.error('Error fetching bots:', botErr);
        // Continue with other requests
      }

      try {
        console.log('Fetching schedules data...');
        const schedulesResponse = await fetch('/api/schedules', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000)
        });
        if (!schedulesResponse.ok) {
          throw new Error('Failed to fetch schedules');
        }
        const schedules = await schedulesResponse.json();
        activeSchedules = schedules.filter((schedule: Schedule) => schedule.active).length;
        upcomingSchedules = schedules.filter((schedule: Schedule) => !schedule.active).length;
        console.log(`Fetched ${schedules.length} schedules, ${activeSchedules} active, ${upcomingSchedules} upcoming`);
      } catch (scheduleErr) {
        console.error('Error fetching schedules:', scheduleErr);
        // Continue with other requests
      }

      try {
        console.log('Fetching plans data...');
        const plansResponse = await fetch('/api/plans', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000)
        });
        if (!plansResponse.ok) {
          throw new Error('Failed to fetch plans');
        }
        const plans = await plansResponse.json();
        console.log(`Fetched ${plans.length} plans`);
      } catch (planErr) {
        console.error('Error fetching plans:', planErr);
        // Continue with other requests
      }

      // Fetch trade stats
      try {
        console.log('Fetching trade stats...');
        const tradeStatsResponse = await fetch('/api/trades/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000)
        });
        if (!tradeStatsResponse.ok) {
          throw new Error('Failed to fetch trade stats');
        }
        tradeStats = await tradeStatsResponse.json();
        console.log('Trade stats:', tradeStats);
      } catch (statsErr) {
        console.error('Error fetching trade stats:', statsErr);
        // Continue with other requests
      }

      // Update stats with real data
      setStats({
        activeBots,
        totalTrades: tradeStats.total_trades || 0,
        profitToday: tradeStats.profit_today || 0,
        profitTotal: tradeStats.profit_total || 0,
        activeSchedules,
        upcomingSchedules,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        console.log('Dashboard: Checking authentication');
        
        // Check both cookie and localStorage
        const hasCookie = document.cookie.includes('token=');
        const token = localStorage.getItem('token');
        
        console.log('Dashboard: Auth state:', {
          hasCookie,
          hasLocalStorage: !!token
        });
        
        if (!hasCookie || !token) {
          console.log('Dashboard: Missing auth data, redirecting to login');
          window.location.href = '/login';
          return;
        }
        
        // Then verify with the auth service
        try {
          const user = await authService.getCurrentUser();
          console.log('Dashboard: Current user:', user);
          
          if (!user) {
            console.log('Dashboard: No user found, redirecting to login');
            window.location.href = '/login';
            return;
          }
        } catch (userErr) {
          console.error('Dashboard: Error getting current user:', userErr);
          // Continue loading dashboard even if getCurrentUser fails
        }
        
        if (isMounted) {
          console.log('Dashboard: User authenticated, loading dashboard data');
          await fetchDashboardData().catch(err => {
            console.error('Dashboard: Error in fetchDashboardData:', err);
            if (isMounted) {
              setError('Failed to load some dashboard data. Showing partial results.');
              setLoading(false);
            }
          });
        }
      } catch (err) {
        console.error('Dashboard: Error in authentication check:', err);
        if (isMounted) {
          setError('Authentication error. Please log in again.');
          // Don't redirect immediately, allow user to see the error
          setLoading(false);
        }
      }
    };

    // Set a timeout to ensure we don't hang indefinitely
    const authTimeout = setTimeout(() => {
      if (loading && isMounted) {
        console.log('Dashboard: Authentication check timed out');
        setLoading(false);
        setError('Authentication check timed out. Please refresh the page.');
      }
    }, 10000);

    checkAuth();
    
    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
    };
  }, []);

  const handleRefresh = async () => {
    try {
      await fetchDashboardData();
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError('Failed to refresh data. Please try again.');
    }
  };

  const renderErrorState = () => (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <Alert 
        severity="error" 
        sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Unable to load dashboard data. Please check your connection and try again.
      </Typography>
    </Box>
  );

  const renderLoadingState = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
      <CircularProgress size={60} thickness={4} sx={{ mb: 4 }} />
      <Typography variant="h6">Loading your dashboard...</Typography>
    </Box>
  );

  const renderEmptyState = (type: 'bots' | 'schedules') => (
    <Box sx={{ textAlign: 'center', p: 4, border: '1px dashed #ccc', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        No {type === 'bots' ? 'trading bots' : 'schedules'} found
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        {type === 'bots'
          ? "You haven't created any trading bots yet."
          : "You don't have any active trading schedules."}
      </Typography>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        component={Link}
        href={type === 'bots' ? '/bots/new' : '/schedules/new'}
      >
        Create {type === 'bots' ? 'a Bot' : 'a Schedule'}
      </Button>
    </Box>
  );

  if (loading) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Your trading performance at a glance" />
        {renderLoadingState()}
      </>
    );
  }

  return (
    <>
      <PageHeader 
        title="Dashboard" 
        subtitle="Your trading performance at a glance"
        action={
          <Button
            aria-label="Refresh"
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            variant="outlined"
            disabled={loading}
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              ml: { xs: 0, sm: 2 }
            }}
          >
            Refresh
          </Button>
        }
      />

      {/* Mobile refresh button */}
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'flex-end', mb: 2 }}>
        <Button
          aria-label="Refresh"
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
          variant="outlined"
          disabled={loading}
          size="small"
        >
          Refresh
        </Button>
      </Box>

      <div className="dashboard-content">
        {error ? (
          renderErrorState()
        ) : (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <DataCard
                title="Active Bots"
                value={stats.activeBots}
                linkText="View Bots"
                linkHref="/bots"
                icon="🤖"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DataCard
                title="Today's Trades"
                value={stats.totalTrades}
                linkText="View Trades"
                linkHref="/trading/logs"
                icon="📊"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DataCard
                title="Profit Today"
                value={`$${stats.profitToday.toFixed(2)}`}
                valueColor={stats.profitToday >= 0 ? 'success.main' : 'error.main'}
                linkText="Performance"
                linkHref="/trading/performance"
                icon="💰"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DataCard
                title="Active Schedules"
                value={stats.activeSchedules}
                linkText="View Schedules"
                linkHref="/schedules"
                icon="🕒"
              />
            </Grid>

            {stats.activeBots === 0 && (
              <Grid item xs={12} md={6}>
                {renderEmptyState('bots')}
              </Grid>
            )}

            {stats.activeSchedules === 0 && (
              <Grid item xs={12} md={6}>
                {renderEmptyState('schedules')}
              </Grid>
            )}
          </Grid>
        )}
      </div>
    </>
  );
};

export default DashboardPage; 