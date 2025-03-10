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
import { botService } from '@/services/api/bots';

interface FormValues {
  name: string;
  description: string;
  region: string;
  provider: string;
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
    region: 'us-east-1',
    provider: 'aws',
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
    region: [
      commonValidationRules.required('Region is required'),
    ],
    provider: [
      commonValidationRules.required('Provider is required'),
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
        const user = await authService.getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Load brokers
        const brokersResponse = await fetch('/api/brokers').then(res => {
          if (!res.ok) throw new Error('Failed to load brokers');
          return res.json();
        }).catch(() => {
          // If we can't load brokers, use a mock list
          return [
            { id: 1, name: 'Tradovate' },
            { id: 2, name: 'Interactive Brokers' },
            { id: 3, name: 'TD Ameritrade' },
          ];
        });

        setBrokers(brokersResponse);

        // If editing existing bot, load it
        if (!isNew) {
          try {
            const bot = await botService.getBot(parseInt(id));
            setValues({
              name: bot.name,
              description: bot.description || '',
              region: bot.region,
              provider: bot.provider,
              broker_id: bot.broker_id.toString(),
              active: bot.active,
              copy_active: bot.copy_active,
              metadata: bot.metadata ? JSON.stringify(bot.metadata, null, 2) : '{}',
            });
          } catch (err) {
            console.error("Error loading bot:", err);
            setError("Failed to load bot data");
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
      const botData = {
        name: values.name,
        description: values.description,
        region: values.region,
        provider: values.provider,
        broker_id: parseInt(values.broker_id),
        active: values.active,
        copy_active: values.copy_active,
        metadata: values.metadata ? JSON.parse(values.metadata) : {},
      };

      if (isNew) {
        await botService.createBot(botData);
      } else {
        await botService.updateBot(parseInt(id), botData);
      }

      router.push('/bots');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save bot');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    setSubmitting(true);

    try {
      await botService.deleteBot(parseInt(id));
      router.push('/bots');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete bot');
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
        description={isNew 
          ? 'Create a new trading bot' 
          : 'Modify your existing trading bot'}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/bots')}
          >
            Back to Bots
          </Button>
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
                >
                  <MenuItem value="" disabled>
                    Select a broker
                  </MenuItem>
                  {brokers.map((broker) => (
                    <MenuItem key={broker.id} value={broker.id.toString()}>
                      {broker.name}
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

              <Grid item xs={12} md={6}>
                <FormInput
                  select
                  label="Region"
                  name="region"
                  value={values.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                  onBlur={() => handleBlur('region')}
                  errors={errors.region || []}
                  touched={touched.region}
                  fullWidth
                >
                  <MenuItem value="us-east-1">US East (N. Virginia)</MenuItem>
                  <MenuItem value="us-east-2">US East (Ohio)</MenuItem>
                  <MenuItem value="us-west-1">US West (N. California)</MenuItem>
                  <MenuItem value="us-west-2">US West (Oregon)</MenuItem>
                  <MenuItem value="eu-west-1">EU (Ireland)</MenuItem>
                  <MenuItem value="eu-central-1">EU (Frankfurt)</MenuItem>
                  <MenuItem value="ap-northeast-1">Asia Pacific (Tokyo)</MenuItem>
                  <MenuItem value="ap-southeast-1">Asia Pacific (Singapore)</MenuItem>
                </FormInput>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  select
                  label="Provider"
                  name="provider"
                  value={values.provider}
                  onChange={(e) => handleChange('provider', e.target.value)}
                  onBlur={() => handleBlur('provider')}
                  errors={errors.provider || []}
                  touched={touched.provider}
                  fullWidth
                >
                  <MenuItem value="aws">Amazon Web Services</MenuItem>
                  <MenuItem value="gcp">Google Cloud Platform</MenuItem>
                  <MenuItem value="azure">Microsoft Azure</MenuItem>
                  <MenuItem value="local">Local (Self-hosted)</MenuItem>
                </FormInput>
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