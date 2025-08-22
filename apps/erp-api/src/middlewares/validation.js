/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/middlewares/validation.js - Input validation middleware
* Validates and sanitizes incoming request data
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

// Helper function to write log
const writeLog = (filename, data) => {
  const logFile = path.join(logsDir, filename);
  const logEntry = JSON.stringify({
    ...data,
    timestamp: new Date().toISOString()
  }, null, 2);
  
  fs.appendFileSync(logFile, logEntry + '\n', 'utf8');
};

// Validation schemas
const validationSchemas = {
  // User validation
  user: {
    email: {
      required: true,
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Email must be a valid email address'
    },
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    },
    firstName: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'First name must be 2-50 characters long and contain only letters, spaces, hyphens, and apostrophes'
    },
    lastName: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'Last name must be 2-50 characters long and contain only letters, spaces, hyphens, and apostrophes'
    }
  },
  
  // Profile validation
  profile: {
    phone: {
      required: false,
      type: 'string',
      pattern: /^[+]?[1-9][\d]{0,15}$/,
      message: 'Phone number must be a valid international phone number'
    },
    dateOfBirth: {
      required: false,
      type: 'string',
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      message: 'Date of birth must be in YYYY-MM-DD format'
    },
    address: {
      required: false,
      type: 'object',
      properties: {
        street: { type: 'string', maxLength: 100 },
        city: { type: 'string', maxLength: 50 },
        state: { type: 'string', maxLength: 50 },
        country: { type: 'string', maxLength: 50 },
        postalCode: { type: 'string', maxLength: 20 }
      }
    }
  },
  
  // Booking validation
  booking: {
    journeyId: {
      required: true,
      type: 'string',
      pattern: /^[a-fA-F0-9]{24}$/,
      message: 'Journey ID must be a valid MongoDB ObjectId'
    },
    startDate: {
      required: true,
      type: 'string',
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      message: 'Start date must be in YYYY-MM-DD format'
    },
    endDate: {
      required: true,
      type: 'string',
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      message: 'End date must be in YYYY-MM-DD format'
    },
    participants: {
      required: true,
      type: 'number',
      min: 1,
      max: 100,
      message: 'Number of participants must be between 1 and 100'
    }
  }
};

// Validation functions
const validators = {
  // Type validation
  validateType: (value, expectedType) => {
    if (expectedType === 'string') return typeof value === 'string';
    if (expectedType === 'number') return typeof value === 'number' && !isNaN(value);
    if (expectedType === 'boolean') return typeof value === 'boolean';
    if (expectedType === 'object') return typeof value === 'object' && value !== null;
    if (expectedType === 'array') return Array.isArray(value);
    return true;
  },
  
  // Pattern validation
  validatePattern: (value, pattern) => {
    if (typeof pattern === 'string') {
      try {
        const regex = new RegExp(pattern);
        return regex.test(value);
      } catch {
        return false;
      }
    }
    if (pattern instanceof RegExp) {
      return pattern.test(value);
    }
    return true;
  },
  
  // Length validation
  validateLength: (value, minLength, maxLength) => {
    if (typeof value !== 'string') return true;
    if (minLength && value.length < minLength) return false;
    if (maxLength && value.length > maxLength) return false;
    return true;
  },
  
  // Range validation
  validateRange: (value, min, max) => {
    if (typeof value !== 'number') return true;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  },
  
  // Required validation
  validateRequired: (value) => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }
};

// Main validation function
const validateData = (data, schema) => {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check if field is required
    if (rules.required && !validators.validateRequired(value)) {
      errors.push({
        field,
        message: rules.message || `${field} is required`,
        code: 'REQUIRED_FIELD_MISSING'
      });
      continue;
    }
    
    // Skip validation if field is not required and value is empty
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Type validation
    if (rules.type && !validators.validateType(value, rules.type)) {
      errors.push({
        field,
        message: `${field} must be of type ${rules.type}`,
        code: 'INVALID_TYPE',
        expectedType: rules.type,
        actualType: typeof value
      });
      continue;
    }
    
    // Pattern validation
    if (rules.pattern && !validators.validatePattern(value, rules.pattern)) {
      errors.push({
        field,
        message: rules.message || `${field} format is invalid`,
        code: 'INVALID_FORMAT',
        pattern: rules.pattern.toString()
      });
    }
    
    // Length validation
    if (rules.minLength || rules.maxLength) {
      if (!validators.validateLength(value, rules.minLength, rules.maxLength)) {
        errors.push({
          field,
          message: rules.message || `${field} length must be between ${rules.minLength || 0} and ${rules.maxLength || 'unlimited'} characters`,
          code: 'INVALID_LENGTH',
          minLength: rules.minLength,
          maxLength: rules.maxLength,
          actualLength: value?.length
        });
      }
    }
    
    // Range validation
    if (rules.min !== undefined || rules.max !== undefined) {
      if (!validators.validateRange(value, rules.min, rules.max)) {
        errors.push({
          field,
          message: rules.message || `${field} must be between ${rules.min || 'unlimited'} and ${rules.max || 'unlimited'}`,
          code: 'INVALID_RANGE',
          min: rules.min,
          max: rules.max,
          actualValue: value
        });
      }
    }
    
    // Nested object validation
    if (rules.properties && typeof value === 'object' && value !== null) {
      const nestedErrors = validateData(value, rules.properties);
      nestedErrors.forEach(error => {
        error.field = `${field}.${error.field}`;
        errors.push(error);
      });
    }
    
    // Array validation
    if (rules.items && Array.isArray(value)) {
      value.forEach((item, index) => {
        const itemErrors = validateData(item, rules.items);
        itemErrors.forEach(error => {
          error.field = `${field}[${index}].${error.field}`;
          errors.push(error);
        });
      });
    }
  }
  
  return errors;
};

