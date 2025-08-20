/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/manager.js - Manager routes for system management
* Provides management-level system administration capabilities
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const auth = require('../middlewares/testAuth.js');
const authorize = require('../middlewares/testAuth.js').authorize;
// const canAccessOwnData = require('../middlewares/canAccessOwnData.js');
const { validateData } = require('../middlewares/dataValidation.js');
const router = express.Router();

// Import controllers
const userCtrl = require('../controllers/user.js');
const profileCtrl = require('../controllers/profile.js');
const bookingCtrl = require('../controllers/booking.js');
const journeyCtrl = require('../controllers/journey.js');
const providerCtrl = require('../controllers/provider.js');

// Manager user management (full access)
router.get('/users', auth, authorize(['manager']), userCtrl.getAllUsers);
router.get('/users/:userId', auth, authorize(['manager']), userCtrl.getUserById);
router.post('/users', auth, authorize(['manager']), userCtrl.createUser);
router.put('/users/:userId', auth, authorize(['manager']), userCtrl.updateUser);
router.delete('/users/:userId', auth, authorize(['manager']), userCtrl.deleteUser);
router.post('/users/:userId/status', auth, authorize(['manager']), userCtrl.updateUserStatus);
router.post('/users/:userId/role', auth, authorize(['manager']), userCtrl.updateUserRole);

// Manager profile management (full access)
router.get('/profiles', auth, authorize(['manager']), profileCtrl.getAllProfiles);
router.get('/profiles/stats', auth, authorize(['manager']), profileCtrl.getProfileStats);
router.get('/profiles/:profileId', auth, authorize(['manager']), profileCtrl.getProfileById);
router.put('/profiles/:profileId', auth, authorize(['manager']), profileCtrl.updateProfileById);
router.delete('/profiles/:profileId', auth, authorize(['manager']), profileCtrl.deleteProfile);
router.post('/profiles/:profileId/restore', auth, authorize(['manager']), profileCtrl.restoreProfile);

// Manager booking management (full access)
router.get('/bookings', auth, authorize(['manager']), bookingCtrl.getAllBookings);
router.get('/bookings/stats', auth, authorize(['manager']), bookingCtrl.getBookingStats);
router.get('/bookings/:bookingId', auth, authorize(['manager']), bookingCtrl.getBookingById);
router.post('/bookings', auth, authorize(['manager']), bookingCtrl.createBooking);
router.put('/bookings/:bookingId', auth, authorize(['manager']), bookingCtrl.updateBooking);
router.delete('/bookings/:bookingId', auth, authorize(['manager']), bookingCtrl.deleteBooking);

// Manager journey management (full access)
router.get('/journeys', auth, authorize(['manager']), journeyCtrl.getAllJourneys);
router.get('/journeys/stats', auth, authorize(['manager']), journeyCtrl.getJourneyStats);
router.get('/journeys/:journeyId', auth, authorize(['manager']), journeyCtrl.getJourneyById);
router.post('/journeys', auth, authorize(['manager']), validateData('journeyCreation'), journeyCtrl.createJourney);
router.put('/journeys/:journeyId', auth, authorize(['manager']), journeyCtrl.updateJourney);
router.delete('/journeys/:journeyId', auth, authorize(['manager']), journeyCtrl.deleteJourney);
router.post('/journeys/:journeyId/assign-guide', auth, authorize(['manager']), journeyCtrl.assignGuide);

// Manager provider management (full access)
router.get('/providers', auth, authorize(['manager']), providerCtrl.getAllProviders);
router.get('/providers/stats', auth, authorize(['manager']), providerCtrl.getProviderStats);
router.get('/providers/search', auth, authorize(['manager']), providerCtrl.searchProviders);
router.get('/providers/:providerId', auth, authorize(['manager']), providerCtrl.getProviderById);
router.post('/providers', auth, authorize(['manager']), validateData('providerCreation'), providerCtrl.createProvider);
router.put('/providers/:providerId', auth, authorize(['manager']), providerCtrl.updateProvider);
router.delete('/providers/:providerId', auth, authorize(['manager']), providerCtrl.deleteProvider);
router.post('/providers/:providerId/restore', auth, authorize(['manager']), providerCtrl.restoreProvider);

// Manager system management
router.get('/system/stats', auth, authorize(['manager']), userCtrl.getSystemStats);
router.get('/system/health', auth, authorize(['manager']), userCtrl.getSystemHealth);

module.exports = router;
