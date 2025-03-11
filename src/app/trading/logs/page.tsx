"use client";

import { useState, useEffect } from 'react';
import { tradeLogService, TradeLog, TradeLogFilters, TradeLogStats } from '@/services/api/tradeLogs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format } from 'date-fns';
import { FilterList, Add, Edit, Delete } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/services/api';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Default filter values
const defaultFilters: TradeLogFilters = {
  page: 1,
  symbol: undefined,
  trade_type: undefined,
  status: undefined,
  start_date: undefined,
  end_date: undefined,
  bot_name: undefined,
  sort_by: 'created_at',
  sort_order: 'desc'
};

// Validation schema for trade log form
const tradeLogSchema = z.object({
  trade_type: z.enum(['buy', 'sell', 'limit_buy', 'limit_sell', 'market_buy', 'market_sell']),
  symbol: z.string().min(1, 'Symbol is required').max(20),
  quantity: z.number().min(0, 'Quantity must be positive'),
  price: z.number().min(0, 'Price must be positive'),
  total_value: z.number().min(0, 'Total value must be positive'),
  status: z.enum(['success', 'failed', 'pending']),
  exchange: z.string().optional().transform(val => val || null),
  order_id: z.string().optional().transform(val => val || null),
  bot_name: z.string().optional().transform(val => val || null),
  error_message: z.string().optional().transform(val => val || null),
  metadata: z.any().nullable(),
});

type TradeLogFormData = z.infer<typeof tradeLogSchema>;

