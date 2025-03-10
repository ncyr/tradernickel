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

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Load bots and plans in parallel
        const [botsResponse, plansResponse] = await Promise.all([
          fetch('/api/bots').then(res => res.json()),
          planService.getPlans()
        ]);

        setBots(botsResponse);
        setPlans(plansResponse);

        // If editing existing bot plan, load it
        if (!isNew) {
          try {
            const botPlan = await botPlanService.getBotPlan(parseInt(id));
            setValues({
              bot_id: botPlan.bot_id.toString(),
              plan_id: botPlan.plan_id.toString(),
              metadata: botPlan.metadata ? JSON.stringify(botPlan.metadata, null, 2) : '{}',
            });
          } catch (err) {
            console.error("Error loading bot plan:", err);
            setError("Failed to load bot plan data");
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
      const botPlanData = {
        bot_id: parseInt(values.bot_id),
        plan_id: parseInt(values.plan_id),
        metadata: values.metadata ? JSON.parse(values.metadata) : {},
      };

      if (isNew) {
        await botPlanService.createBotPlan(botPlanData);
      } else {
        await botPlanService.updateBotPlan(parseInt(id), botPlanData);
      }

      router.push('/bot-plans');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save bot plan');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    setSubmitting(true);

    try {
      await botPlanService.deleteBotPlan(parseInt(id));
      router.push('/bot-plans');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete bot plan');
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

  return (
    <div className="fade-in">
      <PageHeader
        title={isNew ? 'Create Bot Plan' : 'Edit Bot Plan'}
        description={isNew 
          ? 'Assign a trading plan to a bot' 
          : 'Modify the plan assigned to your bot'}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/bot-plans')}
          >
            Back to Bot Plans
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

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
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
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                  sx={{ ml: 'auto' }}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </Button>
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