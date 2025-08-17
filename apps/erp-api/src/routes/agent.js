/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/agent.js - Agent routes for customer and booking management
* Enables agents to manage customers and bookings
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

// Agent customer management
router.get('/customers', auth, authorize(['agent']), userCtrl.getCustomers);
router.get('/customers/:customerId', auth, authorize(['agent']), userCtrl.getCustomerById);
router.put('/customers/:customerId', auth, authorize(['agent']), userCtrl.updateCustomer);
router.post('/customers/:customerId/status', auth, authorize(['agent']), userCtrl.updateCustomerStatus);

// Agent booking management
router.get('/bookings', auth, authorize(['agent']), bookingCtrl.getAllBookings);
router.get('/bookings/:bookingId', auth, authorize(['agent']), bookingCtrl.getBookingById);
router.put('/bookings/:bookingId', auth, authorize(['agent']), bookingCtrl.updateBooking);
router.post('/bookings/:bookingId/status', auth, authorize(['agent']), bookingCtrl.updateBookingStatus);
router.post('/bookings', auth, authorize(['agent']), bookingCtrl.createBookingForCustomer);

// Agent journey management
router.get('/journeys', auth, authorize(['agent']), journeyCtrl.getAllJourneys);
router.get('/journeys/:journeyId', auth, authorize(['agent']), journeyCtrl.getJourneyById);
router.put('/journeys/:journeyId', auth, authorize(['agent']), journeyCtrl.updateJourney);
router.post('/journeys/:journeyId/assign-guide', auth, authorize(['agent']), journeyCtrl.assignGuide);

// Agent provider management
router.get('/providers', auth, authorize(['agent']), providerCtrl.getAllProviders);
router.get('/providers/:providerId', auth, authorize(['agent']), providerCtrl.getProviderById);
router.put('/providers/:providerId', auth, authorize(['agent']), providerCtrl.updateProvider);

module.exports = router;
