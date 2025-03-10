# TraderNickel

A modern trading automation platform for algorithmic trading.

## Features

- Dashboard with real-time trading statistics
- Trading bot management
- Schedule trading operations
- Trading plans configuration
- Secure API with token-based authentication
- User management

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Material UI
- **Backend**: Node.js, Express, PostgreSQL
- **Authentication**: JWT tokens

## Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- PostgreSQL 13.x or higher

## Setup & Installation

### Backend API

1. Clone the API repository:
   ```
   git clone https://github.com/yourusername/tradernickel-api.git
   cd tradernickel-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your database credentials and other settings

4. Run database migrations:
   ```
   npm run migrate
   ```

5. Start the API server:
   ```
   npm run dev
   ```
   The API will be available at `https://api-local.tradernickel.com`

### Frontend

1. Clone the frontend repository:
   ```
   git clone https://github.com/yourusername/tradernickel.git
   cd tradernickel
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env.local
   ```
   Make sure `NEXT_PUBLIC_API_URL` points to your API server (e.g., `https://api-local.tradernickel.com`)

4. Start the development server:
   ```
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## Testing

### Manual Testing

To manually test the application:

1. Start both the API and frontend servers
2. Navigate to `http://localhost:3000/login`
3. Log in with the test account:
   - Username: `nickelnick`
   - Password: `nickels`
4. Explore the dashboard and other pages

### Automated Testing

To run E2E tests for the dashboard:

```
npm run test:e2e
```

Or run the dashboard test fix script to automatically identify and fix issues:

```
node scripts/dashboard-test-fix.js
```

## Troubleshooting

### Authentication Issues

If you're having trouble logging in:

1. Check that the API server is running
2. Ensure your network/firewall allows connections to the API
3. Inspect browser console for error messages
4. Clear local storage by opening browser dev tools and running:
   ```javascript
   localStorage.clear()
   ```

### API Connection Issues

If the frontend can't connect to the API:

1. Verify the API server is running
2. Check your `.env.local` file to ensure `NEXT_PUBLIC_API_URL` is correct
3. Make sure CORS is properly configured on the API server

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Material UI](https://mui.com/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)

## API Keys

The application supports API keys for long-term authentication to programmatically access the API. This is useful for integrations, scripts, and third-party applications.

### API Key Features

- Generate personal API keys with custom names
- Set optional expiration dates (or create non-expiring keys)
- Revoke API keys at any time
- View key usage information

### Using API Keys

To use an API key, include it in the `Authorization` header of your HTTP requests:

```
Authorization: Bearer YOUR_API_KEY
```

API keys provide the same level of access as your user account. Keep them secure and do not expose them in client-side code.

### Managing API Keys

API keys can be managed in the account section under "Manage API Keys". From there, you can:

1. Generate new API keys
2. View existing API keys
3. Delete API keys when they're no longer needed

Once an API key is generated, the full key is shown only once. Make sure to copy it immediately as it cannot be retrieved later. 