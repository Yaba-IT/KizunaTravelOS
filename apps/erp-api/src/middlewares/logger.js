/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/middlewares/logger.js - Logging middleware
* Provides comprehensive request and response logging
*
* coded by farid212@Yaba-IT!
*/

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Helper function to get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket?.remoteAddress || 
         'unknown';
};

// Helper function to get user agent details
const parseUserAgent = (userAgent) => {
  if (!userAgent) return {};
  
  // Basic parsing - in production you might want to use a proper UA parser
  const isMobile = /Mobile|Android|iPhone|iPad|Windows Phone/i.test(userAgent);
  const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
  
  return {
    isMobile,
    isBot,
    raw: userAgent
  };
};

// Helper function to get language and locale
const getLanguageInfo = (req) => {
  const acceptLanguage = req.headers['accept-language'] || '';
  const languages = acceptLanguage.split(',').map(lang => {
    const [language, quality = '1'] = lang.trim().split(';q=');
    return { language, quality: parseFloat(quality) };
  }).sort((a, b) => b.quality - a.quality);
  
  return {
    preferred: languages[0]?.language || 'unknown',
    all: languages,
    acceptLanguage
  };
};

// Helper function to get timezone info
const getTimezoneInfo = (req) => {
  return {
    timezone: req.headers['x-timezone'] || 'unknown',
    timestamp: new Date().toISOString(),
    serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};

// Helper function to format log entry
const formatLogEntry = (data) => {
  return JSON.stringify({
    ...data,
    timestamp: new Date().toISOString()
  }, null, 2);
};

// Write log to file
const writeLog = (filename, data) => {
  const logFile = path.join(logsDir, filename);
  const logEntry = formatLogEntry(data);
  
  fs.appendFileSync(logFile, logEntry + '\n', 'utf8');
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture request details
  const requestData = {
    type: 'REQUEST',
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    params: req.params,
    headers: {
      'user-agent': req.headers['user-agent'],
      'accept': req.headers['accept'],
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? '[REDACTED]' : undefined,
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'accept-language': req.headers['accept-language'],
      'x-timezone': req.headers['x-timezone'],
      'referer': req.headers['referer'],
      'origin': req.headers['origin']
    },
    body: req.body,
    ip: getClientIP(req),
    userAgent: parseUserAgent(req.headers['user-agent']),
    language: getLanguageInfo(req),
    timezone: getTimezoneInfo(req),
    timestamp: new Date().toISOString()
  };

  // Log request
  writeLog('requests.log', requestData);
  
  // Store start time for response logging
  req.startTime = startTime;
  
  // Override res.json to capture response data
  const originalJson = res.json;
  res.json = function(data) {
    res.responseData = data;
    return originalJson.call(this, data);
  };
  
  // Override res.send to capture response data
  const originalSend = res.send;
  res.send = function(data) {
    res.responseData = data;
    return originalSend.call(this, data);
  };
  
  next();
};

// Response logging middleware
const responseLogger = (req, res, next) => {
  res.on('finish', () => {
    const endTime = Date.now();
    const duration = endTime - req.startTime;
    
    const responseData = {
      type: 'RESPONSE',
      method: req.method,
      url: req.url,
      path: req.path,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration: `${duration}ms`,
      responseSize: res.get('content-length') || 'unknown',
      responseData: res.responseData,
      timestamp: new Date().toISOString(),
      requestId: req.startTime // Using startTime as request ID
    };
    
    // Log response
    writeLog('responses.log', responseData);
    
    // Log combined request/response for analysis
    const combinedLog = {
      type: 'REQUEST_RESPONSE',
      requestId: req.startTime,
      request: {
        method: req.method,
        url: req.url,
        ip: getClientIP(req),
        userAgent: parseUserAgent(req.headers['user-agent']),
        language: getLanguageInfo(req),
        timezone: getTimezoneInfo(req),
        timestamp: new Date(req.startTime).toISOString()
      },
      response: {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    };
    
    writeLog('combined.log', combinedLog);
  });
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const errorData = {
    type: 'ERROR',
    method: req.method,
    url: req.url,
    path: req.path,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      ip: getClientIP(req),
      userAgent: parseUserAgent(req.headers['user-agent']),
      language: getLanguageInfo(req),
      timezone: getTimezoneInfo(req),
      body: req.body,
      query: req.query,
      params: req.params
    },
    timestamp: new Date().toISOString()
  };
  
  // Log error
  writeLog('errors.log', errorData);
  
  next(err);
};

// Performance monitoring middleware
const performanceLogger = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    const performanceData = {
      type: 'PERFORMANCE',
      method: req.method,
      url: req.url,
      path: req.path,
      duration: `${duration.toFixed(2)}ms`,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString()
    };
    
    // Log slow requests (over 1 second)
    if (duration > 1000) {
      writeLog('slow-requests.log', performanceData);
    }
    
    // Log all performance data
    writeLog('performance.log', performanceData);
  });
  
  next();
};

// Security logging middleware
const securityLogger = (req, res, next) => {
  // Log potential security concerns
  const securityData = {
    type: 'SECURITY',
    method: req.method,
    url: req.url,
    ip: getClientIP(req),
    userAgent: req.headers['user-agent'],
    headers: {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'referer': req.headers['referer'],
      'origin': req.headers['origin']
    },
    timestamp: new Date().toISOString()
  };
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection attempts
    /eval\s*\(/i, // Code injection attempts
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url) || pattern.test(JSON.stringify(req.body))
  );
  
  if (isSuspicious) {
    securityData.suspicious = true;
    securityData.patterns = suspiciousPatterns
      .filter(pattern => pattern.test(req.url) || pattern.test(JSON.stringify(req.body)))
      .map(pattern => pattern.toString());
    
    writeLog('security-alerts.log', securityData);
  }
  
  // Log all security data
  writeLog('security.log', securityData);
  
  next();
};

module.exports = {
  requestLogger,
  responseLogger,
  errorLogger,
  performanceLogger,
  securityLogger,
  // Convenience function to apply all logging middleware
  applyAllLogging: (app) => {
    app.use(requestLogger);
    app.use(responseLogger);
    app.use(performanceLogger);
    app.use(securityLogger);
    app.use(errorLogger);
  }
};
