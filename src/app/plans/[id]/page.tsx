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
import { planService } from '@/services/api/plans';
import { brokerService } from '@/services/api/brokers';

interface FormValues {
  name: string;
  description: string;
  symbol: string;
  active: boolean;
  broker_id: string;
  reverse_position_threshold: number;
  cancel_trade_in_progress: boolean;
  only_action: string;
  trailing_threshold_percentage: number;
  trade_same_direction: boolean;
  metadata: string;
}

const PlanDetailPage = () => {
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
    symbol: '',
    active: true,
    broker_id: '',
    reverse_position_threshold: 0,
    cancel_trade_in_progress: false,
    only_action: '',
    trailing_threshold_percentage: 0,
    trade_same_direction: true,
    metadata: '{}',
  };

  const validationRules = {
    name: [
      commonValidationRules.required('Name is required'),
      commonValidationRules.maxLength(100),
    ],
    symbol: [
      commonValidationRules.required('Symbol is required'),
      commonValidationRules.maxLength(20),
    ],
    broker_id: [
      commonValidationRules.required('Broker is required'),
    ],
    reverse_position_threshold: [
      {
        custom: (value: any): boolean => !isNaN(parseFloat(value)),
        message: 'Must be a valid number',
      },
    ],
    trailing_threshold_percentage: [
      {
        custom: (value: any): boolean => !isNaN(parseFloat(value)),
        message: 'Must be a valid number',
      },
    ],
    only_action: [],
    description: [],
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
        try {
          const token = localStorage.getItem('token');
          const brokersResponse = await fetch('/api/brokers', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!brokersResponse.ok) {
            throw new Error(`Failed to load brokers: ${brokersResponse.statusText}`);
          }
          
          const brokersData = await brokersResponse.json();
          if (Array.isArray(brokersData)) {
            setBrokers(brokersData);
          } else {
            console.error('Unexpected brokers data format:', brokersData);
            setError('Failed to load brokers: Invalid data format');
          }
        } catch (err) {
          console.error('Error loading brokers:', err);
          setError('Failed to load brokers. Some features may be limited.');
        }

        // If editing existing plan, load it
        if (!isNew) {
          try {
            const plan = await planService.getPlan(parseInt(id));
            setValues({
              name: plan.name,
              description: plan.description || '',
              symbol: plan.symbol,
              active: plan.active,
              broker_id: plan.broker_id.toString(),
              reverse_position_threshold: plan.reverse_position_threshold,
              cancel_trade_in_progress: plan.cancel_trade_in_progress,
              only_action: plan.only_action || '',
              trailing_threshold_percentage: plan.trailing_threshold_percentage,
              trade_same_direction: plan.trade_same_direction !== undefined ? plan.trade_same_direction : true,
              metadata: plan.metadata ? JSON.stringify(plan.metadata, null, 2) : '{}',
            });
          } catch (err) {
            console.error("Error loading plan:", err);
            setError("Failed to load plan data");
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
      console.log('Submitting plan data:', values);
      
      const planData = {
        name: values.name,
        description: values.description,
        symbol: values.symbol,
        active: values.active,
        broker_id: parseInt(values.broker_id),
        reverse_position_threshold: parseFloat(values.reverse_position_threshold.toString()),
        cancel_trade_in_progress: values.cancel_trade_in_progress,
        only_action: values.only_action,
        trailing_threshold_percentage: parseFloat(values.trailing_threshold_percentage.toString()),
        trade_same_direction: values.trade_same_direction,
        metadata: values.metadata ? JSON.parse(values.metadata) : {},
      };

      console.log('Processed plan data:', planData);

      let result;
      if (isNew) {
        console.log('Creating new plan...');
        result = await planService.createPlan(planData);
        console.log('Plan created successfully:', result);
      } else {
        console.log('Updating plan with ID:', id);
        result = await planService.updatePlan(parseInt(id), planData);
        console.log('Plan updated successfully:', result);
      }

      router.push('/plans');
    } catch (err: any) {
      console.error('Error saving plan:', err);
      
      // Extract detailed error information
      const errorMessage = err.response?.data?.error || 
                           err.message || 
                           'Failed to save plan';
      
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    setSubmitting(true);

    try {
      await planService.deletePlan(parseInt(id));
      router.push('/plans');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete plan');
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
        title={isNew ? 'Create Plan' : 'Edit Plan'}
        subtitle={isNew 
          ? 'Create a new trading strategy plan' 
          : 'Modify your existing trading plan'}
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
                  label="Plan Name"
                  name="name"
                  value={values.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  errors={errors.name || []}
                  touched={touched.name}
                  fullWidth
                  placeholder="e.g., Aggressive Growth Strategy"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  label="Symbol"
                  name="symbol"
                  value={values.symbol}
                  onChange={(e) => handleChange('symbol', e.target.value)}
                  onBlur={() => handleBlur('symbol')}
                  errors={errors.symbol || []}
                  touched={touched.symbol}
                  fullWidth
                  placeholder="e.g., BTCUSD"
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
                  helperText="Select the broker to use for this trading plan"
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

              <Grid item xs={12} md={6}>
                <FormInput
                  label="Only Action"
                  name="only_action"
                  value={values.only_action}
                  onChange={(e) => handleChange('only_action', e.target.value)}
                  onBlur={() => handleBlur('only_action')}
                  errors={errors.only_action || []}
                  touched={touched.only_action}
                  fullWidth
                  placeholder="e.g., BUY, SELL, or leave empty for both"
                />
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
                  rows={3}
                  placeholder="Describe your trading plan strategy and goals"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  label="Reverse Position Threshold"
                  name="reverse_position_threshold"
                  type="number"
                  value={values.reverse_position_threshold}
                  onChange={(e) => handleChange('reverse_position_threshold', e.target.value)}
                  onBlur={() => handleBlur('reverse_position_threshold')}
                  errors={errors.reverse_position_threshold || []}
                  touched={touched.reverse_position_threshold}
                  fullWidth
                  inputProps={{ step: 0.01 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Threshold at which to reverse the position
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  label="Trailing Threshold Percentage"
                  name="trailing_threshold_percentage"
                  type="number"
                  value={values.trailing_threshold_percentage}
                  onChange={(e) => handleChange('trailing_threshold_percentage', e.target.value)}
                  onBlur={() => handleBlur('trailing_threshold_percentage')}
                  errors={errors.trailing_threshold_percentage || []}
                  touched={touched.trailing_threshold_percentage}
                  fullWidth
                  inputProps={{ step: 0.01 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Percentage for trailing stop orders
                </Typography>
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
                  Only active plans can be used by trading bots.
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.cancel_trade_in_progress}
                      onChange={handleSwitchChange('cancel_trade_in_progress')}
                      color="primary"
                    />
                  }
                  label="Cancel Trade In Progress"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Cancel any trades in progress when conditions change.
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.trade_same_direction}
                      onChange={handleSwitchChange('trade_same_direction')}
                      color="primary"
                    />
                  }
                  label="Trade Same Direction"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  When enabled, trades will be executed in the same direction as the signal
                </Typography>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this plan? This action cannot be undone.
            Any bots using this plan will need to be reconfigured.
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

export default PlanDetailPage; 