# TraderNickel API Postman Collection

This directory contains a Postman collection for testing the TraderNickel API endpoints.

## Getting Started

1. Install [Postman](https://www.postman.com/downloads/)
2. Import the `TraderNickel_API_Collection.json` file into Postman
3. Import the `TraderNickel_Local_Environment.json` environment file
4. Select the "TraderNickel Local" environment from the dropdown in the top right corner
5. Start using the collection to test the API endpoints

## Environment Variables

The collection uses the following environment variables:

- `baseUrl`: The base URL of the API server (default: `http://localhost:3000`)
- `jwtToken`: The JWT token for authentication (you can get this from the `/api/test-token` endpoint)

## Authentication

Most endpoints require JWT authentication. To get a valid JWT token:

1. Send a request to the "Generate JWT Token" endpoint (`GET /api/test-token`)
2. The token will be automatically set to the `jwtToken` environment variable
3. You can now use any of the authenticated endpoints

> **Note**: The collection includes a script that automatically sets the JWT token in your environment when you call the "Generate JWT Token" endpoint. You don't need to manually copy and set the token.

## Endpoints

The collection is organized into the following folders:

### Authentication

- `GET /api/test-token`: Generates a valid JWT token for testing purposes
- `GET /api/test-jwt`: Tests JWT verification with the provided token

### User Brokers

- `GET /api/user-brokers`: Retrieves all user brokers
- `GET /api/user-brokers?id=1`: Retrieves a specific user broker by ID
- `POST /api/user-brokers`: Creates a new user broker
- `PUT /api/user-brokers?id=1`: Updates an existing user broker
- `DELETE /api/user-brokers?id=1`: Deletes a user broker

### Test Endpoints

- `GET /api/test`: Tests if the API server is working
- `GET /api/simple-page`: Simple endpoint for testing the API server
- `GET /api/simple/123`: Tests dynamic routes with a simple response
- `GET /api/test-id/123`: Tests dynamic routes with an ID parameter
- `GET /api/user-brokers-query?id=1`: Alternative endpoint for retrieving user brokers

## Error Handling

All endpoints return detailed error responses with the following structure:

```json
{
  "error": {
    "type": "ErrorType",
    "message": "Error message",
    "details": {
      // Additional error details
    }
  }
}
```

Common error types:
- `AuthError`: Authentication error (401)
- `ValidationError`: Validation error (400)
- `JWTVerificationError`: JWT verification error (401)
- `UnknownError`: Unknown error (500)

## Response Headers

All responses include the following headers:
- `vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url`
- `content-type: application/json`

Error responses also include:
- `x-error: 1` 