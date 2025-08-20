# ERP API Middleware Documentation

This document describes the comprehensive middleware system implemented in the ERP API, designed for MERN/PERN stack applications with extensive logging, security, and validation capabilities.

## Table of Contents

1. [Overview](#overview)
2. [Logger Middleware](#logger-middleware)
3. [Authentication Middleware](#authentication-middleware)
4. [Authorization Middleware](#authorization-middleware)
5. [Access Control Middleware](#access-control-middleware)
6. [Rate Limiting Middleware](#rate-limiting-middleware)
7. [Validation Middleware](#validation-middleware)
8. [Configuration](#configuration)
9. [Usage Examples](#usage-examples)
10. [Testing](#testing)

## Overview

The middleware system provides a comprehensive solution for:
- **Request/Response Logging**: Complete audit trail of all API interactions
- **Security**: Authentication, authorization, rate limiting, and threat detection
- **Validation**: Data validation with customizable schemas
- **Performance Monitoring**: Response time tracking and slow request detection
- **Error Handling**: Centralized error logging and handling

## Logger Middleware

### Features
- **Request Logging**: Captures all incoming request details
- **Response Logging**: Tracks response times, status codes, and data
- **Performance Monitoring**: Identifies slow requests (>1 second)
- **Security Logging**: Detects suspicious patterns and potential attacks
- **Error Logging**: Comprehensive error tracking with context

### Captured Data
- **Client Information**: IP address, user agent, language preferences, timezone
- **Request Details**: Method, URL, headers, body, query parameters
- **Response Metrics**: Status code, response time, response size
- **Security Events**: Suspicious patterns, attack attempts
- **User Context**: User ID, role, authentication status

### Log Files
- `requests.log` - All incoming requests
- `responses.log` - All API responses
- `combined.log` - Request/response pairs for analysis
- `errors.log` - Error events and exceptions
- `performance.log` - Performance metrics
- `slow-requests.log` - Requests taking >1 second
- `security.log` - Security-related events
- `security-alerts.log` - Suspicious activity alerts

### Usage
```javascript
const { applyAllLogging } = require('./middlewares/logger');

// Apply all logging middleware
applyAllLogging(app);
```

## Authentication Middleware

### Features
- **JWT Token Validation**: Secure token verification with configurable options
- **Comprehensive Error Handling**: Detailed error messages and codes
- **Security Logging**: Authentication attempts and failures
- **Token Claims Validation**: Ensures required user information is present
- **Performance Tracking**: Authentication timing metrics

### Configuration
```javascript
// config.js
module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
    refreshExpiresIn: '7d',
    issuer: 'kizuna-travel-os',
    audience: 'kizuna-travel-users'
  }
};
```

### Usage
```javascript
const auth = require('./middlewares/auth');

// Protect routes
app.use('/protected', auth);
```

### Error Codes
- `NO_TOKEN` - Missing authorization token
- `INVALID_TOKEN_FORMAT` - Malformed token
- `TOKEN_VERIFICATION_FAILED` - JWT verification error
- `TOKEN_EXPIRED` - Expired token
- `INVALID_TOKEN_SIGNATURE` - Invalid signature
- `TOKEN_NOT_VALID` - Token not yet valid
- `MISSING_TOKEN_CLAIMS` - Required claims missing

## Authorization Middleware

### Features
- **Role-Based Access Control**: Flexible role validation
- **Multiple Role Support**: Array or single role validation
- **User Metadata Fallback**: Supports nested role structures
- **Comprehensive Logging**: Authorization attempts and results
- **Request Enhancement**: Adds authorization context to requests

### Usage
```javascript
const authorize = require('./middlewares/authorize');

// Single role
app.get('/admin', authorize('admin'), adminController);

// Multiple roles
app.get('/management', authorize(['admin', 'manager']), managementController);
```

### Error Codes
- `USER_NOT_AUTHENTICATED` - User not authenticated
- `NO_ROLE_ASSIGNED` - User has no role
- `INSUFFICIENT_PERMISSIONS` - Role not authorized

## Access Control Middleware

### Features
- **Data Ownership Validation**: Ensures users can only access their own data
- **Parameter Validation**: Validates userId parameters
- **Comprehensive Logging**: Access control attempts and results
- **Request Enhancement**: Adds access control context

### Usage
```javascript
const canAccessOwnData = require('./middlewares/canAccessOwnData');

// Protect user-specific routes
app.get('/users/:userId/profile', canAccessOwnData, profileController);
```

### Error Codes
- `USER_NOT_AUTHENTICATED` - User not authenticated
- `MISSING_USER_ID` - Missing userId parameter
- `INVALID_USER_ID` - Invalid userId format
- `UNAUTHORIZED_DATA_ACCESS` - Access denied

## Rate Limiting Middleware

### Features
- **Flexible Rate Limiting**: Configurable windows and limits
- **Client Identification**: IP-based or user-based limiting
- **Multiple Strategies**: Strict, standard, loose, and API-specific limits
- **Header Support**: Standard and legacy rate limit headers
- **Comprehensive Logging**: Rate limit events and violations

### Predefined Limiters
- **strict**: 5 requests per 15 minutes (authentication endpoints)
- **standard**: 100 requests per 15 minutes (general endpoints)
- **loose**: 1000 requests per 15 minutes (public endpoints)
- **api**: 1000 requests per 15 minutes (authenticated users)

### Usage
```javascript
const { rateLimiters, createRateLimiter } = require('./middlewares/rateLimiter');

// Use predefined limiters
app.use('/auth', rateLimiters.strict);
app.use('/api', rateLimiters.api);

// Create custom limiter
const customLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Custom rate limit message'
});
app.use('/custom', customLimiter);
```

### Configuration Options
- `windowMs` - Time window in milliseconds
- `max` - Maximum requests per window
- `message` - Custom error message
- `statusCode` - HTTP status code for violations
- `keyGenerator` - Custom client identification function
- `handler` - Custom violation handler
- `onLimitReached` - Callback when limit is exceeded

## Validation Middleware

### Features
- **Schema-Based Validation**: Flexible validation schemas
- **Multiple Data Sources**: Body, query, or parameters validation
- **Comprehensive Rules**: Type, pattern, length, range validation
- **Nested Object Support**: Deep validation of complex structures
- **Array Validation**: Validate array contents
- **Custom Error Messages**: Configurable error descriptions

### Predefined Schemas
- **user**: Email, password, first name, last name validation
- **profile**: Phone, date of birth, address validation
- **booking**: Journey ID, dates, participants validation

### Usage
```javascript
const { validationMiddleware } = require('./middlewares/validation');

// Use predefined validation
app.post('/users', validationMiddleware.validateUser, userController);
app.post('/profile', validationMiddleware.validateProfile, profileController);

// Create custom validation
const customValidation = createValidationMiddleware('customSchema', { source: 'body' });
app.post('/custom', customValidation, customController);
```

### Validation Rules
- **required**: Field must be present
- **type**: Data type validation (string, number, boolean, object, array)
- **pattern**: Regex pattern validation
- **minLength/maxLength**: String length constraints
- **min/max**: Numeric range constraints
- **properties**: Nested object validation
- **items**: Array item validation

## Configuration

### Environment Variables
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=kizuna-travel-os
JWT_AUDIENCE=kizuna-travel-users

# Database Configuration
MONGO_URI=mongodb://localhost:27017/erp
POSTGRES_URI=postgresql://user:pass@localhost:5432/erp

# Server Configuration
PORT=4000
NODE_ENV=development
CORS_ORIGIN=*

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging Configuration
LOG_LEVEL=info
ENABLE_FILE_LOGGING=true
LOG_DIRECTORY=logs
MAX_LOG_SIZE=10m
MAX_LOG_FILES=5
```

## Usage Examples

### Complete Route Protection
```javascript
const express = require('express');
const auth = require('./middlewares/auth');
const authorize = require('./middlewares/authorize');
const canAccessOwnData = require('./middlewares/canAccessOwnData');
const { validationMiddleware } = require('./middlewares/validation');
const { rateLimiters } = require('./middlewares/rateLimiter');

const router = express.Router();

// Apply rate limiting
router.use(rateLimiters.standard);

// Protected route with validation
router.post('/users/:userId/profile',
  auth, // Authentication
  authorize(['user', 'admin']), // Authorization
  canAccessOwnData, // Access control
  validationMiddleware.validateProfile, // Validation
  profileController.update
);

module.exports = router;
```

### Custom Validation Schema
```javascript
const { createValidationMiddleware } = require('./middlewares/validation');

// Define custom schema
const customSchema = {
  title: {
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 100
  },
  price: {
    required: true,
    type: 'number',
    min: 0,
    max: 10000
  },
  tags: {
    required: false,
    type: 'array',
    items: {
      type: 'string',
      maxLength: 20
    }
  }
};

// Create validation middleware
const validateCustom = createValidationMiddleware('custom', { source: 'body' });

// Use in route
app.post('/custom', validateCustom, customController);
```

### Custom Rate Limiter
```javascript
const { createRateLimiter } = require('./middlewares/rateLimiter');

// Create custom rate limiter for premium users
const premiumLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  keyGenerator: (req) => {
    // Use user ID for premium users, IP for others
    return req.user?.isPremium ? `premium:${req.user.id}` : req.ip;
  },
  message: 'Premium rate limit exceeded'
});

app.use('/premium', premiumLimiter);
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- **Logger Middleware**: 100% coverage of all functions
- **Authentication Middleware**: Comprehensive JWT validation testing
- **Authorization Middleware**: Role validation and edge cases
- **Access Control Middleware**: Data ownership validation
- **Rate Limiting Middleware**: Limit enforcement and cleanup
- **Validation Middleware**: Schema validation and error handling

### Test Structure
- Unit tests for individual functions
- Integration tests for middleware chains
- Edge case testing for error conditions
- Performance testing for timing requirements
- Mock testing for external dependencies

## Security Features

### Threat Detection
- **Directory Traversal**: Detects `../` patterns
- **XSS Attempts**: Identifies `<script>` tags
- **SQL Injection**: Detects `UNION SELECT` patterns
- **Code Injection**: Identifies `eval()` calls

### Rate Limiting
- **IP-based Limiting**: Prevents abuse from single sources
- **User-based Limiting**: Granular control for authenticated users
- **Endpoint-specific Limits**: Different limits for different routes
- **Automatic Cleanup**: Memory management for expired entries

### Authentication Security
- **JWT Best Practices**: Secure token handling
- **Token Expiration**: Automatic token invalidation
- **Claims Validation**: Ensures required user data
- **Error Handling**: Secure error messages

## Performance Considerations

### Logging Performance
- **Asynchronous Writing**: Non-blocking log operations
- **File Rotation**: Automatic log file management
- **Size Limits**: Prevents log file bloat
- **Selective Logging**: Configurable log levels

### Rate Limiting Performance
- **In-Memory Storage**: Fast access for rate limit data
- **Periodic Cleanup**: Automatic memory management
- **Efficient Algorithms**: Optimized counting and checking
- **Minimal Overhead**: Low impact on request processing

### Validation Performance
- **Schema Caching**: Reuses validation schemas
- **Early Exit**: Stops validation on first error
- **Efficient Patterns**: Optimized regex and validation logic
- **Minimal Memory**: Low memory footprint

## Monitoring and Debugging

### Log Analysis
- **Request Patterns**: Identify usage trends
- **Performance Issues**: Find slow endpoints
- **Security Events**: Monitor for attacks
- **Error Tracking**: Debug application issues

### Health Checks
- **Middleware Status**: Verify middleware health
- **Performance Metrics**: Monitor response times
- **Error Rates**: Track failure frequencies
- **Resource Usage**: Monitor memory and CPU

### Debugging Tools
- **Detailed Logs**: Comprehensive request/response data
- **Error Context**: Full error information with stack traces
- **Performance Data**: Response time tracking
- **Security Alerts**: Immediate threat notifications

## Best Practices

### Implementation
1. **Order Matters**: Apply middleware in correct sequence
2. **Error Handling**: Always include error handling middleware
3. **Logging**: Enable comprehensive logging in production
4. **Rate Limiting**: Use appropriate limits for different endpoints
5. **Validation**: Validate all user input

### Security
1. **Environment Variables**: Use secure configuration
2. **Token Management**: Implement proper JWT handling
3. **Input Validation**: Validate all incoming data
4. **Rate Limiting**: Prevent abuse and attacks
5. **Monitoring**: Monitor for security events

### Performance
1. **Middleware Order**: Optimize middleware sequence
2. **Caching**: Cache validation schemas and rate limit data
3. **Async Operations**: Use non-blocking operations
4. **Resource Management**: Clean up expired data
5. **Monitoring**: Track performance metrics

## Troubleshooting

### Common Issues
1. **Rate Limit Errors**: Check rate limit configuration
2. **Validation Failures**: Verify data format and schema
3. **Authentication Errors**: Check JWT configuration and tokens
4. **Logging Issues**: Verify file permissions and disk space
5. **Performance Problems**: Monitor middleware execution times

### Debug Steps
1. **Check Logs**: Review detailed log files
2. **Verify Configuration**: Confirm environment variables
3. **Test Middleware**: Use unit tests to isolate issues
4. **Monitor Performance**: Track response times and errors
5. **Check Dependencies**: Verify package versions and compatibility

## Conclusion

This middleware system provides a robust foundation for building secure, scalable, and maintainable APIs. With comprehensive logging, security features, and validation capabilities, it ensures that your application can handle production workloads while maintaining security and performance standards.

For additional support or questions, refer to the test files for implementation examples and the configuration files for setup instructions.
