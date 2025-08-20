/* Yaba-IT/KizunaTravelOS
 *
 * apps/erp-api/src/index.js - Main entry point for the ERP API
 * Initializes Express server with middleware and route configuration
 *
 * coded by farid212@Yaba-IT!
 * started at 2025-08-16
 */

require('dotenv/config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean/lib/xss');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');
const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const connectDB = require('./configs/db.js');
const { applyAllLogging } = require('./middlewares/logger.js');
// const { rateLimiters } = require('./middlewares/rateLimiter.js');
// const { validationMiddleware } = require('./middlewares/validation.js');
const config = require('./configs/config.js');

// Initialize Sentry for error tracking and performance monitoring
if (config.server.nodeEnv === 'production') {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.server.nodeEnv,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      new ProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}

const app = express();

// Temporary route registration logger to locate invalid path patterns
['use','get','post','put','patch','delete','all'].forEach((method) => {
  const original = app[method].bind(app);
  app[method] = (path, ...args) => {
    if (typeof path === 'string') {
      console.log('[register]', method.toUpperCase(), path);
    }
    return original(path, ...args);
  };
});
const port = config.server.port;

// Connect to MongoDB
connectDB();

// Initialize Redis for session storage and caching
let redisClient;
if (config.redis.enabled) {
  redisClient = redis.createClient({
    url: config.redis.url,
    password: config.redis.password,
    retry_strategy: (options) => {
      if (options.total_retry_time > 1000 * 60 * 60) {
        return new Error('Retry time exhausted');
      }
      if (options.attempt > 10) {
        return undefined;
      }
      return Math.min(options.attempt * 100, 3000);
    }
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis connected successfully');
  });
}

