/* Yaba-IT/KizunaTravelOS
 * apps/erp-api/src/routes/admin.js
 */

const express = require('express');
const auth = require('../middlewares/auth.js');
const authorize = require('../middlewares/authorize.js');

const userCtrl = require('../controllers/user.js');
const profileCtrl = require('../controllers/profile.js');
const bookingCtrl = require('../controllers/booking.js');
const journeyCtrl = require('../controllers/journey.js');
const providerCtrl = require('../controllers/provider.js');

const router = express.Router();

// utils
const wrap = require('../utils/wrap.js');
const guardId = require('../utils/guardId.js');

// protect all /admin
router.use(auth);
router.use(authorize(['admin']));

/* Users */
router.get('/users', wrap(userCtrl.getAllUsers));
router.get('/users/stats', wrap(userCtrl.getUserStats));
router.get('/users/:userId', guardId('userId'), wrap(userCtrl.getUserById));
router.post('/users', wrap(userCtrl.createUser));                  // controller should return 201
router.put('/users/:userId', guardId('userId'), wrap(userCtrl.updateUser));
router.delete('/users/:userId', guardId('userId'), wrap(userCtrl.deleteUser));
router.post('/users/:userId/status', guardId('userId'), wrap(userCtrl.updateUserStatus));
router.post('/users/:userId/role', guardId('userId'), wrap(userCtrl.updateUserRole));
router.post('/users/:userId/activate', guardId('userId'), wrap(userCtrl.activateUser));
router.post('/users/:userId/deactivate', guardId('userId'), wrap(userCtrl.deactivateUser));
router.post('/users/:userId/unlock', guardId('userId'), wrap(userCtrl.unlockUser));

/* Profiles */
router.get('/profiles', wrap(profileCtrl.getAllProfiles));
router.get('/profiles/stats', wrap(profileCtrl.getProfileStats));
router.get('/profiles/:profileId', guardId('profileId'), wrap(profileCtrl.getProfileById));
router.put('/profiles/:profileId', guardId('profileId'), wrap(profileCtrl.updateProfileById));
router.delete('/profiles/:profileId', guardId('profileId'), wrap(profileCtrl.deleteProfile));
router.post('/profiles/:profileId/restore', guardId('profileId'), wrap(profileCtrl.restoreProfile));

/* Bookings */
router.get('/bookings', wrap(bookingCtrl.getAllBookings));
router.get('/bookings/stats', wrap(bookingCtrl.getBookingStats));
router.get('/bookings/:bookingId', guardId('bookingId'), wrap(bookingCtrl.getBookingById));
router.post('/bookings', wrap(bookingCtrl.createBooking));         // controller should return 201
router.put('/bookings/:bookingId', guardId('bookingId'), wrap(bookingCtrl.updateBooking));
router.delete('/bookings/:bookingId', guardId('bookingId'), wrap(bookingCtrl.deleteBooking));

/* Journeys */
router.get('/journeys', wrap(journeyCtrl.getAllJourneys));
router.get('/journeys/stats', wrap(journeyCtrl.getJourneyStats));
router.get('/journeys/:journeyId', guardId('journeyId'), wrap(journeyCtrl.getJourneyById));
router.post('/journeys', wrap(journeyCtrl.createJourney));         // controller should return 201
router.put('/journeys/:journeyId', guardId('journeyId'), wrap(journeyCtrl.updateJourney));
router.delete('/journeys/:journeyId', guardId('journeyId'), wrap(journeyCtrl.deleteJourney));
router.post('/journeys/:journeyId/assign-guide', guardId('journeyId'), wrap(journeyCtrl.assignGuide));

/* Providers */
// place /search before /:providerId to avoid shadowing
router.get('/providers', wrap(providerCtrl.getAllProviders));
router.get('/providers/stats', wrap(providerCtrl.getProviderStats));
router.get('/providers/search', wrap(providerCtrl.searchProviders));
router.get('/providers/:providerId', guardId('providerId'), wrap(providerCtrl.getProviderById));
router.post('/providers', wrap(providerCtrl.createProvider));      // controller should return 201
router.put('/providers/:providerId', guardId('providerId'), wrap(providerCtrl.updateProvider));
router.delete('/providers/:providerId', guardId('providerId'), wrap(providerCtrl.deleteProvider));
router.post('/providers/:providerId/restore', guardId('providerId'), wrap(providerCtrl.restoreProvider));

/* System */
router.get('/system/stats', wrap(userCtrl.getSystemStats));
router.get('/system/health', wrap(userCtrl.getSystemHealth));
router.get('/system/logs', wrap(userCtrl.getAuditLogs));           // alias
router.get('/system/audit-logs', wrap(userCtrl.getAuditLogs));
router.get('/system/security-events', wrap(userCtrl.getSecurityEvents));
router.post('/system/backup', wrap(userCtrl.getSystemBackup));
router.post('/system/restore', wrap(userCtrl.restoreSystemBackup));

/* Roles */
router.get('/roles', wrap(userCtrl.getAllRoles));
router.post('/roles', wrap(userCtrl.createRole));
router.put('/roles/:roleId', guardId('roleId'), wrap(userCtrl.updateRole));
router.delete('/roles/:roleId', guardId('roleId'), wrap(userCtrl.deleteRole));

module.exports = router;