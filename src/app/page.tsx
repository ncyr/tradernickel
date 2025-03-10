'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  Security,
  Analytics,
  Speed,
  Devices,
} from '@mui/icons-material';
import Logo from '@/components/Logo';

const HomePage = () => {
  const router = useRouter();

  const features = [
    {
      icon: <TrendingUp fontSize="large" color="primary" />,
      title: 'Automated Trading',
      description: 'Set up trading bots that execute your strategies 24/7 without manual intervention.',
    },
    {
      icon: <Schedule fontSize="large" color="primary" />,
      title: 'Flexible Scheduling',
      description: 'Create custom schedules to run your trading bots at optimal market times.',
    },
    {
      icon: <Security fontSize="large" color="primary" />,
      title: 'Secure Platform',
      description: 'Enterprise-grade security to keep your trading accounts and strategies safe.',
    },
    {
      icon: <Analytics fontSize="large" color="primary" />,
      title: 'Advanced Analytics',
      description: 'Track performance with detailed metrics and visualizations.',
    },
    {
      icon: <Speed fontSize="large" color="primary" />,
      title: 'Low Latency',
      description: 'Execute trades with minimal delay for optimal entry and exit points.',
    },
    {
      icon: <Devices fontSize="large" color="primary" />,
      title: 'Multi-platform',
      description: 'Access your trading dashboard from any device, anywhere.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #00838f 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          borderRadius: { xs: 0, md: '0 0 50px 50px' },
          boxShadow: 3,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Logo size="large" />
              </Box>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 2,
                }}
              >
                Automated Trading Made Simple
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 400,
                  mb: 4,
                  opacity: 0.9,
                }}
              >
                Build, schedule, and monitor your trading bots with ease
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => router.push('/register')}
                  sx={{
                    fontWeight: 600,
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/login')}
                  sx={{
                    fontWeight: 600,
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Box
                  component="img"
                  src="/api/dashboard-preview"
                  alt="Trading Dashboard Preview"
                  sx={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: 4,
                    display: { xs: 'none', md: 'block' },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 600,
              mb: 2,
            }}
          >
            Powerful Trading Features
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            Everything you need to automate your trading strategies and maximize your returns
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                className="hover-lift"
                sx={{
                  height: '100%',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          py: 8,
          borderTop: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: 'center',
              p: 4,
              borderRadius: 3,
              boxShadow: 2,
              backgroundColor: 'white',
            }}
          >
            <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
              Ready to start trading smarter?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of traders who are already using Trader Nickel to automate their strategies.
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={() => router.push('/register')}
              sx={{
                fontWeight: 600,
                py: 1.5,
                px: 4,
                borderRadius: 2,
              }}
            >
              Create Your Account
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 