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
import { botPlanService } from '@/services/api/botPlans';
import { planService } from '@/services/api/plans';

interface FormValues {
  bot_id: string;
  plan_id: string;
  metadata: string;
}

const BotPlanDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bots, setBots] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const initialValues: FormValues = {
    bot_id: '',
    plan_id: '',
    metadata: '{}',
  };

  const validationRules = {
    bot_id: [
      commonValidationRules.required('Bot is required'),
    ],
    plan_id: [
      commonValidationRules.required('Plan is required'),
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await authService.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Forward auth header
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      botPlanService.setAuthHeader(`Bearer ${token}`);

      // Load bots and plans for dropdowns
      const [botsData, plansData] = await Promise.all([
        fetch('/api/bots', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(res => {
          if (!res.ok) throw new Error('Failed to load bots');
          return res.json();
        }),
        fetch('/api/plans', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(res => {
          if (!res.ok) throw new Error('Failed to load plans');
          return res.json();
        })
      ]);

      setBots(botsData);
      setPlans(plansData);

      if (!isNew) {
        const botPlan = await botPlanService.getBotPlan(id);
        setValues({
          bot_id: botPlan.bot_id.toString(),
          plan_id: botPlan.plan_id.toString(),
          metadata: JSON.stringify(botPlan.metadata || {}, null, 2),
        });
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load required data');
      if (err.response?.status === 401 || err.message?.includes('401')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const isValid = await validateForm();
      if (!isValid) {
        return;
      }

      const botPlanData = {
        bot_id: parseInt(values.bot_id),
        plan_id: parseInt(values.plan_id),
        metadata: values.metadata ? JSON.parse(values.metadata) : {},
      };

      if (isNew) {
        await botPlanService.createBotPlan(botPlanData);
      } else {
        await botPlanService.updateBotPlan(id, botPlanData);
      }

      router.push('/bot-plans/');
    } catch (err: any) {
      console.error('Error saving bot plan:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save bot plan');
      if (err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      setError(null);

      await botPlanService.deleteBotPlan(id);
      router.push('/bot-plans/');
    } catch (err: any) {
      console.error('Error deleting bot plan:', err);
      setError(err.response?.data?.error || err.message || 'Failed to delete bot plan');
      if (err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setSubmitting(false);
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, isNew, router, setValues]);

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
        title={isNew ? 'Create Bot Plan' : 'Edit Bot Plan'}
        subtitle={isNew 
          ? 'Assign a trading plan to a bot' 
          : 'Modify the plan assigned to your bot'}
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
              onClick={handleSave}
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
          <form onSubmit={handleSave}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormInput
                  select
                  label="Bot"
                  name="bot_id"
                  value={values.bot_id}
                  onChange={(e) => handleChange('bot_id', e.target.value)}
                  onBlur={() => handleBlur('bot_id')}
                  errors={errors.bot_id || []}
                  touched={touched.bot_id}
                  fullWidth
                  disabled={!isNew}
                  helperText="Select the bot to assign a plan to"
                >
                  <MenuItem value="" disabled>
                    Select a bot
                  </MenuItem>
                  {bots.map((bot) => (
                    <MenuItem key={bot.id} value={bot.id.toString()}>
                      {bot.name}
                    </MenuItem>
                  ))}
                </FormInput>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  select
                  label="Plan"
                  name="plan_id"
                  value={values.plan_id}
                  onChange={(e) => handleChange('plan_id', e.target.value)}
                  onBlur={() => handleBlur('plan_id')}
                  errors={errors.plan_id || []}
                  touched={touched.plan_id}
                  fullWidth
                  helperText="Select the trading plan to assign"
                >
                  <MenuItem value="" disabled>
                    Select a plan
                  </MenuItem>
                  {plans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id.toString()}>
                      {plan.name} ({plan.symbol})
                    </MenuItem>
                  ))}
                </FormInput>
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
            Are you sure you want to delete this bot plan? This action cannot be undone.
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

export default BotPlanDetailPage; 