/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/anon.js - Public/Anonymous routes
* Handles authentication, registration, and public information
* No authentication required for these endpoints
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const router = express.Router();

// Controllers
const userCtrl = require('../controllers/user.js');
const journeyCtrl = require('../controllers/journey.js');
const providerCtrl = require('../controllers/provider.js');

// util: wrap async
const wrap = require('../utils/wrap.js');
// util: valider un ObjectId 24 hex
const guardId = require('../utils/guardId.js');
const config = require('../configs/config.js');

// ========================================
// AUTHENTICATION ROUTES (Public)
// ========================================

/**
 * @route   POST /auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/auth/register', wrap(userCtrl.register));

/**
 * @route   POST /auth/login
 * @desc    Authenticate user and get JWT token
 * @access  Public
 */
router.post('/auth/login', wrap(userCtrl.login));

/**
 * @route   POST /auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post('/auth/forgot-password', wrap(userCtrl.forgotPassword));

/**
 * @route   POST /auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
router.post('/auth/reset-password', wrap(userCtrl.resetPassword));

/**
 * @route   POST /auth/verify-email
 * @desc    Verify email address using verification token
 * @access  Public
 */
router.post('/auth/verify-email', wrap(userCtrl.verifyEmail));

/**
 * @route   POST /auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post('/auth/resend-verification', wrap(userCtrl.resendVerification));

// ========================================
// PUBLIC INFORMATION ROUTES
// ========================================

/**
 * @route   GET /journeys
 * @desc    Get public journeys (no auth required)
 * @access  Public
 */
router.get('/journeys', wrap(journeyCtrl.getPublicJourneys));

/**
 * @route   GET /journeys/search
 * @desc    Search public journeys with filters
 * @access  Public
 */
router.get('/journeys/search', wrap(journeyCtrl.searchPublicJourneys));

/**
 * @route   GET /journeys/:journeyId
 * @desc    Get public journey details
 * @access  Public
 */
router.get('/journeys/:journeyId', guardId('journeyId'), wrap(journeyCtrl.getPublicJourneyDetails));


// ========================================
// SYSTEM ROUTES
// ========================================

/**
 * @route   GET /health
 * @desc    System health check
 * @access  Public
 */
router.get('/health', async (req, res) => {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Kizuna Travel OS API',
      uptime: process.uptime(),
      environment: config.server.nodeEnv,
      version: config.server.version,
      services: {
        database: 'unknown',
        redis: 'unknown',
        memory: 'unknown'
      },
      system: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      }
    };
  
    try {
      // Check database connection
      const mongoose = require('mongoose');
      healthCheck.services.database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    } catch {
      healthCheck.services.database = 'error';
    }
  
    try {
      // Check Redis connection (would need to import redisClient if available)
      // TODO: Import redisClient to enable this check
      healthCheck.services.redis = 'not_implemented';
    } catch {
      healthCheck.services.redis = 'error';
    }
  
    try {
      // Check memory usage
      const memUsage = process.memoryUsage();
      const memUsageMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      };
      healthCheck.services.memory = memUsageMB;
    } catch {
      healthCheck.services.memory = 'error';
    }
  
    const statusCode = healthCheck.services.database === 'connected' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
});


/**
 * @route   GET /
 * @desc    API root endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Kizuna Travel OS API',
    version: process.env.npm_package_version || '1.0.0',
    documentation: '/docs',
    health: '/health',
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        forgotPassword: 'POST /auth/forgot-password',
        resetPassword: 'POST /auth/reset-password',
        verifyEmail: 'POST /auth/verify-email',
        resendVerification: 'POST /auth/resend-verification'
      },
      public: {
        journeys: 'GET /journeys',
        journeySearch: 'GET /journeys/search',
        journeyDetails: 'GET /journeys/:id',
        providers: 'GET /providers',
        providerDetails: 'GET /providers/:id'
      },
      authenticated: {
        profile: 'GET /profile/me',
        customer: 'GET /customer/*',
        guide: 'GET /guide/*',
        agent: 'GET /agent/*',
        manager: 'GET /manager/*',
        admin: 'GET /admin/*'
      }
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;