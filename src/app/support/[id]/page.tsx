'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AttachFile as AttachmentIcon,
  Send as SendIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import { authService } from '@/services/api/auth';
import {
  getTicketById,
  addResponse,
  updateTicket,
  getStatuses,
  getPriorities,
  getStaff,
  TicketDetails,
  TicketStatus,
  TicketPriority,
} from '@/services/api/tickets';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SelectChangeEvent } from '@mui/material';

interface StaffMember {
  id: number;
  username: string;
  name: string;
  role: string;
  primary_department_id: number;
  primary_department_name: string;
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push('/login');
      } else {
        setCurrentUser(user);
        fetchTicketData();
      }
    };

    checkAuth();
  }, [router, ticketId]);

  const fetchTicketData = async () => {
    try {
      setIsLoading(true);
      const [ticketData, statusesData, prioritiesData] = await Promise.all([
        getTicketById(parseInt(ticketId)),
        getStatuses(),
        getPriorities(),
      ]);
      
      setTicketDetails(ticketData);
      setStatuses(statusesData);
      setPriorities(prioritiesData);
      
      // If user is staff, fetch staff members for assignment
      const user = await authService.getCurrentUser();
      if (user?.role === 'admin') {
        const staffData = await getStaff();
        setStaffMembers(staffData);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching ticket data:', err);
      setError('Failed to load ticket details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewResponse(e.target.value);
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newResponse.trim()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await addResponse(parseInt(ticketId), {
        message: newResponse,
        is_internal: isInternalNote,
      });
      
      // Refresh ticket data
      await fetchTicketData();
      
      // Clear form
      setNewResponse('');
      setIsInternalNote(false);
    } catch (err) {
      console.error('Error adding response:', err);
      setError('Failed to add response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (event: SelectChangeEvent<string>) => {
    try {
      if (!ticketDetails) return;
      
      const status = statuses.find(s => s.name === event.target.value);
      if (status) {
        await updateTicket(ticketDetails.ticket.id, { status_id: status.id });
        // Refresh ticket details
        const updatedTicket = await getTicketById(ticketDetails.ticket.id);
        setTicketDetails(updatedTicket);
      }
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const handlePriorityChange = async (event: SelectChangeEvent<string>) => {
    try {
      const priorityName = event.target.value;
      const priority = priorities.find(p => p.name === priorityName);
      if (priority) {
        await updateTicket(parseInt(ticketId), { priority_id: priority.id });
        await fetchTicketData();
      }
    } catch (err) {
      console.error('Error updating priority:', err);
      setError('Failed to update priority. Please try again.');
    }
  };

  const handleAssigneeChange = async (event: SelectChangeEvent<string>) => {
    try {
      const assigneeUsername = event.target.value;
      const staff = staffMembers.find(s => s.username === assigneeUsername);
      if (staff) {
        await updateTicket(parseInt(ticketId), { assignee_id: staff.id });
        await fetchTicketData();
      }
    } catch (err) {
      console.error('Error updating assignee:', err);
      setError('Failed to update assignee. Please try again.');
    }
  };

  const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'support';

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button variant="outlined" size="small" onClick={fetchTicketData} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        ) : ticketDetails ? (
          <>
            <PageHeader
              title={`${ticketDetails.ticket.ticket_number}: ${ticketDetails.ticket.subject}`}
              subtitle={`Created on ${format(new Date(ticketDetails.ticket.created_at), 'MMM dd, yyyy')}`}
              action={
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => router.back()}
                >
                  Back
                </Button>
              }
            />

            <Grid container spacing={3}>
              {/* Ticket details */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Ticket Information</Typography>
                    <Chip
                      label={ticketDetails.ticket.status_name}
                      size="small"
                      sx={{
                        bgcolor: ticketDetails.ticket.status_color,
                        color: 'white',
                      }}
                    />
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    {ticketDetails.ticket.description}
                  </Typography>
                  
                  <Box display="flex" gap={2} mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      Department: {ticketDetails.ticket.department_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Priority: {ticketDetails.ticket.priority_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Created by: {ticketDetails.ticket.creator_name}
                    </Typography>
                  </Box>
                </Paper>

                {/* Ticket responses */}
                <Typography variant="h6" gutterBottom>
                  Conversation
                </Typography>
                
                {ticketDetails.responses.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                      No responses yet. Be the first to respond.
                    </Typography>
                  </Paper>
                ) : (
                  ticketDetails.responses.map((response) => (
                    <Card 
                      key={response.id} 
                      sx={{ 
                        mb: 2,
                        borderLeft: response.is_internal ? '4px solid #9c27b0' : 'none',
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ bgcolor: response.user_id === currentUser?.id ? 'primary.main' : 'secondary.main' }}>
                              {response.name.charAt(0)}
                            </Avatar>
                            <Typography variant="subtitle1">
                              {response.name}
                              {response.is_internal && (
                                <Tooltip title="Internal Note">
                                  <LockIcon fontSize="small" color="secondary" sx={{ ml: 1 }} />
                                </Tooltip>
                              )}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {format(new Date(response.created_at), 'MMM dd, yyyy h:mm a')}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                          {response.message}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                )}

                {/* Add response form */}
                <Paper sx={{ p: 3, mt: 3 }}>
                  <form onSubmit={handleSubmitResponse}>
                    <Typography variant="h6" gutterBottom>
                      Add Response
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={newResponse}
                      onChange={handleResponseChange}
                      placeholder="Type your response here..."
                      variant="outlined"
                      disabled={isSubmitting}
                    />
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Box>
                        {isStaff && (
                          <Button
                            type="button"
                            color={isInternalNote ? 'secondary' : 'inherit'}
                            startIcon={<LockIcon />}
                            onClick={() => setIsInternalNote(!isInternalNote)}
                            sx={{ mr: 1 }}
                          >
                            {isInternalNote ? 'Internal Note' : 'Make Internal Note'}
                          </Button>
                        )}
                        
                        <IconButton disabled>
                          <AttachmentIcon />
                        </IconButton>
                      </Box>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting || !newResponse.trim()}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Response'}
                      </Button>
                    </Box>
                  </form>
                </Paper>
              </Grid>

              {/* Ticket management */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Ticket Management
                  </Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      value={ticketDetails.ticket.status_name}
                      onChange={handleStatusChange}
                      label="Status"
                    >
                      {statuses.map((status) => (
                        <MenuItem
                          key={status.id}
                          value={status.name}
                          sx={{
                            color: status.color,
                          }}
                        >
                          {status.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="priority-label">Priority</InputLabel>
                    <Select
                      labelId="priority-label"
                      value={ticketDetails.ticket.priority_name}
                      onChange={handlePriorityChange}
                      label="Priority"
                    >
                      {priorities.map((priority) => (
                        <MenuItem
                          key={priority.id}
                          value={priority.name}
                          sx={{
                            color: priority.color,
                          }}
                        >
                          {priority.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {isStaff && (
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="assignee-label">Assigned To</InputLabel>
                      <Select
                        labelId="assignee-label"
                        value={ticketDetails.ticket.assignee_username || ''}
                        onChange={handleAssigneeChange}
                        label="Assigned To"
                      >
                        <MenuItem value="">
                          <em>Unassigned</em>
                        </MenuItem>
                        {staffMembers.map((staff) => (
                          <MenuItem key={staff.id} value={staff.username}>
                            {staff.name} ({staff.role})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Paper>
                
                {/* Ticket information */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Ticket Information
                  </Typography>
                  
                  <Box sx={{ '& > div': { mb: 2 } }}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Ticket Number
                      </Typography>
                      <Typography variant="body1">
                        {ticketDetails.ticket.ticket_number}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Created
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(ticketDetails.ticket.created_at), 'MMM dd, yyyy h:mm a')}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(ticketDetails.ticket.updated_at), 'MMM dd, yyyy h:mm a')}
                      </Typography>
                    </Box>
                    
                    {ticketDetails.ticket.last_response_at && (
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Last Response
                        </Typography>
                        <Typography variant="body1">
                          {format(new Date(ticketDetails.ticket.last_response_at), 'MMM dd, yyyy h:mm a')}
                        </Typography>
                      </Box>
                    )}
                    
                    {ticketDetails.ticket.closed_at && (
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Closed
                        </Typography>
                        <Typography variant="body1">
                          {format(new Date(ticketDetails.ticket.closed_at), 'MMM dd, yyyy h:mm a')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </>
        ) : (
          <Alert severity="error">Ticket not found</Alert>
        )}
      </Container>
    </ErrorBoundary>
  );
} 