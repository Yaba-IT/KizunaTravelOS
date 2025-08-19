/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/middlewares/dataValidation.js - Data validation middleware
* Validates request data integrity and checks for missing required fields
*
* coded by farid212@Yaba-IT!
*/

// Simple logging for validation middleware
const logValidation = (level, message, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data);
};

// Validation schemas for different data types
const validationSchemas = {
  // User registration
  userRegistration: {
    required: ['email', 'password', 'firstname', 'lastname'],
    email: {
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Email must be a valid email address'
    },
    password: {
      type: 'string',
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    },
    firstname: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'First name must be 2-50 characters with only letters, spaces, hyphens, and apostrophes'
    },
    lastname: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'Last name must be 2-50 characters with only letters, spaces, hyphens, and apostrophes'
    }
  },

  // User login
  userLogin: {
    required: ['email', 'password'],
    email: {
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Email must be a valid email address'
    },
    password: {
      type: 'string',
      minLength: 1,
      message: 'Password is required'
    }
  },

  // Provider creation
  providerCreation: {
    required: ['name', 'type', 'legalName'],
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
      message: 'Provider name must be 2-100 characters'
    },
    type: {
      type: 'string',
      enum: ['hotel', 'restaurant', 'transport', 'activity', 'guide'],
      message: 'Provider type must be one of: hotel, restaurant, transport, activity, guide'
    },
    legalName: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
      message: 'Legal name must be 2-100 characters'
    },
    contact: {
      type: 'object',
      required: ['primaryContact'],
      primaryContact: {
        type: 'object',
        required: ['name', 'email', 'phone'],
        name: {
          type: 'string',
          minLength: 2,
          maxLength: 50,
          message: 'Contact name must be 2-50 characters'
        },
        email: {
          type: 'string',
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Contact email must be a valid email address'
        },
        phone: {
          type: 'string',
          pattern: /^[\+]?[1-9][\d]{0,15}$/,
          message: 'Contact phone must be a valid international phone number'
        }
      }
    },
    address: {
      type: 'object',
      required: ['street', 'city', 'country'],
      street: {
        type: 'string',
        minLength: 5,
        maxLength: 100,
        message: 'Street address must be 5-100 characters'
      },
      city: {
        type: 'string',
        minLength: 2,
        maxLength: 50,
        message: 'City must be 2-50 characters'
      },
      country: {
        type: 'string',
        minLength: 2,
        maxLength: 50,
        message: 'Country must be 2-50 characters'
      }
    },
    rating: {
      type: 'number',
      min: 0,
      max: 5,
      message: 'Rating must be between 0 and 5'
    }
  },

  // Journey creation
  journeyCreation: {
    required: ['name', 'category', 'type', 'duration', 'pricing', 'capacity', 'schedule'],
    name: {
      type: 'string',
      minLength: 5,
      maxLength: 100,
      message: 'Journey name must be 5-100 characters'
    },
    category: {
      type: 'string',
      enum: ['cultural', 'adventure', 'relaxation', 'business', 'educational'],
      message: 'Category must be one of: cultural, adventure, relaxation, business, educational'
    },
    type: {
      type: 'string',
      enum: ['guided', 'self-guided', 'group', 'private'],
      message: 'Type must be one of: guided, self-guided, group, private'
    },
    duration: {
      type: 'object',
      required: ['days', 'nights'],
      days: {
        type: 'number',
        min: 1,
        message: 'Duration days must be at least 1'
      },
      nights: {
        type: 'number',
        min: 0,
        message: 'Duration nights must be at least 0'
      }
    },
    pricing: {
      type: 'object',
      required: ['basePrice', 'currency'],
      basePrice: {
        type: 'number',
        min: 0,
        message: 'Base price must be non-negative'
      },
      currency: {
        type: 'string',
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
        message: 'Currency must be one of: USD, EUR, GBP, JPY, CAD, AUD'
      }
    },
    capacity: {
      type: 'object',
      required: ['maxParticipants'],
      maxParticipants: {
        type: 'number',
        min: 1,
        message: 'Maximum participants must be at least 1'
      }
    },
    schedule: {
      type: 'object',
      required: ['startDate', 'endDate'],
      startDate: {
        type: 'string',
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        message: 'Start date must be in YYYY-MM-DD format'
      },
      endDate: {
        type: 'string',
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        message: 'End date must be in YYYY-MM-DD format'
      }
    }
  }
};

