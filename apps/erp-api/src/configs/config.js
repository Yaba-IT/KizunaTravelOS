/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/configs/config.js - Main configuration file for the ERP API
* Centralizes all application settings and environment variables
*
* coded by farid212@Yaba-IT!
*/

require('dotenv').config();

module.exports = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'kizuna-travel-os',
    audience: process.env.JWT_AUDIENCE || 'kizuna-travel-users'
  },
  
  // Database Configuration
  mongoUri: process.env.MONGO_URI || process.env.VITE_MONGO_URI,
  postgresUri: process.env.POSTGRES_URI || process.env.DATABASE_URL,
  
  // Server Configuration
  server: {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  },
  
  // CORS Configuration
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : 
      ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  },
  
  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    requestLimit: process.env.REQUEST_LIMIT || '10mb',
    parameterLimit: parseInt(process.env.PARAMETER_LIMIT) || 1000,
    // GDPR compliance settings
    dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS) || 2555, // 7 years
    anonymizeLogs: process.env.ANONYMIZE_LOGS === 'true',
    logSensitiveData: process.env.LOG_SENSITIVE_DATA === 'false'
  },
  
  // Session Configuration
  session: {
    enabled: process.env.SESSION_ENABLED === 'true',
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
    name: process.env.SESSION_NAME || 'sid',
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.SESSION_DOMAIN || undefined,
    // GDPR compliance - session data retention
    rolling: true,
    unset: 'destroy'
  },
  
  // Cookie Configuration
  cookie: {
    secret: process.env.COOKIE_SECRET || 'your-super-secret-cookie-key',
    secure: process.env.COOKIE_SECURE === 'true',
    httpOnly: true,
    sameSite: 'strict'
  },
  
  // Redis Configuration
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
    // Connection pool settings
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES) || 3,
    retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY) || 100,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
    logDirectory: process.env.LOG_DIRECTORY || 'logs',
    maxLogSize: process.env.MAX_LOG_SIZE || '10m',
    maxLogFiles: parseInt(process.env.MAX_LOG_FILES) || 5,
    // GDPR compliance logging
    anonymizeIPs: process.env.ANONYMIZE_IPS === 'true',
    logUserActions: process.env.LOG_USER_ACTIONS === 'true',
    logDataAccess: process.env.LOG_DATA_ACCESS === 'true',
    // Log rotation settings
    compressOldLogs: process.env.COMPRESS_OLD_LOGS === 'true',
    deleteOldLogs: process.env.DELETE_OLD_LOGS === 'true',
    // Structured logging
    enableStructuredLogging: process.env.ENABLE_STRUCTURED_LOGGING === 'true',
    logFormat: process.env.LOG_FORMAT || 'json'
  },
  
  // Sentry Configuration for Error Tracking
  sentry: {
    dsn: process.env.SENTRY_DSN || undefined,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 1.0,
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 1.0,
    // GDPR compliance
    sendDefaultPii: process.env.SENTRY_SEND_DEFAULT_PII === 'false',
    beforeSend: process.env.SENTRY_BEFORE_SEND || undefined
  },
  
  // Rate Limiting Configuration
  rateLimit: {
    // Authentication endpoints
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
      message: 'Too many authentication attempts, please try again later'
    },
    // API endpoints
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.API_RATE_LIMIT_MAX) || 100,
      message: 'API rate limit exceeded, please try again later'
    },
    // General endpoints
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.GENERAL_RATE_LIMIT_MAX) || 1000,
      message: 'Too many requests, please try again later'
    },
    // Speed limiting
    speedLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: parseInt(process.env.SPEED_LIMIT_DELAY_AFTER) || 100,
      delayMs: parseInt(process.env.SPEED_LIMIT_DELAY_MS) || 500,
      maxDelayMs: parseInt(process.env.SPEED_LIMIT_MAX_DELAY_MS) || 20000
    }
  },
  
  // GDPR Compliance Configuration
  gdpr: {
    enabled: process.env.GDPR_ENABLED === 'true',
    // Data retention policies
    userDataRetentionDays: parseInt(process.env.USER_DATA_RETENTION_DAYS) || 2555, // 7 years
    logDataRetentionDays: parseInt(process.env.LOG_DATA_RETENTION_DAYS) || 365, // 1 year
    sessionDataRetentionDays: parseInt(process.env.SESSION_DATA_RETENTION_DAYS) || 30, // 30 days
    // Data processing
    allowDataExport: process.env.ALLOW_DATA_EXPORT === 'true',
    allowDataDeletion: process.env.ALLOW_DATA_DELETION === 'true',
    anonymizeDeletedData: process.env.ANONYMIZE_DELETED_DATA === 'true',
    // Consent management
    requireExplicitConsent: process.env.REQUIRE_EXPLICIT_CONSENT === 'true',
    trackConsentChanges: process.env.TRACK_CONSENT_CHANGES === 'true',
    // Data minimization
    logMinimalData: process.env.LOG_MINIMAL_DATA === 'true',
    encryptSensitiveData: process.env.ENCRYPT_SENSITIVE_DATA === 'true'
  },
  
  // Monitoring and Observability
  monitoring: {
    // Health check settings
    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED === 'true',
      interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
      timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000, // 5 seconds
      detailed: process.env.HEALTH_CHECK_DETAILED === 'true'
    },
    // Performance monitoring
    performance: {
      enabled: process.env.PERFORMANCE_MONITORING_ENABLED === 'true',
      slowRequestThreshold: parseInt(process.env.SLOW_REQUEST_THRESHOLD) || 1000, // 1 second
      memoryThreshold: parseInt(process.env.MEMORY_THRESHOLD) || 80, // 80% of available memory
      cpuThreshold: parseInt(process.env.CPU_THRESHOLD) || 80 // 80% of CPU usage
    },
    // Security monitoring
    security: {
      enabled: process.env.SECURITY_MONITORING_ENABLED === 'true',
      suspiciousIPThreshold: parseInt(process.env.SUSPICIOUS_IP_THRESHOLD) || 100,
      failedAuthThreshold: parseInt(process.env.FAILED_AUTH_THRESHOLD) || 10,
      xssDetectionEnabled: process.env.XSS_DETECTION_ENABLED === 'true',
      sqlInjectionDetectionEnabled: process.env.SQL_INJECTION_DETECTION_ENABLED === 'true'
    }
  },
  
  // Cache Configuration
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000,
    // Redis cache settings
    redis: {
      enabled: process.env.REDIS_CACHE_ENABLED === 'true',
      prefix: process.env.REDIS_CACHE_PREFIX || 'cache:',
      defaultTTL: parseInt(process.env.REDIS_CACHE_DEFAULT_TTL) || 300
    }
  },
  
  // API Configuration
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api',
    // Rate limiting headers
    rateLimitHeaders: {
      enabled: process.env.RATE_LIMIT_HEADERS_ENABLED === 'true',
      standard: process.env.RATE_LIMIT_HEADERS_STANDARD === 'true',
      legacy: process.env.RATE_LIMIT_HEADERS_LEGACY === 'false'
    },
    // Response formatting
    responseFormat: {
      includeTimestamp: process.env.RESPONSE_INCLUDE_TIMESTAMP === 'true',
      includeRequestId: process.env.RESPONSE_INCLUDE_REQUEST_ID === 'true',
      includeVersion: process.env.RESPONSE_INCLUDE_VERSION === 'true'
    }
  },
  
  // Development Configuration
  development: {
    enableDebugLogs: process.env.ENABLE_DEBUG_LOGS === 'true',
    enablePerformanceLogs: process.env.ENABLE_PERFORMANCE_LOGS === 'true',
    enableSecurityLogs: process.env.ENABLE_SECURITY_LOGS === 'true',
    mockExternalServices: process.env.MOCK_EXTERNAL_SERVICES === 'true',
    enableHotReload: process.env.ENABLE_HOT_RELOAD === 'true'
  }
};
