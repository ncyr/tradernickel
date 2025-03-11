'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  FormHelperText,
} from '@mui/material';
import PageHeader from '@/components/PageHeader';
import { authService } from '@/services/api/auth';
import {
  createTicket,
  getDepartments,
  getPriorities,
  TicketDepartment,
  TicketPriority,
} from '@/services/api/tickets';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SelectChangeEvent } from '@mui/material/Select';

export default function NewTicketPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<TicketDepartment[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    department_id: '',
    priority_id: '',
  });
  const [formErrors, setFormErrors] = useState({
    subject: '',
    description: '',
    department_id: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push('/login');
      } else {
        fetchFormData();
      }
    };

    checkAuth();
  }, [router]);

  const fetchFormData = async () => {
    try {
      setIsLoading(true);
      const [departmentsData, prioritiesData] = await Promise.all([
        getDepartments(),
        getPriorities(),
      ]);
      setDepartments(departmentsData);
      setPriorities(prioritiesData);
      
      // Set default priority to Medium (or the second one if available)
      if (prioritiesData.length > 1) {
        setFormData(prev => ({
          ...prev,
          priority_id: prioritiesData[1].id.toString(),
        }));
      } else if (prioritiesData.length > 0) {
        setFormData(prev => ({
          ...prev,
          priority_id: prioritiesData[0].id.toString(),
        }));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching form data:', err);
      setError('Failed to load form data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {
      subject: '',
      description: '',
      department_id: '',
    };
    let isValid = true;

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
      isValid = false;
    } else if (formData.subject.length < 5) {
      errors.subject = 'Subject must be at least 5 characters';
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
      isValid = false;
    }

    if (!formData.department_id) {
      errors.department_id = 'Department is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const ticketData = {
        subject: formData.subject,
        description: formData.description,
        department_id: parseInt(formData.department_id),
        priority_id: formData.priority_id ? parseInt(formData.priority_id) : undefined,
      };

      const response = await createTicket(ticketData);
      router.push(`/support/${response.id}`);
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <PageHeader
          title="Create New Support Ticket"
          subtitle="Submit a new support request"
        />

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button variant="outlined" size="small" onClick={fetchFormData} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        ) : (
          <Paper sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleTextChange}
                error={!!formErrors.subject}
                helperText={formErrors.subject}
                disabled={isSubmitting}
                required
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleTextChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                multiline
                rows={4}
                disabled={isSubmitting}
                required
                sx={{ mb: 3 }}
              />

              <FormControl fullWidth sx={{ mb: 3 }} error={!!formErrors.department_id}>
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleSelectChange}
                  label="Department"
                  disabled={isSubmitting}
                  required
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.department_id && (
                  <FormHelperText>{formErrors.department_id}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  name="priority_id"
                  value={formData.priority_id}
                  onChange={handleSelectChange}
                  label="Priority"
                  disabled={isSubmitting}
                >
                  <MenuItem value="">
                    <em>Default</em>
                  </MenuItem>
                  {priorities.map((priority) => (
                    <MenuItem key={priority.id} value={priority.id.toString()}>
                      {priority.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/support')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </Box>
            </form>
          </Paper>
        )}
      </Container>
    </ErrorBoundary>
  );
} 