/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/middlewares/testAuth.js - Test authentication middleware
* Provides mock authentication for testing purposes
*
* coded by farid212@Yaba-IT!
*/

// Test authentication middleware for development and testing
module.exports = (req, res, next) => {
  // Skip authentication in test environment
  if (process.env.NODE_ENV === 'test') {
    // Create a mock user for testing
    req.user = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'customer',
      firstName: 'Test',
      lastName: 'User'
    };
    req.authToken = 'test-token';
    req.authTime = Date.now();
    req.jwtPayload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'customer'
    };
    return next();
  }

  // For non-test environments, use the real auth middleware
  const realAuth = require('./auth.js');
  return realAuth(req, res, next);
};

// Test authorization middleware
module.exports.authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Skip authorization in test environment
    if (process.env.NODE_ENV === 'test') {
      req.userRole = req.user?.role || 'customer';
      req.authorizedRoles = allowedRoles;
      req.authorizationTime = Date.now();
      return next();
    }

    // For non-test environments, use the real authorize middleware
    const realAuthorize = require('./authorize.js');
    return realAuthorize(allowedRoles)(req, res, next);
  };
};

// Helper function to set test user role
module.exports.setTestUserRole = (role) => {
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'test' && req.user) {
      req.user.role = role;
      req.jwtPayload.role = role;
    }
    next();
  };
};