export default function TradeLogsPage() {
  const router = useRouter();
  
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Initialize with default filters
  const [filters, setFilters] = useState<TradeLogFilters>(defaultFilters);
  const [stats, setStats] = useState<TradeLogStats | null>(null);
  const [showStats, setShowStats] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TradeLogFormData>({
    resolver: zodResolver(tradeLogSchema),
    defaultValues: {
      trade_type: 'market_buy',
      status: 'pending',
      exchange: null,
      order_id: null,
      bot_name: null,
      error_message: null,
      metadata: null,
    },
  });

  const fetchTradeLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          searchParams.set(key, val.toString());
        }
      });

      const response = await fetch(`/api/trade-logs?${searchParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTradeLogs(data.tradeLogs);
      setPagination(data.pagination);
      setError(null);
    } catch (err: any) {
      console.error('Error loading trade logs:', err);
      setError(err.message || 'Failed to load trade logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const { start_date, end_date, bot_name } = filters;
      const searchParams = new URLSearchParams();
      if (start_date) searchParams.set('start_date', start_date);
      if (end_date) searchParams.set('end_date', end_date);
      if (bot_name) searchParams.set('bot_name', bot_name);

      const response = await fetch(`/api/trade-logs/stats/summary?${searchParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const stats = await response.json();
      setStats(stats);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  // Update filters from URL after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlFilters: TradeLogFilters = {
        page: params.get('page') ? parseInt(params.get('page') as string) : defaultFilters.page,
        symbol: params.get('symbol') || defaultFilters.symbol,
        trade_type: params.get('trade_type') || defaultFilters.trade_type,
        status: params.get('status') || defaultFilters.status,
        start_date: params.get('start_date') || defaultFilters.start_date,
        end_date: params.get('end_date') || defaultFilters.end_date,
        bot_name: params.get('bot_name') || defaultFilters.bot_name,
        sort_by: params.get('sort_by') || defaultFilters.sort_by,
        sort_order: (params.get('sort_order') as 'asc' | 'desc') || defaultFilters.sort_order
      };
      setFilters(urlFilters);
    }
  }, []);

  useEffect(() => {
    fetchTradeLogs();
    if (showStats) {
      fetchStats();
    }
  }, [filters, showStats]);

  const handleFilterChange = (name: string, value: string | number | Date | null) => {
    const newFilters: TradeLogFilters = {
      ...filters,
      [name]: value instanceof Date ? value.toISOString() : value,
      // Reset to page 1 when changing filters, ensure page is always a number
      page: name === 'page' ? Number(value) : 1
    };
    setFilters(newFilters);
    
    // Update URL query params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        params.set(key, val.toString());
      }
    });
    
    router.push(`/trading/logs?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TradeLog | null>(null);
  const [bots, setBots] = useState<any[]>([]);

  const fetchBots = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/bots', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bots');
      }

      const data = await response.json();
      setBots(data);
    } catch (error) {
      console.error('Error fetching bots:', error);
    }
  };

  const onSubmit = async (formData: TradeLogFormData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const data = {
        ...formData,
        total_value: formData.total_value || formData.quantity * formData.price,
      };

      const response = await fetch(`/api/trade-logs${selectedLog ? `/${selectedLog.id}` : ''}`, {
        method: selectedLog ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save trade log');
      }

      setOpenDialog(false);
      fetchTradeLogs();
      reset();
    } catch (error) {
      console.error('Error saving trade log:', error);
      setError('Failed to save trade log');
    }
  };

  const handleEdit = (log: TradeLog) => {
    setSelectedLog(log);
    reset({
      trade_type: log.trade_type as 'buy' | 'sell' | 'limit_buy' | 'limit_sell' | 'market_buy' | 'market_sell',
      symbol: log.symbol,
      quantity: log.quantity,
      price: log.price,
      total_value: log.total_value,
      status: log.status as 'success' | 'failed' | 'pending',
      exchange: log.exchange,
      order_id: log.order_id,
      bot_name: log.bot_name,
      error_message: log.error_message,
      metadata: log.metadata,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this trade log?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/trade-logs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete trade log');
      }

      fetchTradeLogs();
    } catch (error) {
      console.error('Error deleting trade log:', error);
      setError('Failed to delete trade log');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Trading Logs
          </Typography>

        {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
            </Alert>
          )}

          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Bot</InputLabel>
                  <Select
                    value={filters.bot_name || ''}
                    onChange={(e) => handleFilterChange('bot_name', e.target.value)}
                    label="Bot"
                  >
                    <MenuItem value="">All</MenuItem>
                    {bots.map(bot => (
                      <MenuItem key={bot.id} value={bot.name}>
                        {bot.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Symbol"
                value={filters.symbol || ''}
                onChange={(e) => handleFilterChange('symbol', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DateTimePicker
                  label="Start Date"
                  value={filters.start_date ? new Date(filters.start_date) : null}
                  onChange={(date) => handleFilterChange('start_date', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedLog(null);
                reset();
                setOpenDialog(true);
              }}
            >
              Add Trade Log
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bot</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Trade Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total Value</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Exchange</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">Loading...</TableCell>
                  </TableRow>
              ) : tradeLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">No trade logs found.</TableCell>
                  </TableRow>
              ) : (
                tradeLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.bot_name || 'Unnamed Bot'}</TableCell>
                      <TableCell>{log.symbol}</TableCell>
                      <TableCell>{log.trade_type}</TableCell>
                      <TableCell>{log.quantity}</TableCell>
                      <TableCell>${log.price.toFixed(2)}</TableCell>
                      <TableCell>${log.total_value.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.status}
                          color={
                            log.status === 'success'
                              ? 'success'
                              : log.status === 'failed'
                              ? 'error'
                              : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{log.exchange || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(log)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(log.id)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.page - 1}
              onPageChange={(_, newPage) => handleFilterChange('page', newPage + 1)}
              rowsPerPage={pagination.limit}
              onRowsPerPageChange={(event) => handleFilterChange('limit', parseInt(event.target.value, 10))}
            />
          </TableContainer>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogTitle>
                {selectedLog ? 'Edit Trade Log' : 'Add Trade Log'}
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.trade_type}>
                      <InputLabel>Trade Type</InputLabel>
                      <Controller
                        name="trade_type"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} label="Trade Type">
                            <MenuItem value="market_buy">Market Buy</MenuItem>
                            <MenuItem value="market_sell">Market Sell</MenuItem>
                            <MenuItem value="limit_buy">Limit Buy</MenuItem>
                            <MenuItem value="limit_sell">Limit Sell</MenuItem>
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="symbol"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Symbol"
                          fullWidth
                          error={!!errors.symbol}
                          helperText={errors.symbol?.message?.toString()}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="quantity"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Quantity"
                          type="number"
                          fullWidth
                          error={!!errors.quantity}
                          helperText={errors.quantity?.message?.toString()}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Price"
                          type="number"
                          fullWidth
                          error={!!errors.price}
                          helperText={errors.price?.message?.toString()}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="total_value"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Total Value"
                          type="number"
                          fullWidth
                          error={!!errors.total_value}
                          helperText={errors.total_value?.message?.toString()}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} label="Status">
                            <MenuItem value="success">Success</MenuItem>
                            <MenuItem value="failed">Failed</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Exchange</InputLabel>
                      <Controller
                        name="exchange"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} label="Exchange">
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value="binance">Binance</MenuItem>
                            <MenuItem value="tradovate">Tradovate</MenuItem>
                            <MenuItem value="coinbase">Coinbase</MenuItem>
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="order_id"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Order ID"
                          fullWidth
                          error={!!errors.order_id}
                          helperText={errors.order_id?.message?.toString()}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="error_message"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Error Message"
                          fullWidth
                          multiline
                          rows={4}
                          error={!!errors.error_message}
                          helperText={errors.error_message?.message?.toString()}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="metadata"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Metadata"
                          fullWidth
                          multiline
                          rows={4}
                          error={!!errors.metadata}
                          helperText={errors.metadata?.message?.toString()}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button type="submit" variant="contained">
                  {selectedLog ? 'Update' : 'Create'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Box>
      </Container>
    </LocalizationProvider>
  );
} 