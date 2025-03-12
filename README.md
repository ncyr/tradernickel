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

## API Documentation

The application provides a RESTful API for interacting with the platform programmatically. The API endpoints are documented in the `/src/app/api/README.md` file.

### API Endpoints

The main API endpoints include:

- User Brokers API for managing trading broker connections
- Authentication endpoints for generating and verifying JWT tokens
- Test endpoints for development and debugging

### Postman Collection

A Postman collection is available for testing the API endpoints. You can find it in the `/postman` directory at the root of the project.

To use the Postman collection:
1. Import the `TraderNickel_API_Collection.json` file into Postman
2. Import the `TraderNickel_Local_Environment.json` environment file
3. Select the "TraderNickel Local" environment from the dropdown
4. Start using the collection to test the API endpoints

The collection includes scripts that automatically handle authentication by setting the JWT token in your environment when you call the token generation endpoint.

See the README in the `/postman` directory for more details.

# TraderNickel API

This repository contains the TraderNickel API, which provides endpoints for managing trading bots, orders, and broker connections.

## Features

- Authentication with JWT tokens
- Bot management with different plans and configurations
- Order creation and management
- Broker integration

## API Endpoints

### Authentication

- `POST /api/auth/token`: Generate a JWT token for authentication
- `GET /api/auth/token/verify`: Verify a JWT token

### Brokers

- `GET /api/brokers`: Get all available brokers
- `POST /api/brokers`: Create a new broker

### User Brokers

- `GET /api/user-brokers`: Get all user brokers
- `GET /api/user-brokers/:id`: Get a specific user broker
- `POST /api/user-brokers`: Create a new user broker
- `PUT /api/user-brokers/:id`: Update a user broker
- `DELETE /api/user-brokers/:id`: Delete a user broker

### Bots

- `GET /api/bots`: Get all bots for the authenticated user
- `GET /api/bots/:id`: Get a specific bot
- `POST /api/bots`: Create a new bot
- `PUT /api/bots/:id`: Update a bot
- `DELETE /api/bots/:id`: Delete a bot
- `POST /api/bots/:id/token`: Regenerate a bot's token

### Orders

- `GET /api/orders`: Get all orders for the authenticated user
- `GET /api/orders/:id`: Get a specific order
- `DELETE /api/orders/:id`: Cancel an order
- `POST /api/order/create`: Create a new order using a bot token

## Bot Configuration

Bots are configured with plans that define their capabilities and limitations:

### Plan Configuration

- `maxOrdersPerDay`: Maximum number of orders the bot can place per day
- `maxPositionSize`: Maximum position size the bot can open
- `allowedDirections`: Allowed trade directions (`long`, `short`)
- `allowedSymbols`: Allowed trading symbols
- `allowedOrderTypes`: Allowed order types
- `defaultOrderType`: Default order type if not specified
- `defaultQuantity`: Default quantity if not specified
- `takeProfitTicks`: Default take profit in ticks
- `stopLossTicks`: Default stop loss in ticks

### Order Types

The following order types are supported:

- `Market`: Market order executed at the current market price
- `Limit`: Limit order executed at a specified price or better
- `Stop`: Stop order that becomes a market order when the stop price is reached
- `StopLimit`: Stop limit order that becomes a limit order when the stop price is reached
- `MIT`: Market If Touched order
- `QTS`: Quote Trading System order
- `TrailingStop`: Stop order that adjusts with market movement
- `TrailingStopLimit`: Stop limit order that adjusts with market movement

## Creating Orders with Bot Tokens

To create an order using a bot token, send a POST request to `/api/order/create` with the following headers:

```
Content-Type: application/json
X-Bot-Token: your_bot_token
```

The request body should include:

```json
{
  "symbol": "ES",
  "quantity": 1,
  "price": 5000.50,
  "direction": "long",
  "orderType": "Market",
  "takeProfitTicks": 8,
  "stopLossTicks": 4,
  "metadata": {
    "strategy": "momentum",
    "signal_strength": 0.85
  }
}
```

If `orderType`, `takeProfitTicks`, or `stopLossTicks` are not specified, the default values from the bot's plan will be used.

## Validation

Orders are validated against the bot's plan:

1. The symbol must be in the bot's `allowedSymbols`
2. The direction must be in the bot's `allowedDirections`
3. The position size (quantity * price) must not exceed the bot's `maxPositionSize`
4. The order type must be in the bot's `allowedOrderTypes`
5. The bot must not exceed its `maxOrdersPerDay` limit

## Development

### Environment Variables

Create a `.env.local` file with the following variables:

```
JWT_SECRET=your_jwt_secret
```

### Running the API

```bash
npm install
npm run dev
```

The API will be available at `http://localhost:3000/api`. 