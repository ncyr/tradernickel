'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { scheduleService } from '@/services/api/schedules';
import { botPlanService } from '@/services/api/botPlans';

// Weekday options
const weekdays = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface FormValues {
  weekday: number;
  start_at: string;
  end_at: string;
  bot_plan_id: string;
}

const ScheduleDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [botPlans, setBotPlans] = useState<any[]>([]);

  const initialValues: FormValues = {
    weekday: 1, // Monday
    start_at: '09:00',
    end_at: '17:00',
    bot_plan_id: '',
  };

  const validationRules = {
    weekday: [
      commonValidationRules.required('Weekday is required'),
    ],
    start_at: [
      commonValidationRules.required('Start time is required'),
      {
        custom: (value: string): boolean => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
        message: 'Please enter a valid time in 24-hour format (HH:MM)',
      },
    ],
    end_at: [
      commonValidationRules.required('End time is required'),
      {
        custom: (value: string): boolean => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
        message: 'Please enter a valid time in 24-hour format (HH:MM)',
      },
      {
        custom: (value: any): boolean => {
          if (!initialValues.start_at) return true;
          return value > values.start_at;
        },
        message: 'End time must be after start time',
      },
    ],
    bot_plan_id: [
      commonValidationRules.required('Bot plan is required'),
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
        
        // Load schedule data if editing an existing schedule
        let scheduleData = null;
        if (id !== 'new') {
          try {
            scheduleData = await scheduleService.getSchedule(id);
            console.log('Loaded schedule data:', scheduleData);
          } catch (err: any) {
            console.error('Error loading schedule:', err);
            setError(`Failed to load schedule: ${err.message}`);
          }
        }

        // Load bot plans data
        try {
          console.log('Fetching bot plans with names...');
          const botPlansData = await botPlanService.getBotPlansWithNames();
          console.log('Loaded bot plans:', botPlansData);
          setBotPlans(botPlansData);
          
          if (scheduleData) {
            setValues({
              weekday: scheduleData.weekday,
              start_at: scheduleData.start_at,
              end_at: scheduleData.end_at,
              bot_plan_id: scheduleData.bot_plan_id.toString(),
            });
          }
        } catch (err: any) {
          console.error('Error loading bot plans:', err);
          setError(`Failed to load bot plans: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, setValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const scheduleData = {
        weekday: Number(values.weekday),
        start_at: values.start_at,
        end_at: values.end_at,
        bot_plan_id: Number(values.bot_plan_id),
      };

      if (isNew) {
        await scheduleService.createSchedule(scheduleData);
      } else {
        await scheduleService.updateSchedule(parseInt(id), scheduleData);
      }

      router.push('/schedules');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save schedule');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    setSubmitting(true);

    try {
      await scheduleService.deleteSchedule(parseInt(id));
      router.push('/schedules');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete schedule');
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
        title={isNew ? 'Create Schedule' : 'Edit Schedule'}
        subtitle={isNew 
          ? 'Set up a new trading schedule for your bot plan' 
          : 'Modify your existing trading schedule'}
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
                  select
                  label="Weekday"
                  name="weekday"
                  value={values.weekday}
                  onChange={(e) => handleChange('weekday', e.target.value)}
                  onBlur={() => handleBlur('weekday')}
                  errors={errors.weekday || []}
                  touched={touched.weekday}
                  fullWidth
                >
                  {weekdays.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </FormInput>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  select
                  label="Bot Plan"
                  name="bot_plan_id"
                  value={values.bot_plan_id}
                  onChange={(e) => handleChange('bot_plan_id', e.target.value)}
                  onBlur={() => handleBlur('bot_plan_id')}
                  errors={errors.bot_plan_id || []}
                  touched={touched.bot_plan_id}
                  fullWidth
                >
                  {botPlans.length > 0 ? (
                    botPlans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id.toString()}>
                        {plan.bot_name || 'Unknown Bot'} - {plan.plan_name || 'Unknown Plan'}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No bot plans available. Please create a bot plan first.
                    </MenuItem>
                  )}
                </FormInput>
                {botPlans.length === 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push('/bot-plans/new')}
                    >
                      Create Bot Plan
                    </Button>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  label="Start Time (HH:MM)"
                  name="start_at"
                  value={values.start_at}
                  onChange={(e) => handleChange('start_at', e.target.value)}
                  onBlur={() => handleBlur('start_at')}
                  errors={errors.start_at || []}
                  touched={touched.start_at}
                  fullWidth
                  placeholder="09:00"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  label="End Time (HH:MM)"
                  name="end_at"
                  value={values.end_at}
                  onChange={(e) => handleChange('end_at', e.target.value)}
                  onBlur={() => handleBlur('end_at')}
                  errors={errors.end_at || []}
                  touched={touched.end_at}
                  fullWidth
                  placeholder="17:00"
                />
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
                    {submitting ? 'Saving...' : 'Save Schedule'}
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
        <DialogTitle>Delete Schedule</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this schedule? This action cannot be undone.
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

export default ScheduleDetailPage; 