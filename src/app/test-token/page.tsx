'use client';

import { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, Alert, Paper, CircularProgress } from '@mui/material';
import PageHeader from '@/components/PageHeader';

export default function TestTokenPage() {
  const [username, setUsername] = useState('test');
  const [password, setPassword] = useState('test');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const generateToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || response.statusText || 'Failed to generate token');
      }

      const data = await response.json();
      setToken(data.token);
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      console.log('Token stored in localStorage');
      
    } catch (err: any) {
      console.error('Error generating token:', err);
      setError(err.message || 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  const testEndpoint = async (endpoint: string) => {
    setTestLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || response.statusText || 'Failed to fetch data');
      }

      const data = await response.json();
      setTestResponse(data);
    } catch (err: any) {
      console.error(`Error testing endpoint ${endpoint}:`, err);
      setError(err.message || 'Failed to test endpoint');
      setTestResponse(null);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Test Token Generator"
        subtitle="Generate and test JWT tokens for API access"
      />

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Generate Token
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              onClick={generateToken}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {token && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Generated Token:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'background.default',
                  overflowX: 'auto',
                  wordBreak: 'break-all',
                }}
              >
                <Typography variant="body2" fontFamily="monospace">
                  {token}
                </Typography>
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>

      {token && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Endpoints
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => testEndpoint('/api/bot-plans/with-names')}
                disabled={testLoading}
              >
                Test Bot Plans
              </Button>
              <Button
                variant="outlined"
                onClick={() => testEndpoint('/api/plans')}
                disabled={testLoading}
              >
                Test Plans
              </Button>
              <Button
                variant="outlined"
                onClick={() => testEndpoint('/api/brokers')}
                disabled={testLoading}
              >
                Test Brokers
              </Button>
              <Button
                variant="outlined"
                onClick={() => testEndpoint('/api/bots')}
                disabled={testLoading}
              >
                Test Bots
              </Button>
            </Box>

            {testLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            )}

            {testResponse && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Response:
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    overflowX: 'auto',
                  }}
                >
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify(testResponse, null, 2)}
                  </pre>
                </Paper>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 