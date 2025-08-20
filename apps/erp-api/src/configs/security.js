/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/configs/security.js - Security configuration and policies
* Defines security constants, roles, permissions, and security policies
*
* coded by farid212@Yaba-IT!
*/

const config = require('./config');

module.exports = {
  // Security Headers Configuration
  headers: {
    // Content Security Policy
    csp: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"],
      'font-src': ["'self'"],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'frame-src': ["'none'"]
    },
    
    // Additional security headers
    additional: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
  },

  // Password Policy
  passwordPolicy: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventPersonalInfo: true,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    historyCount: 5
  },

  // Session Security
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    rolling: true,
    secure: config.server.nodeEnv === 'production',
    httpOnly: true,
    sameSite: 'strict',
    name: 'sid',
    resave: false,
    saveUninitialized: false
  },

  // Rate Limiting Configuration
  rateLimiting: {
    // Authentication endpoints
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: 'Too many authentication attempts, please try again later',
      standardHeaders: true,
      legacyHeaders: false
    },
    
    // API endpoints
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
      message: 'API rate limit exceeded, please try again later',
      standardHeaders: true,
      legacyHeaders: false
    },
    
    // General endpoints
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // 1000 requests per window
      message: 'Too many requests, please try again later',
      standardHeaders: true,
      legacyHeaders: false
    }
  },

  // Input Validation and Sanitization
  validation: {
    // MongoDB query sanitization
    mongoSanitize: {
      replaceWith: '_'
    },
    
    // XSS Protection
    xss: {
      enabled: true,
      whiteList: {}
    },
    
    // SQL Injection Protection
    sqlInjection: {
      enabled: true,
      patterns: [
        /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/i,
        /(\b(and|or)\b\s+\d+\s*=\s*\d+)/i,
        /(\b(and|or)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/i
      ]
    }
  },

  // CORS Configuration
  cors: {
    origin: config.cors.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400 // 24 hours
  },

  // JWT Configuration
  jwt: {
    secret: config.jwt.secret,
    expiresIn: config.jwt.expiresIn,
    refreshExpiresIn: config.jwt.refreshExpiresIn,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
    algorithm: 'HS256'
  },

  // Encryption Configuration
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 16
  },

  // Audit Logging
  audit: {
    enabled: true,
    logLevel: 'info',
    events: [
      'user.login',
      'user.logout',
      'user.create',
      'user.update',
      'user.delete',
      'data.access',
      'data.modify',
      'security.violation'
    ],
    sensitiveFields: ['password', 'token', 'secret', 'key']
  },

  // Security Monitoring
  monitoring: {
    enabled: true,
    suspiciousPatterns: [
      'sql injection attempts',
      'xss attempts',
      'path traversal attempts',
      'command injection attempts'
    ],
    alertThresholds: {
      failedLogins: 10,
      suspiciousRequests: 50,
      rateLimitViolations: 20
    }
  },

  // GDPR Compliance
  gdpr: {
    enabled: config.gdpr.enabled,
    dataRetention: {
      userData: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      logs: 365 * 24 * 60 * 60 * 1000, // 1 year
      sessions: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    dataProcessing: {
      anonymizeOnDelete: true,
      encryptSensitiveData: true,
      logDataAccess: true
    }
  },

  // API Security
  api: {
    versioning: true,
    deprecationWarnings: true,
    requestIdHeader: 'X-Request-ID',
    correlationIdHeader: 'X-Correlation-ID',
    maxRequestSize: '10mb',
    timeout: 30000 // 30 seconds
  },

  // Development Security
  development: {
    enableDebugMode: config.server.nodeEnv === 'development',
    exposeErrorDetails: config.server.nodeEnv === 'development',
    allowInsecureConnections: config.server.nodeEnv === 'development'
  }
};
