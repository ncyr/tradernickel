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
import { botService, Bot } from '@/services/api/bots';

const BotsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bots, setBots] = useState<Bot[]>([]);

  const loadBots = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const data = await botService.getBots();
      setBots(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load bots');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBots();
  }, [router]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBots();
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
        title="Trading Bots"
        description="Manage your automated trading bots"
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
              onClick={() => router.push('/bots/new')}
            >
              New Bot
            </Button>
          </>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {bots.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Bots Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You haven't created any trading bots yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/bots/new')}
            >
              Create Your First Bot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Broker</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Region</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bots.map((bot) => (
                <TableRow
                  key={bot.id}
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                    cursor: 'pointer',
                  }}
                  onClick={() => router.push(`/bots/${bot.id}`)}
                >
                  <TableCell>
                    <Typography variant="body1" fontWeight={500}>
                      {bot.name}
                    </Typography>
                    {bot.description && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {bot.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{bot.broker_name || `Broker #${bot.broker_id}`}</TableCell>
                  <TableCell>{bot.region}</TableCell>
                  <TableCell>
                    <Chip
                      icon={bot.active ? <CheckIcon /> : <CloseIcon />}
                      label={bot.active ? 'Active' : 'Inactive'}
                      color={bot.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Bot">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/bots/${bot.id}`);
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

export default BotsPage; 