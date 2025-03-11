'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Grid, Typography, Box, Button, Tabs, Tab, Paper, Chip, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/components/PageHeader';
import { authService } from '@/services/api/auth';
import { getTickets, Ticket, TicketsResponse } from '@/services/api/tickets';
import { format } from 'date-fns';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function SupportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push('/login');
      } else {
        fetchTickets();
      }
    };

    checkAuth();
  }, [router, statusFilter, pagination.page]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response: TicketsResponse = await getTickets(
        pagination.page,
        pagination.limit,
        statusFilter || undefined
      );
      setTickets(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: string | null) => {
    setStatusFilter(newValue);
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleCreateTicket = () => {
    router.push('/support/new');
  };

  const handleViewTicket = (id: number) => {
    router.push(`/support/${id}`);
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <PageHeader
          title="Support Tickets"
          subtitle="View and manage your support tickets"
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateTicket}
            >
              New Ticket
            </Button>
          }
        />

        <Paper sx={{ p: 2, mb: 4 }}>
          <Tabs
            value={statusFilter}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab value={null} label="All Tickets" />
            <Tab value="New" label="New" />
            <Tab value="In Progress" label="In Progress" />
            <Tab value="Awaiting User Response" label="Awaiting Response" />
            <Tab value="Resolved" label="Resolved" />
            <Tab value="Closed" label="Closed" />
          </Tabs>
        </Paper>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box textAlign="center" p={4}>
            <Typography color="error">{error}</Typography>
            <Button variant="outlined" onClick={fetchTickets} sx={{ mt: 2 }}>
              Retry
            </Button>
          </Box>
        ) : tickets.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No tickets found
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={3}>
              {statusFilter
                ? `You don't have any ${statusFilter.toLowerCase()} tickets.`
                : "You haven't created any support tickets yet."}
            </Typography>
            <Button variant="contained" onClick={handleCreateTicket}>
              Create Your First Ticket
            </Button>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {tickets.map((ticket) => (
                <Grid item xs={12} key={ticket.id}>
                  <Paper
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: 4 },
                      borderLeft: 5,
                      borderColor: ticket.priority_color,
                    }}
                    onClick={() => handleViewTicket(ticket.id)}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6">
                        {ticket.ticket_number}: {ticket.subject}
                      </Typography>
                      <Chip
                        label={ticket.status_name}
                        size="small"
                        sx={{
                          bgcolor: ticket.status_color,
                          color: 'white',
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                      <Typography variant="body2" color="textSecondary">
                        {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Department: {ticket.department_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Priority: {ticket.priority_name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" noWrap>
                      {ticket.description.length > 150
                        ? `${ticket.description.substring(0, 150)}...`
                        : ticket.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Box display="flex" gap={1}>
                  <Button
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={pagination.page === page ? 'contained' : 'outlined'}
                      onClick={() => handlePageChange(page)}
                      size="small"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    disabled={pagination.page === pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </Container>
    </ErrorBoundary>
  );
} 