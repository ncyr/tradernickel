"use client";

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Button, Card, CardContent, Grid, Box, Typography, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useFormValidation, commonValidationRules } from '@/hooks/useFormValidation';
import FormInput from '@/components/FormInput';
import PageHeader from '@/components/PageHeader';
import { authService } from '@/services/api/auth';
import { useUser } from '@/components/UserProvider';

interface FormValues {
  username: string;
  password: string;
}

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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateForm } = useFormValidation<FormValues>(
    initialValues,
    validationRules
  );

  useEffect(() => {
    // Log environment variables for debugging
    console.log('Environment:', {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
    });

    // Check for registration success message
    const registered = searchParams?.get('registered');
    if (registered === 'true') {
      setSuccess('Account created successfully! You can now log in.');
    }
    
    // Check for password reset success message
    const resetSuccess = searchParams?.get('reset');
    if (resetSuccess === 'true') {
      setSuccess('Password reset successfully! You can now log in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    console.log('Form submitted');

    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    setSubmitting(true);
    console.log('Attempting login with:', { username: values.username });

    try {
      console.log('Calling authService.login...');
      const response = await authService.login({
        username: values.username,
        password: values.password,
      });
      console.log('Login successful:', { 
        hasToken: !!response.token,
        hasUser: !!response.user,
        expiresAt: response.expiresAt
      });
      
      // Update the user context
      setUser(response.user);
      console.log('User context updated');
      
      // Wait for cookie and localStorage to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify cookie is set
      if (!document.cookie.includes('token=')) {
        console.error('Cookie not set after login');
        setError('Failed to set authentication cookie. Please try again.');
        setSubmitting(false);
        return;
      }
      
      // Verify localStorage is set
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (!storedToken || !storedUser) {
        console.error('Token or user not stored in localStorage after login');
        setError('Failed to store authentication data. Please try again.');
        setSubmitting(false);
        return;
      }

      // Use window.location.href for a full page reload
      console.log('All checks passed, redirecting to dashboard...');
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.error || err.message || 'Login failed. Please check your credentials.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Login"
        subtitle="Sign in to your Trader Nickel account"
        action={
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('username', e.target.value)}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('password', e.target.value)}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
      <LoginContent />
    </Suspense>
  );
} 