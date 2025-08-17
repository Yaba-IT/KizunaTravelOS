/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/anon.js - Anonymous/public routes for authentication
* Handles public access for registration and login
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const router = express.Router();

// Import controllers
const userCtrl = require('../controllers/user.js');
const journeyCtrl = require('../controllers/journey.js');
const providerCtrl = require('../controllers/provider.js');

// Public authentication routes
router.post('/auth/register', userCtrl.register);
router.post('/auth/login', userCtrl.login);
router.post('/auth/forgot-password', userCtrl.forgotPassword);
router.post('/auth/reset-password', userCtrl.resetPassword);
router.post('/auth/verify-email', userCtrl.verifyEmail);
router.post('/auth/resend-verification', userCtrl.resendVerification);

// Public journey browsing (no auth required)
router.get('/journeys', journeyCtrl.getPublicJourneys);
router.get('/journeys/:journeyId', journeyCtrl.getPublicJourneyDetails);
router.get('/journeys/search', journeyCtrl.searchPublicJourneys);

// Public provider information
router.get('/providers', providerCtrl.getPublicProviders);
router.get('/providers/:providerId', providerCtrl.getPublicProviderDetails);

// Public health check
router.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

module.exports = router;
