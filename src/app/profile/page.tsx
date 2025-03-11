'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
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
  Person as PersonIcon,
} from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import FormInput from '@/components/FormInput';
import { useFormValidation, commonValidationRules } from '@/hooks/useFormValidation';
import { authService, UpdateUserDTO, User } from '@/services/api/auth';

interface FormValues {
  username: string;
  password: string;
  name: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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
    name: [
      commonValidationRules.required('Name is required'),
      commonValidationRules.maxLength(100, 'Name cannot exceed 100 characters'),
    ],
    password: [
      commonValidationRules.maxLength(100, 'Password cannot exceed 100 characters'),
    ],
  };

  const { values, errors, touched, handleChange, handleBlur, validateForm, setValues } = useFormValidation(
    initialValues,
    validationRules
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    setValues({
      username: userData.username || '',
      name: userData.name || '',
      password: '',
    });
    authService.initializeAuth();
  }, [router, setValues]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: UpdateUserDTO = {
        username: values.username,
        name: values.name,
      };

      if (values.password) {
        updateData.password = values.password;
      }

      const updatedUser = await authService.updateUser(user.id, updateData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile updated successfully');
      
      // Clear password field after successful update
      setValues({ ...values, password: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Edit Profile"
        subtitle="Update your account information"
        action={
          <Button
            variant="contained"
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={() => {
              if (validateForm()) {
                const form = document.querySelector('form');
                if (form) form.requestSubmit();
              }
            }}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
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
              <Grid item xs={12} md={6}>
                <FormInput
                  label="Username"
                  name="username"
                  value={values.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  onBlur={() => handleBlur('username')}
                  errors={errors.username || []}
                  touched={touched.username}
                  fullWidth
                  helperText="Your unique username for logging in"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  label="Full Name"
                  name="name"
                  value={values.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  errors={errors.name || []}
                  touched={touched.name}
                  fullWidth
                  helperText="Your display name"
                />
              </Grid>

              <Grid item xs={12}>
                <FormInput
                  type="password"
                  label="New Password"
                  name="password"
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  errors={errors.password || []}
                  touched={touched.password}
                  fullWidth
                  helperText="Leave blank to keep current password"
                />
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 