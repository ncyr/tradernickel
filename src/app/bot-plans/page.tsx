'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import { botPlanService, BotPlan } from '@/services/api/botPlans';
import { authService } from '@/services/api/auth';
import { formatDate } from '@/utils/formatters';

const BotPlansPage = () => {
  const router = useRouter();
  const [botPlans, setBotPlans] = useState<BotPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBotPlans = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/bot-plans', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setBotPlans(data);
      } catch (err: any) {
        console.error('Error loading bot plans:', err);
        setError(err.message || 'Failed to load bot plans');
      } finally {
        setLoading(false);
      }
    };

    loadBotPlans();
  }, [router]);

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
        title="Bot Plans"
        subtitle="Manage the trading plans assigned to your bots"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => router.push('/bot-plans/new')}
          >
            Create Bot Plan
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          {botPlans.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No bot plans found
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
                onClick={() => router.push('/bot-plans/new')}
              >
                Assign Your First Plan
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bot</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {botPlans.map((botPlan) => (
                    <TableRow key={botPlan.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {botPlan.bot_name || `Bot #${botPlan.bot_id}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          {botPlan.plan_name || `Plan #${botPlan.plan_id}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {botPlan.owner_username || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(botPlan.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => router.push(`/bot-plans/${botPlan.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BotPlansPage; 