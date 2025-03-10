'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import { authService } from '@/services/api/auth';
import { planService, Plan } from '@/services/api/plans';

const PlansPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  const loadPlans = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const data = await planService.getPlans();
      setPlans(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load plans');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [router]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPlans();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Trading Plans"
        description="Manage your trading strategies and configurations"
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/plans/new')}
            >
              New Plan
            </Button>
          </>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {plans.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Plans Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You haven't created any trading plans yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/plans/new')}
            >
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Symbol</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Direction</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plans.map((plan) => (
                <TableRow
                  key={plan.id}
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                    cursor: 'pointer',
                  }}
                  onClick={() => router.push(`/plans/${plan.id}`)}
                >
                  <TableCell>
                    <Typography variant="body1" fontWeight={500}>
                      {plan.name}
                    </Typography>
                    {plan.description && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {plan.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{plan.symbol}</TableCell>
                  <TableCell>
                    <Chip
                      icon={plan.active ? <CheckIcon /> : <CloseIcon />}
                      label={plan.active ? 'Active' : 'Inactive'}
                      color={plan.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={plan.trade_same_direction ? 'Same Direction' : 'Opposite Direction'}
                      color={plan.trade_same_direction ? 'info' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(plan.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Plan">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/plans/${plan.id}`);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default PlansPage; 