// Validation middleware factory
const createValidationMiddleware = (schemaName, options = {}) => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    try {
      // Get schema
      const schema = validationSchemas[schemaName];
      if (!schema) {
        const errorData = {
          type: 'VALIDATION_ERROR',
          error: `Schema '${schemaName}' not found`,
          method: req.method,
          url: req.url,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString()
        };
        
        console.error('Validation schema not found:', errorData);
        writeLog('validation-errors.log', errorData);
        
        return res.status(500).json({
          error: 'Validation schema error',
          message: `Schema '${schemaName}' not found`,
          code: 'SCHEMA_NOT_FOUND'
        });
      }
      
      // Determine data source based on options
      let dataToValidate;
      if (options.source === 'body') {
        dataToValidate = req.body;
      } else if (options.source === 'query') {
        dataToValidate = req.query;
      } else if (options.source === 'params') {
        dataToValidate = req.params;
      } else {
        // Default to body
        dataToValidate = req.body;
      }
      
      // Validate data
      const validationErrors = validateData(dataToValidate, schema);
      
      if (validationErrors.length > 0) {
        const errorData = {
          type: 'VALIDATION_FAILED',
          schema: schemaName,
          errors: validationErrors,
          data: dataToValidate,
          method: req.method,
          url: req.url,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          userId: req.user?.id,
          userEmail: req.user?.email,
          timestamp: new Date().toISOString(),
          duration: `${Date.now() - startTime}ms`
        };
        
        console.error('Validation failed:', errorData);
        writeLog('validation-errors.log', errorData);
        
        return res.status(400).json({
          error: 'Validation failed',
          message: 'The provided data does not meet the validation requirements',
          code: 'VALIDATION_FAILED',
          errors: validationErrors,
          schema: schemaName
        });
      }
      
      // Log successful validation
      const successData = {
        type: 'VALIDATION_SUCCESS',
        schema: schemaName,
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        userId: req.user?.id,
        userEmail: req.user?.email,
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`
      };
      
      writeLog('validation-success.log', successData);
      
      next();
    } catch (error) {
      const errorData = {
        type: 'VALIDATION_EXCEPTION',
        error: error.message,
        stack: error.stack,
        schema: schemaName,
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };
      
      console.error('Validation exception:', errorData);
      writeLog('validation-errors.log', errorData);
      
      return res.status(500).json({
        error: 'Validation service error',
        message: 'An unexpected error occurred during validation',
        code: 'VALIDATION_SERVICE_ERROR'
      });
    }
  };
};

// Predefined validation middleware
const validationMiddleware = {
  validateUser: createValidationMiddleware('user', { source: 'body' }),
  validateProfile: createValidationMiddleware('profile', { source: 'body' }),
  validateBooking: createValidationMiddleware('booking', { source: 'body' }),
  validateUserQuery: createValidationMiddleware('user', { source: 'query' }),
  validateProfileQuery: createValidationMiddleware('profile', { source: 'query' }),
  validateBookingQuery: createValidationMiddleware('booking', { source: 'query' })
};

module.exports = {
  createValidationMiddleware,
  validationMiddleware,
  validationSchemas,
  validators,
  validateData,
  // Convenience function to apply validation to specific routes
  applyValidation: (app, routes) => {
    Object.entries(routes).forEach(([path, middleware]) => {
      if (typeof middleware === 'string' && validationMiddleware[middleware]) {
        app.use(path, validationMiddleware[middleware]);
      } else if (typeof middleware === 'function') {
        app.use(path, middleware);
      }
    });
  }
};
