'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  MenuItem,
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
import { botService, Region, Provider } from '@/services/api/bots';
import { toast } from 'react-hot-toast';

interface FormValues {
  name: string;
  description: string;
  broker_id: string;
  active: boolean;
  copy_active: boolean;
  metadata: string;
}

const BotDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brokers, setBrokers] = useState<any[]>([]);

  const initialValues: FormValues = {
    name: '',
    description: '',
    broker_id: '',
    active: true,
    copy_active: false,
    metadata: '{}',
  };

  const validationRules = {
    name: [
      commonValidationRules.required('Name is required'),
      commonValidationRules.maxLength(100),
    ],
    description: [
      commonValidationRules.required('Description is required'),
    ],
    broker_id: [
      commonValidationRules.required('Broker is required'),
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
        setLoading(true);
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Load all data in parallel with proper auth headers
        const [botData, brokersResponse] = await Promise.all([
          id !== 'new' ? botService.getBot(id) : null,
          fetch('/api/brokers', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
        ]);

        // Handle brokers response
        if (!brokersResponse.ok) {
          throw new Error(`Failed to load brokers: ${brokersResponse.statusText}`);
        }
        const brokersData = await brokersResponse.json();
        if (!Array.isArray(brokersData)) {
          throw new Error('Invalid brokers data format');
        }

        if (botData) {
          setValues({
            name: botData.name,
            description: botData.description || '',
            broker_id: botData.broker_id.toString(),
            active: botData.active,
            copy_active: botData.copy_active,
            metadata: botData.metadata ? JSON.stringify(botData.metadata, null, 2) : '{}',
          });
        }

        setBrokers(brokersData);
        setError(null);
      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, setValues, router]);

  const handleSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Set auth header
      botService.setAuthHeader(`Bearer ${token}`);

      // Format the data
      const formattedData = {
        name: data.name,
        description: data.description,
        broker_id: parseInt(data.broker_id),
        active: data.active,
        copy_active: data.copy_active,
        metadata: data.metadata ? JSON.parse(data.metadata) : {},
      };

      console.log('Submitting bot data:', {
        id,
        isNew: id === 'new',
        formattedData,
        token: token.substring(0, 10) + '...'
      });

      let savedBot;
      if (id === 'new') {
        savedBot = await botService.createBot(formattedData);
      } else {
        savedBot = await botService.updateBot(id, formattedData);
      }

      console.log('Bot saved successfully:', savedBot);

      toast.success('Bot saved successfully');
      if (id === 'new') {
        router.push(`/bots/${savedBot.id}`);
      }
    } catch (error: any) {
      console.error('Error saving bot:', {
        error,
        response: error.response,
        message: error.message,
        stack: error.stack
      });
      toast.error(error.response?.data?.error || error.message || 'Failed to save bot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this bot?')) {
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Set auth header
      botService.setAuthHeader(`Bearer ${token}`);

      await botService.deleteBot(id);
      toast.success('Bot deleted successfully');
      router.push('/bots');
    } catch (error: any) {
      console.error('Error deleting bot:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to delete bot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(name, e.target.checked);
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
        title={isNew ? 'Create Bot' : 'Edit Bot'}
        subtitle={isNew 
          ? 'Create a new trading bot' 
          : 'Modify your existing trading bot'}
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
              onClick={() => handleSubmit(values)}
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
          <form onSubmit={(e) => {
            e.preventDefault();
            if (validateForm()) {
              handleSubmit(values);
            }
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormInput
                  label="Bot Name"
                  name="name"
                  value={values.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  errors={errors.name || []}
                  touched={touched.name}
                  fullWidth
                  placeholder="e.g., ES Futures Bot"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  select
                  label="Broker"
                  name="broker_id"
                  value={values.broker_id}
                  onChange={(e) => handleChange('broker_id', e.target.value)}
                  onBlur={() => handleBlur('broker_id')}
                  errors={errors.broker_id || []}
                  touched={touched.broker_id}
                  fullWidth
                  helperText="Select the broker to use for this bot"
                >
                  <MenuItem value="" disabled>
                    Select a broker
                  </MenuItem>
                  {brokers.map((broker) => (
                    <MenuItem key={broker.id} value={broker.id.toString()}>
                      {broker.name} {broker.active ? '(Active)' : '(Inactive)'}
                    </MenuItem>
                  ))}
                </FormInput>
              </Grid>

              <Grid item xs={12}>
                <FormInput
                  label="Description"
                  name="description"
                  value={values.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                  errors={errors.description || []}
                  touched={touched.description}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Describe your trading bot's purpose"
                />
              </Grid>

              <Grid item xs={12}>
                <FormInput
                  label="Metadata (JSON)"
                  name="metadata"
                  value={values.metadata}
                  onChange={(e) => handleChange('metadata', e.target.value)}
                  onBlur={() => handleBlur('metadata')}
                  errors={errors.metadata || []}
                  touched={touched.metadata}
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="{}"
                />
                <Typography variant="caption" color="text.secondary">
                  Enter configuration parameters as JSON. This will be used by the trading bot.
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.active}
                      onChange={handleSwitchChange('active')}
                      color="primary"
                    />
                  }
                  label="Active"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Only active bots will execute trades.
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.copy_active}
                      onChange={handleSwitchChange('copy_active')}
                      color="primary"
                    />
                  }
                  label="Copy Trading"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Enable to allow other users to copy this bot's trades.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  {!isNew && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={submitting}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Bot'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Bot</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this bot? This action cannot be undone.
            Any bot plans and schedules using this bot will also be affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BotDetailPage; 