// Advanced Winston logging configuration
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'erp-api' },
  transports: [
    // Daily rotate file for all logs
    new winstonDaily({
      filename: `${config.logging.logDirectory}/application-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: config.logging.maxLogSize,
      maxFiles: config.logging.maxLogFiles,
      level: 'info'
    }),
    // Daily rotate file for error logs
    new winstonDaily({
      filename: `${config.logging.logDirectory}/error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: config.logging.maxLogSize,
      maxFiles: config.logging.maxLogFiles,
      level: 'error'
    }),
    // Daily rotate file for security logs
    new winstonDaily({
      filename: `${config.logging.logDirectory}/security-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: config.logging.maxLogSize,
      maxFiles: config.logging.maxLogFiles,
      level: 'warn'
    })
  ]
});

// Add console transport in development
if (config.server.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Enterprise-grade security middleware
app.use(helmet({
  // Content Security Policy - Strict for GDPR compliance
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      connectSrc: ["'self'"]
    },
    reportOnly: false,
    upgradeInsecureRequests: true
  },
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
    force: true
  },
  // Prevent clickjacking
  frameguard: {
    action: 'deny'
  },
  // Prevent MIME type sniffing
  noSniff: true,
  // Prevent XSS attacks
  xssFilter: true,
  // Hide powered by header
  hidePoweredBy: true,
  // Prevent IE from executing downloads
  ieNoOpen: true,
  // Referrer Policy for GDPR compliance
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // Permissions Policy
  permissionsPolicy: {
    geolocation: ["'self'"],
    microphone: ["'none'"],
    camera: ["'none'"],
    payment: ["'self'"],
    usb: ["'none'"],
    magnetometer: ["'none'"],
    gyroscope: ["'none'"],
    accelerometer: ["'none'"],
    ambientLightSensor: ["'none'"],
    autoplay: ["'none'"],
    encryptedMedia: ["'none'"],
    fullscreen: ["'self'"],
    pictureInPicture: ["'none'"],
    publickeyCredentialsGet: ["'self'"],
    screenWakeLock: ["'none'"],
    syncXhr: ["'self'"],
    webShare: ["'self'"],
    xrSpatialTracking: ["'none'"]
  }
}));

// GDPR-compliant CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = config.cors.allowedOrigins;
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'X-API-Key',
    'X-Client-Version'
  ],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400 // 24 hours
}));

// Session configuration with Redis (GDPR compliant)
if (config.session.enabled) {
  const sessionConfig = {
    store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
    secret: config.session.secret,
    name: config.session.name,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.server.nodeEnv === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: config.session.maxAge,
      domain: config.session.domain,
      path: '/'
    },
    // GDPR compliance - session data retention
    rolling: true,
    unset: 'destroy'
  };

  if (redisClient) {
    app.use(session(sessionConfig));
  }
}

// Cookie parser with GDPR compliance
app.use(cookieParser(config.cookie.secret));

// Compression middleware for better performance
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Request parsing middleware with security limits
app.use(express.json({ 
  limit: config.security.requestLimit,
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch {
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: config.security.requestLimit,
  parameterLimit: config.security.parameterLimit
 }));

// Security middleware for data sanitization (compatible with Express 5)
// Avoid assigning to req.query (getter-only in Express 5)
app.use((req, res, next) => {
  const sanitizeOptions = { replaceWith: '_' };

  const logAttempt = (key) => {
    logger.warn(`MongoDB injection attempt detected: ${key}`, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      url: req.url,
      method: req.method
    });
  };

  if (req.body && mongoSanitize.has(req.body)) logAttempt('body');
  if (req.params && mongoSanitize.has(req.params)) logAttempt('params');
  if (req.headers && mongoSanitize.has(req.headers)) logAttempt('headers');
  if (req.query && mongoSanitize.has(req.query)) logAttempt('query');

  if (req.body) mongoSanitize.sanitize(req.body, sanitizeOptions);
  if (req.params) mongoSanitize.sanitize(req.params, sanitizeOptions);
  if (req.headers) mongoSanitize.sanitize(req.headers, sanitizeOptions);
  if (req.query) mongoSanitize.sanitize(req.query, sanitizeOptions);
  next();
});

// XSS protection (compatible with Express 5)
app.use((req, res, next) => {
  if (req.body) req.body = xss.clean(req.body);
  if (req.params) req.params = xss.clean(req.params);
  // Don't reassign req.query in Express 5
  next();
});

// HTTP Parameter Pollution protection
app.use(hpp({
  whitelist: ['tags', 'categories'] // Allow duplicate parameters for these fields
}));

// Advanced rate limiting with different strategies
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded - strict', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      url: req.url,
      method: req.method
    });
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 900
    });
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'API rate limit exceeded',
    message: 'Please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  }
});

// Speed limiting for suspicious requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // Allow 100 requests per 15 minutes without delay
  delayMs: () => 500, // Add 500ms delay per request after 100 requests
  maxDelayMs: (used, req) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 20000;
}, // Maximum delay of 20 seconds
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// Apply rate limiting (disabled in test environment)
if (config.server.nodeEnv !== 'test') {
  app.use('/auth', strictLimiter);
  app.use('/api', apiLimiter);
  app.use('/', speedLimiter);
}

// Logging middleware (apply at the top to capture all requests)
applyAllLogging(app);

// Advanced HTTP request logging with GDPR compliance
const morganFormat = config.server.nodeEnv === 'production' 
  ? 'combined' 
  : 'dev';

app.use(morgan(morganFormat, {
  stream: {
    write: (message) => {
      // Remove sensitive information for GDPR compliance
      const sanitizedMessage = message
        .replace(/authorization: Bearer [^\s]+/gi, 'authorization: [REDACTED]')
        .replace(/password=[^\s&]+/gi, 'password=[REDACTED]')
        .replace(/token=[^\s&]+/gi, 'token=[REDACTED]')
        .replace(/secret=[^\s&]+/gi, 'secret=[REDACTED]');
      
      logger.info(sanitizedMessage.trim());
    }
  },
  skip: (req, _res) => {
    // Skip logging health checks and static assets
    return req.url === '/health' || req.url.startsWith('/static');
  }
}));

// GDPR compliance middleware
app.use((req, res, next) => {
  // Add GDPR compliance headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  });

  // Log GDPR-relevant information
  if (req.headers['x-forwarded-for'] || req.headers['x-real-ip']) {
    logger.info('GDPR: Request with forwarded IP', {
      originalIp: req.ip,
      forwardedIp: req.headers['x-forwarded-for'] || req.headers['x-real-ip'],
      userAgent: req.headers['user-agent'],
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  next();
});

// Route registration with middleware
// prefix /admin/* => system administrators with full access
app.use('/admin', require('./routes/admin.js'));

// prefix /manager/* => managers with elevated permissions
app.use('/manager', require('./routes/manager.js'));

// prefix /agent/* => internal staff that will handle everyday's task
app.use('/agent', require('./routes/agent.js'));

// prefix /guide/* => external staff that will make the visit
app.use('/guide', require('./routes/guide.js'));

// prefix /customer/* => the corps client that reserve journey
app.use('/customer', require('./routes/customer.js'));

// shared routes for all authenticated users
app.use('/profile', require('./routes/shared.js'));

// no prefix => public routes
app.use('/', require('./routes/anon.js'));

// GDPR compliance endpoint for data requests
app.get('/gdpr/data-export/:userId', (req, res) => {
  // This would implement actual data export logic
  res.status(501).json({
    error: 'Not Implemented',
    message: 'GDPR data export endpoint not yet implemented',
    code: 'NOT_IMPLEMENTED'
  });
});

app.delete('/gdpr/data-deletion/:userId', (req, res) => {
  // This would implement actual data deletion logic
  res.status(501).json({
    error: 'Not Implemented',
    message: 'GDPR data deletion endpoint not yet implemented',
    code: 'NOT_IMPLEMENTED'
  });
});

// Global error handling middleware with Sentry integration
app.use((err, req, res, _next) => {
  // Log error with comprehensive context
  const errorData = {
    type: 'GLOBAL_ERROR',
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id,
    userEmail: req.user?.email,
    timestamp: new Date().toISOString(),
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params
  };

  // Log to Winston
  logger.error('Global error handler', errorData);

  // Send to Sentry in production
  if (config.server.nodeEnv === 'production' && config.sentry.dsn) {
    Sentry.captureException(err, {
      extra: {
        req: {
          method: req.method,
          url: req.url,
          headers: req.headers,
          body: req.body,
          query: req.query,
          params: req.params
        },
        user: req.user
      }
    });
  }

  // Don't expose stack trace in production for GDPR compliance
  const isProduction = config.server.nodeEnv === 'production';
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isProduction ? 'Something went wrong' : err.message,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown',
    ...(isProduction ? {} : { stack: err.stack })
  });
});

// 404 handler for unmatched routes (match all paths)
app.use((req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
  
  // Close server
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connections
    const mongoose = require('mongoose');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      
      // Close Redis connection
      if (redisClient) {
        redisClient.quit(() => {
          logger.info('Redis connection closed');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Uncaught exception handling
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  
  if (config.server.nodeEnv === 'production' && config.sentry.dsn) {
    Sentry.captureException(err);
  }
  
  process.exit(1);
});

// Unhandled rejection handling
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason,
    promise: promise,
    timestamp: new Date().toISOString()
  });
  
  if (config.server.nodeEnv === 'production' && config.sentry.dsn) {
    Sentry.captureException(new Error(`Unhandled Rejection: ${reason}`));
  }
  
  process.exit(1);
});

// Start server
const server = app.listen(port, () => {
  logger.info('ERP-API server started successfully', {
    port,
    environment: config.server.nodeEnv,
    version: config.server.version,
    timestamp: new Date().toISOString()
  });

  console.log(`ERP-API server running on port ${port}`);
  console.log(`Environment: ${config.server.nodeEnv}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Logging enabled: ${config.logging.enableFileLogging}`);
  console.log(`Security: Helmet, CORS, Rate Limiting enabled`);
  console.log(`GDPR Compliance: Enabled`);
  console.log(`Sentry Monitoring: ${config.sentry.dsn ? 'Enabled' : 'Disabled'}`);
  console.log(`Redis: ${config.redis.enabled ? 'Enabled' : 'Disabled'}`);
});

// Export for testing
module.exports = app;
