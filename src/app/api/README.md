# TraderNickel API

This directory contains the API endpoints for the TraderNickel application.

## Postman Collection

A Postman collection is available for testing these API endpoints. You can find it in the `/postman` directory at the root of the project.

To use the Postman collection:
1. Import the `TraderNickel_API_Collection.json` file into Postman
2. Import the `TraderNickel_Local_Environment.json` environment file
3. Select the "TraderNickel Local" environment from the dropdown
4. Start using the collection to test the API endpoints

See the README in the `/postman` directory for more details.

## Authentication

All API endpoints (except for the test endpoints) require JWT authentication via the Authorization header.

Example:
```
Authorization: Bearer <token>
```

You can generate a valid JWT token for testing purposes using the `/api/test-token` endpoint.

## Endpoints

### User Brokers

- `GET /api/user-brokers` - Get all user brokers
- `GET /api/user-brokers?id=1` - Get a specific user broker
- `POST /api/user-brokers` - Create a new user broker
- `PUT /api/user-brokers?id=1` - Update a specific user broker
- `DELETE /api/user-brokers?id=1` - Delete a specific user broker

### Test Endpoints

- `GET /api/test` - Test the API server
- `GET /api/test-token` - Generate a valid JWT token
- `GET /api/test-jwt` - Test JWT verification
- `GET /api/simple-page` - Test the API server with a simple response
- `GET /api/simple/:id` - Test dynamic routes with a simple response
- `GET /api/test-id/:id` - Test dynamic routes with an ID parameter
- `GET /api/user-brokers-query` - Get all user brokers (alternative endpoint)
- `GET /api/user-brokers-query?id=1` - Get a specific user broker (alternative endpoint)

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
- `AuthError` - Authentication error (401)
- `ValidationError` - Validation error (400)
- `JWTVerificationError` - JWT verification error (401)
- `UnknownError` - Unknown error (500)

## Response Headers

All responses include the following headers:
- `vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url`
- `content-type: application/json`

Error responses also include:
- `x-error: 1` 