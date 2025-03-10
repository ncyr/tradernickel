# Dashboard Documentation and Troubleshooting

This document provides information about the dashboard implementation and common troubleshooting steps.

## Overview

The dashboard is the central hub of the TraderNickel application. It displays key metrics including:
- Active bots count
- Trading performance
- Active and upcoming schedules
- Quick access to other parts of the application

## Technical Implementation

The dashboard uses:
- React hooks for state management
- Next.js for routing
- Material UI for components
- API client for data fetching

## Authentication Flow

1. Dashboard checks for authentication on load
2. If no token is found, redirects to login
3. If token is expired, redirects to login
4. Otherwise, fetches dashboard data

## Common Issues and Solutions

### Dashboard shows loading indefinitely

**Possible causes:**
- Authentication issues
- API server connection problems
- API request failures

**Solutions:**
1. Check browser console for errors
2. Verify API server is running (`curl https://api-local.tradernickel.com/`)
3. Check network tab for failed requests
4. Try logging out and back in
5. Clear browser cache and local storage

### Dashboard shows "Failed to load dashboard data"

**Possible causes:**
- API server error
- Network connectivity issues
- Invalid API responses

**Solutions:**
1. Check API server logs
2. Verify network connectivity
3. Try refreshing the dashboard
4. Check that all required services are running

### Not seeing data after logging in

**Possible causes:**
- Caching issues
- Race conditions in data loading
- Token expiration issues

**Solutions:**
1. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. Check if token is present in localStorage
3. Check expiration time of token
4. Try logging out and back in

### Dashboard shows empty stats

**Possible causes:**
- No data exists yet
- Permission issues
- API filtering returning empty results

**Solutions:**
1. Create bots, schedules, and plans
2. Check user permissions
3. Verify API is returning expected data format

## Debugging Tips

### Browser Console Commands

Check authentication status:
```javascript
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
if (token) {
  console.log('Token preview:', token.substring(0, 10) + '...');
}

const user = localStorage.getItem('user');
console.log('User exists:', !!user);
if (user) {
  console.log('User data:', JSON.parse(user));
}

const expiresAt = localStorage.getItem('expiresAt');
console.log('Token expires at:', expiresAt);
console.log('Current time:', Date.now());
console.log('Is expired:', expiresAt && parseInt(expiresAt, 10) < Date.now());
```

Test API connectivity:
```javascript
fetch('https://api-local.tradernickel.com/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(res => res.json())
.then(data => console.log('API response:', data))
.catch(err => console.error('API error:', err));
```

## Manual Testing Steps

1. Log out completely
2. Clear localStorage (Application tab > Storage > Local Storage > Right-click > Clear)
3. Navigate to login page
4. Log in with username "nickelnick" and password "nickels"
5. Verify redirect to dashboard
6. Check that dashboard loads data within 5 seconds
7. Click refresh button to verify data reloading
8. Navigate to other pages from dashboard links
9. Return to dashboard to verify state persistence 