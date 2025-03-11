'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import FormInput from '@/components/FormInput';
import { useFormValidation, commonValidationRules } from '@/hooks/useFormValidation';
import { authService } from '@/services/api/auth';
import { brokerService } from '@/services/api/brokers';

interface FormValues {
  name: string;
  active: boolean;
  metadata: string;
  demo_url: string;
  prod_url: string;
}

const BrokerDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const initialValues: FormValues = {
    name: '',
    active: true,
    metadata: '{}',
    demo_url: '',
    prod_url: '',
  };

  const validationRules = {
    name: [
      commonValidationRules.required('Name is required'),
      commonValidationRules.maxLength(100, 'Name cannot exceed 100 characters'),
    ],
    demo_url: [
      commonValidationRules.required('Demo URL is required'),
      commonValidationRules.url('Please enter a valid URL'),
    ],
    prod_url: [
      commonValidationRules.required('Production URL is required'),
      commonValidationRules.url('Please enter a valid URL'),
    ],
    metadata: [
      {
        custom: (value: string): boolean => {
          try {
            if (value) {
              JSON.parse(value);
            }
            return true;
          } catch (e) {
            return false;
          }
        },
        message: 'Metadata must be valid JSON',
      },
    ],
  };

  const { values, errors, touched, handleChange, handleBlur, validateForm, setValues } = useFormValidation(
    initialValues,
    validationRules
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setIsAdmin(user.role === 'admin');

        if (user.role !== 'admin') {
          setError('Only administrators can manage brokers');
          setLoading(false);
          return;
        }

        // If editing existing broker, load it
        if (!isNew) {
          try {
            const response = await fetch(`/api/brokers/${id}`);
            if (!response.ok) {
              throw new Error('Failed to load broker');
            }
            const broker = await response.json();
            setValues({
              name: broker.name,
              active: broker.active,
              metadata: broker.metadata ? JSON.stringify(broker.metadata, null, 2) : '{}',
              demo_url: broker.demo_url,
              prod_url: broker.prod_url,
            });
          } catch (err) {
            console.error("Error loading broker:", err);
            setError("Failed to load broker data");
          }
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load data');
        setLoading(false);
      }
    };

    loadData();
  }, [id, isNew, router, setValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const brokerData = {
        name: values.name,
        active: values.active,
        metadata: values.metadata ? JSON.parse(values.metadata) : {},
        demo_url: values.demo_url,
        prod_url: values.prod_url,
      };

      const response = await fetch(`/api/brokers${id !== 'new' ? `/${id}` : ''}`, {
        method: id !== 'new' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(brokerData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save broker');
      }

      router.push('/brokers');
    } catch (err: any) {
      console.error('Error saving broker:', err);
      setError(err.message || 'Failed to save broker');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/brokers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete broker');
      }

      router.push('/brokers');
    } catch (err: any) {
      console.error('Error deleting broker:', err);
      setError(err.message || 'Failed to delete broker');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box sx={{ py: 4 }}>
        <PageHeader
          title="Broker Management"
          subtitle="Manage trading brokers"
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
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'You do not have permission to access this page'}
        </Alert>
      </Box>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title={isNew ? 'Create Broker' : 'Edit Broker'}
        subtitle={isNew 
          ? 'Add a new trading broker to the system' 
          : 'Modify an existing trading broker'}
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.back()}
            >
              Back
            </Button>
            {!isNew && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormInput
                  label="Broker Name"
                  name="name"
                  value={values.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  errors={errors.name || []}
                  touched={touched.name}
                  fullWidth
                  helperText="Enter a unique name for this broker"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.active}
                      onChange={(e) => handleChange('active', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  label="Demo URL"
                  name="demo_url"
                  value={values.demo_url}
                  onChange={(e) => handleChange('demo_url', e.target.value)}
                  onBlur={() => handleBlur('demo_url')}
                  errors={errors.demo_url || []}
                  touched={touched.demo_url}
                  fullWidth
                  helperText="URL for demo/sandbox environment"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  label="Production URL"
                  name="prod_url"
                  value={values.prod_url}
                  onChange={(e) => handleChange('prod_url', e.target.value)}
                  onBlur={() => handleBlur('prod_url')}
                  errors={errors.prod_url || []}
                  touched={touched.prod_url}
                  fullWidth
                  helperText="URL for production environment"
                />
              </Grid>

              <Grid item xs={12}>
                <FormInput
                  label="Metadata"
                  name="metadata"
                  value={values.metadata}
                  onChange={(e) => handleChange('metadata', e.target.value)}
                  onBlur={() => handleBlur('metadata')}
                  errors={errors.metadata || []}
                  touched={touched.metadata}
                  fullWidth
                  multiline
                  rows={6}
                  helperText="Additional configuration in JSON format"
                />
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this broker? This action cannot be undone.
            If this broker is associated with any bots, the deletion will fail.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BrokerDetailPage; 