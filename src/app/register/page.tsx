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
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import FormInput from '@/components/FormInput';
import { useFormValidation, commonValidationRules } from '@/hooks/useFormValidation';
import { authService, RegisterDTO } from '@/services/api/auth';

interface FormValues {
  username: string;
  password: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const initialValues: FormValues = {
    username: '',
    password: '',
    name: '',
  };

  const validationRules = {
    username: [
      commonValidationRules.required('Username is required'),
      commonValidationRules.minLength(3, 'Username must be at least 3 characters'),
      commonValidationRules.maxLength(50, 'Username cannot exceed 50 characters'),
    ],
    password: [
      commonValidationRules.required('Password is required'),
      commonValidationRules.minLength(6, 'Password must be at least 6 characters'),
      commonValidationRules.maxLength(100, 'Password cannot exceed 100 characters'),
    ],
    name: [
      commonValidationRules.required('Full name is required'),
      commonValidationRules.maxLength(100, 'Name cannot exceed 100 characters'),
    ],
  };

  const { values, errors, touched, handleChange, handleBlur, validateForm } = useFormValidation(
    initialValues,
    validationRules
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const registerData: RegisterDTO = {
        username: values.username,
        password: values.password,
        name: values.name,
      };

      await authService.register(registerData);
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Create Account"
        subtitle="Join Trader Nickel to start automating your trading strategies"
        action={
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

      <Card sx={{ mb: 4 }}>
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
                  helperText="Choose a unique username for your account"
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
                  helperText="Use a strong password with at least 6 characters"
                />
              </Grid>

              <Grid item xs={12}>
                <FormInput
                  label="Full Name"
                  name="name"
                  value={values.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  errors={errors.name || []}
                  touched={touched.name}
                  fullWidth
                  helperText="Enter your full name"
                />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'primary.main' }}>
                      Login here
                    </Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <Link href="/forgot-password" style={{ color: 'primary.main' }}>
                      Forgot your password?
                    </Link>
                  </Typography>
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                  disabled={submitting}
                >
                  {submitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 