#!/usr/bin/env node

/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/scripts/setup-env.js - Environment setup script
* Creates .env file with required environment variables for development
*
* coded by farid212@Yaba-IT!
*/

const fs = require('fs');
const path = require('path');

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

function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    log.warning('.env file already exists. Do you want to overwrite it? (y/N)');
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('', (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        writeEnvFile(envPath);
      } else {
        log.info('Setup cancelled. .env file was not modified.');
      }
    });
  } else {
    writeEnvFile(envPath);
  }
}

function writeEnvFile(envPath) {
  const envContent = `# Server Configuration
NODE_ENV=development
PORT=4000
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/kizuna_travel_os
MONGODB_URI_TEST=mongodb://localhost:27017/kizuna_travel_os_test

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_ENABLED=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=kizuna-travel-os
JWT_AUDIENCE=kizuna-travel-users

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Security Configuration
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SLOW_DOWN_DELAY_MS=500

# Logging Configuration
LOG_LEVEL=info
LOG_DIRECTORY=./logs
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14d

# Sentry Configuration (Error Tracking)
SENTRY_DSN=
SENTRY_ENVIRONMENT=development

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@kizunatravel.com

# File Upload Configuration
UPLOAD_MAX_SIZE=10mb
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf
UPLOAD_DIRECTORY=./uploads

# External API Keys
GOOGLE_MAPS_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Monitoring and Health Checks
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_INTERVAL=30000

# GDPR and Compliance
GDPR_ENABLED=true
DATA_RETENTION_DAYS=2555
CONSENT_MANAGEMENT_ENABLED=true

# Development Tools
DEBUG=false
NODEMON_ENABLED=true
API_DOCS_ENABLED=true
`;

  try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    log.success('.env file created successfully!');
    log.info('You can now run the validation script: yarn validate');
  } catch (error) {
    log.error(`Failed to create .env file: ${error.message}`);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  log.header('🔧 ERP API Environment Setup');
  log.info('This script will create a .env file with development configuration.');
  log.warning('⚠️  Remember to change sensitive values (JWT_SECRET, SESSION_SECRET) in production!\n');
  
  createEnvFile();
}

module.exports = { createEnvFile };
