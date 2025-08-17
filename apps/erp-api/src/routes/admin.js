/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/admin.js - Admin routes for system management
* Provides full system administration capabilities
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const auth = require('../middlewares/auth.js');
const authorize = require('../middlewares/authorize.js');
const canAccessOwnData = require('../middlewares/canAccessOwnData.js');
const router = express.Router();

// Import controllers
const userCtrl = require('../controllers/user.js');
const profileCtrl = require('../controllers/profile.js');
const bookingCtrl = require('../controllers/booking.js');
const journeyCtrl = require('../controllers/journey.js');
const providerCtrl = require('../controllers/provider.js');

// Admin user management (full access + admin-specific functions)
router.get('/users', auth, authorize(['admin']), userCtrl.getAllUsers);
router.get('/users/:userId', auth, authorize(['admin']), userCtrl.getUserById);
router.post('/users', auth, authorize(['admin']), userCtrl.createUser);
router.put('/users/:userId', auth, authorize(['admin']), userCtrl.updateUser);
router.delete('/users/:userId', auth, authorize(['admin']), userCtrl.deleteUser);
router.post('/users/:userId/status', auth, authorize(['admin']), userCtrl.updateUserStatus);
router.post('/users/:userId/role', auth, authorize(['admin']), userCtrl.updateUserRole);
router.post('/users/:userId/activate', auth, authorize(['admin']), userCtrl.activateUser);
router.post('/users/:userId/deactivate', auth, authorize(['admin']), userCtrl.deactivateUser);
router.post('/users/:userId/unlock', auth, authorize(['admin']), userCtrl.unlockUser);
router.get('/users/stats', auth, authorize(['admin']), userCtrl.getUserStats);

// Admin profile management (full access + admin-specific functions)
router.get('/profiles', auth, authorize(['admin']), profileCtrl.getAllProfiles);
router.get('/profiles/:profileId', auth, authorize(['admin']), profileCtrl.getProfileById);
router.put('/profiles/:profileId', auth, authorize(['admin']), profileCtrl.updateProfileById);
router.delete('/profiles/:profileId', auth, authorize(['admin']), profileCtrl.deleteProfile);
router.post('/profiles/:profileId/restore', auth, authorize(['admin']), profileCtrl.restoreProfile);
router.get('/profiles/stats', auth, authorize(['admin']), profileCtrl.getProfileStats);

// Admin booking management (full access + admin-specific functions)
router.get('/bookings', auth, authorize(['admin']), bookingCtrl.getAllBookings);
router.get('/bookings/:bookingId', auth, authorize(['admin']), bookingCtrl.getBookingById);
router.post('/bookings', auth, authorize(['admin']), bookingCtrl.createBooking);
router.put('/bookings/:bookingId', auth, authorize(['admin']), bookingCtrl.updateBooking);
router.delete('/bookings/:bookingId', auth, authorize(['admin']), bookingCtrl.deleteBooking);
router.get('/bookings/stats', auth, authorize(['admin']), bookingCtrl.getBookingStats);

// Admin journey management (full access + admin-specific functions)
router.get('/journeys', auth, authorize(['admin']), journeyCtrl.getAllJourneys);
router.get('/journeys/:journeyId', auth, authorize(['admin']), journeyCtrl.getJourneyById);
router.post('/journeys', auth, authorize(['admin']), journeyCtrl.createJourney);
router.put('/journeys/:journeyId', auth, authorize(['admin']), journeyCtrl.updateJourney);
router.delete('/journeys/:journeyId', auth, authorize(['admin']), journeyCtrl.deleteJourney);
router.post('/journeys/:journeyId/assign-guide', auth, authorize(['admin']), journeyCtrl.assignGuide);
router.get('/journeys/stats', auth, authorize(['admin']), journeyCtrl.getJourneyStats);

// Admin provider management (full access + admin-specific functions)
router.get('/providers', auth, authorize(['admin']), providerCtrl.getAllProviders);
router.get('/providers/:providerId', auth, authorize(['admin']), providerCtrl.getProviderById);
router.post('/providers', auth, authorize(['admin']), providerCtrl.createProvider);
router.put('/providers/:providerId', auth, authorize(['admin']), providerCtrl.updateProvider);
router.delete('/providers/:providerId', auth, authorize(['admin']), providerCtrl.deleteProvider);

// Admin system management and monitoring
router.get('/system/stats', auth, authorize(['admin']), userCtrl.getSystemStats);
router.get('/system/health', auth, authorize(['admin']), userCtrl.getSystemHealth);
router.get('/system/audit-logs', auth, authorize(['admin']), userCtrl.getAuditLogs);
router.get('/system/security-events', auth, authorize(['admin']), userCtrl.getSecurityEvents);

// Admin role and permission management
router.get('/roles', auth, authorize(['admin']), userCtrl.getAllRoles);
router.post('/roles', auth, authorize(['admin']), userCtrl.createRole);
router.put('/roles/:roleId', auth, authorize(['admin']), userCtrl.updateRole);
router.delete('/roles/:roleId', auth, authorize(['admin']), userCtrl.deleteRole);

// Admin data export and GDPR compliance
router.get('/export/users', auth, authorize(['admin']), userCtrl.exportUsers);
router.get('/export/bookings', auth, authorize(['admin']), bookingCtrl.exportBookings);
router.get('/export/journeys', auth, authorize(['admin']), journeyCtrl.exportJourneys);

module.exports = router;

