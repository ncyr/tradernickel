'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import { brokerService, Broker } from '@/services/api/brokers';
import { authService } from '@/services/api/auth';
import { formatDate } from '@/utils/formatters';

const BrokersPage = () => {
  const router = useRouter();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadBrokers = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setIsAdmin(user.role === 'admin');

        if (user.role === 'admin') {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Not authenticated');
          }

          const response = await fetch('/api/brokers', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to load brokers');
          }
          const data = await response.json();
          setBrokers(data);
        } else {
          setError('Only administrators can access broker management');
        }
      } catch (err: any) {
        console.error('Error loading brokers:', err);
        setError(err.message || 'Failed to load brokers');
      } finally {
        setLoading(false);
      }
    };

    loadBrokers();
  }, [router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !isAdmin) {
    return (
      <Box sx={{ py: 4 }}>
        <PageHeader
          title="Broker Management"
          subtitle="Manage trading brokers"
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Broker Management"
        subtitle="Manage trading brokers"
        action={
          isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => router.push('/brokers/new')}
            >
              Add Broker
            </Button>
          )
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          {brokers.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No brokers found
              </Typography>
              {isAdmin && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                  component={Link}
                  href="/brokers/new"
                >
                  Add Your First Broker
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Demo URL</TableCell>
                    <TableCell>Production URL</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {brokers.map((broker) => (
                    <TableRow key={broker.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {broker.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={broker.active ? 'Active' : 'Inactive'}
                          color={broker.active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {broker.demo_url}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {broker.prod_url}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {broker.created_at ? formatDate(broker.created_at) : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          component={Link}
                          href={`/brokers/${broker.id}`}
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

export default BrokersPage; 