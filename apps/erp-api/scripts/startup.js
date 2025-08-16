#!/usr/bin/env node

/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/scripts/startup.js - ERP API startup validation script
* Validates system configuration and ensures everything is ready to run
*
* coded by farid212@Yaba-IT!
*/

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`)
};

class StartupValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  addError(message) {
    this.errors.push(message);
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  addSuccess(message) {
    this.successes.push(message);
  }

  async validateEnvironment() {
    log.header('🔍 Validating Environment Configuration');
    
    // Check required environment variables
    const requiredEnvVars = [
      'NODE_ENV',
      'PORT',
      'MONGODB_URI',
      'JWT_SECRET'
    ];

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.addSuccess(`Environment variable ${envVar} is set`);
      } else {
        this.addError(`Missing required environment variable: ${envVar}`);
      }
    }

    // Check optional environment variables
    const optionalEnvVars = [
      'REDIS_URL',
      'REDIS_ENABLED',
      'SESSION_SECRET',
      'CORS_ORIGIN'
    ];

    for (const envVar of optionalEnvVars) {
      if (process.env[envVar]) {
        this.addSuccess(`Optional environment variable ${envVar} is set`);
      } else {
        this.addWarning(`Optional environment variable ${envVar} is not set`);
      }
    }

    // Check NODE_ENV value
    const validEnvs = ['development', 'staging', 'production', 'test'];
    if (process.env.NODE_ENV && validEnvs.includes(process.env.NODE_ENV)) {
      this.addSuccess(`NODE_ENV is set to valid value: ${process.env.NODE_ENV}`);
    } else if (process.env.NODE_ENV) {
      this.addWarning(`NODE_ENV has unusual value: ${process.env.NODE_ENV}`);
    }
  }

  async validateFileStructure() {
    log.header('📁 Validating File Structure');
    
    const requiredFiles = [
      'src/index.js',
      'src/configs/config.js',
      'src/configs/db.js',
      'src/configs/security.js',
      'src/configs/roles.js',
      'src/models/User.js',
      'src/models/Profile.js',
      'src/models/Meta.js',
      'src/middlewares/auth.js',
      'src/middlewares/authorize.js',
      'src/middlewares/canAccessOwnData.js',
      'src/routes/admin.js',
      'src/routes/manager.js',
      'src/routes/agent.js',
      'src/routes/guide.js',
      'src/routes/customer.js',
      'src/routes/shared.js',
      'src/routes/anon.js',
      'package.json',
      'README.md'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.addSuccess(`File exists: ${file}`);
      } else {
        this.addError(`Missing required file: ${file}`);
      }
    }
  }

  async validateDependencies() {
    log.header('📦 Validating Dependencies');
    
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        this.addError('package.json not found');
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check required dependencies
      const requiredDeps = [
        'express',
        'mongoose',
        'bcryptjs',
        'jsonwebtoken',
        'helmet',
        'cors',
        'morgan',
        'express-rate-limit',
        'express-slow-down',
        'express-mongo-sanitize',
        'xss-clean',
        'hpp',
        'compression',
        'cookie-parser',
        'express-session',
        'winston',
        'winston-daily-rotate-file'
      ];

      for (const dep of requiredDeps) {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          this.addSuccess(`Dependency ${dep} is installed`);
        } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          this.addWarning(`Dependency ${dep} is in devDependencies (should be in dependencies)`);
        } else {
          this.addError(`Missing required dependency: ${dep}`);
        }
      }

      // Check dev dependencies
      const requiredDevDeps = [
        'jest',
        'supertest',
        'nodemon',
        'eslint'
      ];

      for (const dep of requiredDevDeps) {
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          this.addSuccess(`Dev dependency ${dep} is installed`);
        } else {
          this.addWarning(`Missing dev dependency: ${dep}`);
        }
      }

    } catch (error) {
      this.addError(`Error reading package.json: ${error.message}`);
    }
  }

  async validateDatabaseConnection() {
    log.header('🗄️ Validating Database Connection');
    
    try {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        this.addError('MONGODB_URI not set, cannot test database connection');
        return;
      }

      // Test MongoDB connection
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000
      });

      this.addSuccess('Database connection successful');
      
      // Check if we can perform basic operations
      const collections = await mongoose.connection.db.listCollections().toArray();
      this.addSuccess(`Database accessible, found ${collections.length} collections`);

      await mongoose.disconnect();
      
    } catch (error) {
      this.addError(`Database connection failed: ${error.message}`);
    }
  }

  async validateNodeVersion() {
    log.header('🟢 Validating Node.js Version');
    
    const nodeVersion = process.version;
    const majorVersion = parseInt(process.version.slice(1).split('.')[0]);
    
    if (majorVersion >= 20) {
      this.addSuccess(`Node.js version ${nodeVersion} meets requirement (20+)`);
    } else {
      this.addError(`Node.js version ${nodeVersion} does not meet requirement (20+ required)`);
    }
  }

  async validateSecurity() {
    log.header('🔒 Validating Security Configuration');
    
    // Check JWT secret strength
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      if (jwtSecret.length >= 32) {
        this.addSuccess('JWT secret is sufficiently long');
      } else {
        this.addWarning('JWT secret should be at least 32 characters long');
      }
      
      if (jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
        this.addError('JWT secret is using default value - CHANGE IN PRODUCTION!');
      }
    }

    // Check environment
    if (process.env.NODE_ENV === 'production') {
      if (process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your-super-secret-jwt-key-change-in-production') {
        this.addSuccess('Production environment with custom JWT secret');
      } else {
        this.addError('Production environment detected but JWT secret not properly configured');
      }
    } else {
      this.addWarning('Running in non-production environment');
    }
  }

  async runValidation() {
    log.header('🚀 ERP API Startup Validation');
    log.info('Starting comprehensive system validation...\n');

    await this.validateNodeVersion();
    await this.validateEnvironment();
    await this.validateFileStructure();
    await this.validateDependencies();
    await this.validateDatabaseConnection();
    await this.validateSecurity();

    // Summary
    log.header('📊 Validation Summary');
    
    if (this.successes.length > 0) {
      log.success(`${this.successes.length} checks passed`);
    }
    
    if (this.warnings.length > 0) {
      log.warning(`${this.warnings.length} warnings found`);
      this.warnings.forEach(warning => log.warning(`  - ${warning}`));
    }
    
    if (this.errors.length > 0) {
      log.error(`${this.errors.length} errors found`);
      this.errors.forEach(error => log.error(`  - ${error}`));
      log.error('\n❌ System validation failed. Please fix the errors above before starting the API.');
      process.exit(1);
    } else {
      log.success('\n✅ All validations passed! The ERP API is ready to start.');
      log.info('You can now run: yarn start (or yarn dev for development)');
    }
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new StartupValidator();
  validator.runValidation().catch(error => {
    log.error(`Validation script failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = StartupValidator;