// Main validation function
const validateData = (schemaName) => {
  return (req, res, next) => {
    try {
      const schema = validationSchemas[schemaName];
      if (!schema) {
        return res.status(400).json({
          error: 'Validation schema not found',
          message: `Schema '${schemaName}' is not defined`,
          code: 'INVALID_SCHEMA'
        });
      }

      const data = req.body;
      const errors = [];

      // Check required fields
      if (schema.required) {
        for (const field of schema.required) {
          if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            errors.push({
              field,
              message: `${field} is required`,
              code: 'MISSING_REQUIRED_FIELD'
            });
          }
        }
      }

      // Validate each field
      for (const [fieldName, fieldSchema] of Object.entries(schema)) {
        if (fieldName === 'required') continue;

        const fieldValue = data[fieldName];
        if (fieldValue === undefined || fieldValue === null) continue;

        // Type validation
        if (fieldSchema.type && typeof fieldValue !== fieldSchema.type) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be of type ${fieldSchema.type}`,
            code: 'INVALID_TYPE'
          });
          continue;
        }

        // String validations
        if (fieldSchema.type === 'string') {
          // Length validation
          if (fieldSchema.minLength && fieldValue.length < fieldSchema.minLength) {
            errors.push({
              field: fieldName,
              message: fieldSchema.message || `${fieldName} must be at least ${fieldSchema.minLength} characters`,
              code: 'MIN_LENGTH_VIOLATION'
            });
          }

          if (fieldSchema.maxLength && fieldValue.length > fieldSchema.maxLength) {
            errors.push({
              field: fieldName,
              message: fieldSchema.message || `${fieldName} must be at most ${fieldSchema.maxLength} characters`,
              code: 'MAX_LENGTH_VIOLATION'
            });
          }

          // Pattern validation
          if (fieldSchema.pattern && !fieldSchema.pattern.test(fieldValue)) {
            errors.push({
              field: fieldName,
              message: fieldSchema.message || `${fieldName} format is invalid`,
              code: 'PATTERN_VIOLATION'
            });
          }

          // Enum validation
          if (fieldSchema.enum && !fieldSchema.enum.includes(fieldValue)) {
            errors.push({
              field: fieldName,
              message: fieldSchema.message || `${fieldName} must be one of: ${fieldSchema.enum.join(', ')}`,
              code: 'ENUM_VIOLATION'
            });
          }
        }

        // Number validations
        if (fieldSchema.type === 'number') {
          if (fieldSchema.min !== undefined && fieldValue < fieldSchema.min) {
            errors.push({
              field: fieldName,
              message: fieldSchema.message || `${fieldName} must be at least ${fieldSchema.min}`,
              code: 'MIN_VALUE_VIOLATION'
            });
          }

          if (fieldSchema.max !== undefined && fieldValue > fieldSchema.max) {
            errors.push({
              field: fieldName,
              message: fieldSchema.message || `${fieldName} must be at most ${fieldSchema.max}`,
              code: 'MAX_VALUE_VIOLATION'
            });
          }
        }

        // Object validations (nested validation)
        if (fieldSchema.type === 'object' && typeof fieldValue === 'object') {
          const nestedErrors = validateNestedObject(fieldValue, fieldSchema, fieldName);
          errors.push(...nestedErrors);
        }
      }

      if (errors.length > 0) {
        logValidation('warn', 'Data validation failed', {
          schema: schemaName,
          errors,
          method: req.method,
          url: req.url,
          ip: req.ip
        });

        return res.status(400).json({
          error: 'Validation failed',
          message: 'Request data validation failed',
          code: 'VALIDATION_ERROR',
          details: errors,
          timestamp: new Date().toISOString()
        });
      }

      // Log successful validation
      logValidation('info', 'Data validation successful', {
        schema: schemaName,
        method: req.method,
        url: req.url,
        ip: req.ip
      });

      next();
    } catch (error) {
      logValidation('error', 'Validation middleware error', {
        error: error.message,
        stack: error.stack,
        schema: schemaName,
        method: req.method,
        url: req.url
      });

      return res.status(500).json({
        error: 'Validation service error',
        message: 'An unexpected error occurred during validation',
        code: 'VALIDATION_SERVICE_ERROR'
      });
    }
  };
};

// Helper function for nested object validation
const validateNestedObject = (obj, schema, parentField = '') => {
  const errors = [];

  // Check required fields in nested object
  if (schema.required) {
    for (const field of schema.required) {
      if (!obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === '')) {
        errors.push({
          field: parentField ? `${parentField}.${field}` : field,
          message: `${field} is required`,
          code: 'MISSING_REQUIRED_FIELD'
        });
      }
    }
  }

  // Validate nested object properties
  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    if (fieldName === 'required') continue;

    const fieldValue = obj[fieldName];
    if (fieldValue === undefined || fieldValue === null) continue;

    const fullFieldName = parentField ? `${parentField}.${fieldName}` : fieldName;

    // Apply the same validation logic as above
    if (fieldSchema.type && typeof fieldValue !== fieldSchema.type) {
      errors.push({
        field: fullFieldName,
        message: `${fullFieldName} must be of type ${fieldSchema.type}`,
        code: 'INVALID_TYPE'
      });
      continue;
    }

    // String validations
    if (fieldSchema.type === 'string') {
      if (fieldSchema.minLength && fieldValue.length < fieldSchema.minLength) {
        errors.push({
          field: fullFieldName,
          message: fieldSchema.message || `${fullFieldName} must be at least ${fieldSchema.minLength} characters`,
          code: 'MIN_LENGTH_VIOLATION'
        });
      }

      if (fieldSchema.maxLength && fieldValue.length > fieldSchema.maxLength) {
        errors.push({
          field: fullFieldName,
          message: fieldSchema.message || `${fullFieldName} must be at most ${fieldSchema.maxLength} characters`,
          code: 'MAX_LENGTH_VIOLATION'
        });
      }

      if (fieldSchema.pattern && !fieldSchema.pattern.test(fieldValue)) {
        errors.push({
          field: fullFieldName,
          message: fieldSchema.message || `${fullFieldName} format is invalid`,
          code: 'PATTERN_VIOLATION'
        });
      }

      if (fieldSchema.enum && !fieldSchema.enum.includes(fieldValue)) {
        errors.push({
          field: fullFieldName,
          message: fieldSchema.message || `${fullFieldName} must be one of: ${fieldSchema.enum.join(', ')}`,
          code: 'ENUM_VIOLATION'
        });
      }
    }

    // Number validations
    if (fieldSchema.type === 'number') {
      if (fieldSchema.min !== undefined && fieldValue < fieldSchema.min) {
        errors.push({
          field: fullFieldName,
          message: fieldSchema.message || `${fullFieldName} must be at least ${fieldSchema.min}`,
          code: 'MIN_VALUE_VIOLATION'
        });
      }

      if (fieldSchema.max !== undefined && fieldValue > fieldSchema.max) {
        errors.push({
          field: fullFieldName,
          message: fieldSchema.message || `${fullFieldName} must be at most ${fieldSchema.max}`,
          code: 'MAX_VALUE_VIOLATION'
        });
      }
    }

    // Recursive validation for nested objects
    if (fieldSchema.type === 'object' && typeof fieldValue === 'object') {
      const nestedErrors = validateNestedObject(fieldValue, fieldSchema, fullFieldName);
      errors.push(...nestedErrors);
    }
  }

  return errors;
};

module.exports = {
  validateData,
  validationSchemas
};
