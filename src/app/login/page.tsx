"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import FormInput from '@/components/FormInput';
import { useFormValidation, commonValidationRules } from '@/hooks/useFormValidation';
import { authService } from '@/services/api/auth';

interface FormValues {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const initialValues: FormValues = {
    username: '',
    password: '',
  };

  const validationRules = {
    username: [
      commonValidationRules.required('Username is required'),
    ],
    password: [
      commonValidationRules.required('Password is required'),
    ],
  };

  const { values, errors, touched, handleChange, handleBlur, validateForm } = useFormValidation(
    initialValues,
    validationRules
  );

  useEffect(() => {
    // Check for registration success message
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setSuccess('Account created successfully! You can now log in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    console.log('Submitting login form with username:', values.username);

    try {
      console.log('Attempting to login with credentials:', { username: values.username });
      const response = await authService.login({
        username: values.username,
        password: values.password,
      });
      console.log('Login successful, response:', response);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Login"
        description="Sign in to your Trader Nickel account"
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => router.push('/register')}
          >
            Create Account
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

      <Card sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormInput
                  label="Username"
                  name="username"
                  value={values.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  onBlur={() => handleBlur('username')}
                  errors={errors.username || []}
                  touched={touched.username}
                  fullWidth
                  autoFocus
                  helperText="Enter your username"
                />
              </Grid>

              <Grid item xs={12}>
                <FormInput
                  label="Password"
                  name="password"
                  type="password"
                  showPasswordToggle
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  errors={errors.password || []}
                  touched={touched.password}
                  fullWidth
                  helperText="Enter your password"
                />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <Link href="/forgot-password" style={{ color: 'primary.main' }}>
                      Forgot your password?
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
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                  disabled={submitting}
                >
                  {submitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          By signing in, you agree to our{' '}
          <Link href="/terms" style={{ color: 'inherit', fontWeight: 500 }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" style={{ color: 'inherit', fontWeight: 500 }}>
            Privacy Policy
          </Link>
        </Typography>
      </Box>
    </div>
  );
} 