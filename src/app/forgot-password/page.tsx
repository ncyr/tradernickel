'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import FormInput from '@/components/FormInput';
import { useFormValidation, commonValidationRules } from '@/hooks/useFormValidation';

interface FormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const initialValues: FormValues = {
    email: '',
  };

  const validationRules = {
    email: [
      commonValidationRules.required('Email is required'),
      commonValidationRules.email('Please enter a valid email address'),
    ],
  };

  const { values, errors, touched, handleChange, handleBlur, validateForm } = useFormValidation(
    initialValues,
    validationRules
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Since the API doesn't have a forgot password endpoint yet, we'll simulate success
      // In a real implementation, you would call the API here
      // await authService.forgotPassword(values.email);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(`Password reset instructions have been sent to ${values.email}`);
      setSubmitting(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process your request');
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Forgot Password"
        description="Enter your email address to reset your password"
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/login')}
          >
            Back to Login
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 4 }}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  errors={errors.email || []}
                  touched={touched.email}
                  fullWidth
                  helperText="Enter the email address associated with your account"
                />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Remember your password?{' '}
                    <Link href="/login" style={{ color: 'primary.main' }}>
                      Login here
                    </Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Don't have an account?{' '}
                    <Link href="/register" style={{ color: 'primary.main' }}>
                      Create one now
                    </Link>
                  </Typography>
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Note: This is a placeholder page. The password reset functionality needs to be implemented in the API.
        </Typography>
      </Box>
    </div>
  );
} 