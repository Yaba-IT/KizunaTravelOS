/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/middlewares/auth.js - Authentication middleware
* Validates JWT tokens and authenticates user requests
*
* coded by farid212@Yaba-IT!
*/

const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../configs/config.js');

// Enhanced authentication middleware with JWT and comprehensive logging
module.exports = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      const errorData = {
        type: 'AUTH_ERROR',
        error: 'No token provided',
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };
      
      // Log authentication failure
      console.error('Authentication failed:', errorData);
      
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No authorization token provided',
        code: 'NO_TOKEN'
      });
    }

    // Validate token format (basic check)
    if (token.length < 10) {
      const errorData = {
        type: 'AUTH_ERROR',
        error: 'Invalid token format',
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };
      
      console.error('Token format invalid:', errorData);
      
      return res.status(401).json({ 
        error: 'Invalid token format',
        message: 'The provided token is malformed',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });
    } catch (jwtError) {
      const errorData = {
        type: 'AUTH_ERROR',
        error: 'JWT verification failed',
        jwtError: jwtError.message,
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };
      
      console.error('JWT verification failed:', errorData);
      
      let errorMessage = 'Token verification failed';
      let errorCode = 'TOKEN_VERIFICATION_FAILED';
      
      if (jwtError.name === 'TokenExpiredError') {
        errorMessage = 'Token has expired';
        errorCode = 'TOKEN_EXPIRED';
      } else if (jwtError.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid token signature';
        errorCode = 'INVALID_TOKEN_SIGNATURE';
      } else if (jwtError.name === 'NotBeforeError') {
        errorMessage = 'Token not yet valid';
        errorCode = 'TOKEN_NOT_VALID';
      }
      
      return res.status(401).json({ 
        error: 'Invalid token',
        message: errorMessage,
        code: errorCode
      });
    }

    // Check if token has required claims
    if (!decoded.userId || !decoded.email) {
      const errorData = {
        type: 'AUTH_ERROR',
        error: 'Token missing required claims',
        decoded: { ...decoded, userId: decoded.userId, email: decoded.email },
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };
      
      console.error('Token missing required claims:', errorData);
      
      return res.status(401).json({ 
        error: 'Invalid token claims',
        message: 'Token is missing required user information',
        code: 'MISSING_TOKEN_CLAIMS'
      });
    }

    // Check if token is expired (additional check)
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      const errorData = {
        type: 'AUTH_ERROR',
        error: 'Token expired',
        decoded: { ...decoded, exp: decoded.exp, currentTime },
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };
      
      console.error('Token expired:', errorData);
      
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'The provided token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Create user object from JWT claims
    const user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user',
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      // Add any other claims from the token
      ...decoded
    };

    // Add user info to request
    req.user = user;
    req.authToken = token;
    req.authTime = startTime;
    req.jwtPayload = decoded;

    // Log successful authentication
    const authData = {
      type: 'AUTH_SUCCESS',
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - startTime}ms`
    };
    
    console.log('Authentication successful:', authData);

    next();
  } catch (error) {
    const errorData = {
      type: 'AUTH_EXCEPTION',
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    };
    
    console.error('Authentication exception:', errorData);
    
    return res.status(500).json({ 
      error: 'Authentication service error',
      message: 'An unexpected error occurred during authentication',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};
