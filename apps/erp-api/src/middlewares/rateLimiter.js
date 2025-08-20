/* Yaba-IT/KizunaTravelOS
 *
 * apps/erp-api/src/middlewares/rateLimiter.js - Rate limiting middleware
 * Prevents abuse by limiting request frequency
 *
 * coded by farid212@Yaba-IT!
 */

const fs = require('fs');
const path = require('path');

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Helper function to write log
const writeLog = (filename, data) => {
  try {
    const logFile = path.join(logsDir, filename);
    const logEntry = JSON.stringify({
      ...data,
      timestamp: new Date().toISOString()
    }, null, 2);
    
    fs.appendFileSync(logFile, logEntry + '\n', 'utf8');
  } catch (error) {
    // Silently fail if logging fails - don't break the rate limiting functionality
    console.warn('Rate limiter logging failed:', error.message);
  }
};

// Helper function to get client identifier
const getClientIdentifier = (req) => {
  // Use IP address as primary identifier
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress || 
             req.connection.socket?.remoteAddress || 
             'unknown';
  
  // If user is authenticated, include user ID for more granular control
  if (req.user?.id) {
    return `${ip}:${req.user.id}`;
  }
  
  return ip;
};

// Helper function to clean expired entries
const cleanExpiredEntries = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.lastReset > value.windowMs) {
      rateLimitStore.delete(key);
    }
  }
};

// Clean expired entries every minute
setInterval(cleanExpiredEntries, 60000);

// Rate limiting middleware factory
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 100, // max requests per window
    message = 'Too many requests from this IP, please try again later.',
    statusCode = 429,
    // skipSuccessfulRequests = false,
    // skipFailedRequests = false,
    keyGenerator = getClientIdentifier,
    handler = null,
    onLimitReached = null,
    standardHeaders = true,
    legacyHeaders = false
  } = options;

  return (req, res, next) => {
    const startTime = Date.now();
    const clientId = keyGenerator(req);
    const now = Date.now();
    
    // Get or create rate limit entry for this client
    let clientData = rateLimitStore.get(clientId);
    
    if (!clientData) {
      clientData = {
        count: 0,
        resetTime: now + windowMs,
        lastReset: now,
        windowMs
      };
      rateLimitStore.set(clientId, clientData);
    }
    
    // Check if window has expired
    if (now > clientData.resetTime) {
      clientData.count = 0;
      clientData.resetTime = now + windowMs;
      clientData.lastReset = now;
    }
    
    // Increment request count
    clientData.count++;
    
    // Check if limit exceeded
    const isLimitExceeded = clientData.count > max;
    
    // Log rate limit data
    const rateLimitData = {
      type: 'RATE_LIMIT_CHECK',
      clientId,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userId: req.user?.id,
      userEmail: req.user?.email,
      method: req.method,
      url: req.url,
      count: clientData.count,
      max,
      windowMs,
      resetTime: new Date(clientData.resetTime).toISOString(),
      isLimitExceeded,
      timestamp: new Date().toISOString()
    };
    
    writeLog('rate-limit.log', rateLimitData);
    
    if (isLimitExceeded) {
      // Log rate limit exceeded
      const exceededData = {
        type: 'RATE_LIMIT_EXCEEDED',
        clientId,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userId: req.user?.id,
        userEmail: req.user?.email,
        method: req.method,
        url: req.url,
        count: clientData.count,
        max,
        windowMs,
        resetTime: new Date(clientData.resetTime).toISOString(),
        timestamp: new Date().toISOString()
      };
      
      writeLog('rate-limit-exceeded.log', exceededData);
      console.error('Rate limit exceeded:', exceededData);
      
      // Call custom handler if provided
      if (handler) {
        return handler(req, res, next);
      }
      
      // Set rate limit headers
      if (standardHeaders) {
        res.set('X-RateLimit-Limit', max);
        res.set('X-RateLimit-Remaining', 0);
        res.set('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString());
      }
      
      if (legacyHeaders) {
        res.set('X-RateLimit-Limit', max);
        res.set('X-RateLimit-Remaining', 0);
        res.set('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));
      }
      
      // Call onLimitReached callback if provided
      if (onLimitReached) {
        onLimitReached(req, res, next, options);
      }
      
      return res.status(statusCode).json({
        error: 'Too Many Requests',
        message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        limit: max,
        windowMs: Math.ceil(windowMs / 1000)
      });
    }
    
    // Set rate limit headers for successful requests
    if (standardHeaders) {
      res.set('X-RateLimit-Limit', max);
      res.set('X-RateLimit-Remaining', Math.max(0, max - clientData.count));
      res.set('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString());
    }
    
    if (legacyHeaders) {
      res.set('X-RateLimit-Limit', max);
      res.set('X-RateLimit-Remaining', Math.max(0, max - clientData.count));
      res.set('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));
    }
    
    // Store updated data
    rateLimitStore.set(clientId, clientData);
    
    // Log successful rate limit check
    const successData = {
      type: 'RATE_LIMIT_SUCCESS',
      clientId,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userId: req.user?.id,
      userEmail: req.user?.email,
      method: req.method,
      url: req.url,
      count: clientData.count,
      max,
      remaining: max - clientData.count,
      windowMs,
      resetTime: new Date(clientData.resetTime).toISOString(),
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - startTime}ms`
    };
    
    writeLog('rate-limit-success.log', successData);
    
    next();
  };
};

// Predefined rate limiters for different use cases
const rateLimiters = {
  // Strict rate limiter for authentication endpoints
  strict: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
    statusCode: 429
  }),
  
  // Standard rate limiter for general endpoints
  standard: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Too many requests from this IP, please try again later.',
    statusCode: 429
  }),
  
  // Loose rate limiter for public endpoints
  loose: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes
    message: 'Too many requests from this IP, please try again later.',
    statusCode: 429
  }),
  
  // API rate limiter for authenticated users
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes
    message: 'API rate limit exceeded, please try again later.',
    statusCode: 429,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id || getClientIdentifier(req);
    }
  })
};

module.exports = {
  createRateLimiter,
  rateLimiters,
  rateLimitStore, // Export for testing
  // Convenience function to apply rate limiting to specific routes
  applyRateLimiting: (app, routes) => {
    Object.entries(routes).forEach(([path, limiter]) => {
      if (typeof limiter === 'string' && rateLimiters[limiter]) {
        app.use(path, rateLimiters[limiter]);
      } else if (typeof limiter === 'function') {
        app.use(path, limiter);
      }
    });
  }
};
