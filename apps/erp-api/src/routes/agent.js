/* Yaba-IT/KizunaTravelOS
 * apps/erp-api/src/routes/agent.js
 *
 * coded by farid212@Yaba-IT!
 */

const express = require('express');
const auth = require('../middlewares/auth.js');
const authorize = require('../middlewares/authorize.js');

// Controllers
const userCtrl = require('../controllers/user.js');
const bookingCtrl = require('../controllers/booking.js');
const journeyCtrl = require('../controllers/journey.js');
const providerCtrl = require('../controllers/provider.js');

const router = express.Router();

// util: catcher async
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// util: garde d'ID (ObjectId-like 24 hex)
const isHex24 = (v) => /^[a-fA-F0-9]{24}$/.test(v);
const guardId = (name) => (req, res, next) => {
  const val = req.params[name];
  if (val && !isHex24(val)) return res.status(400).json({ error: 'invalid_id', param: name });
  next();
};

// protection globale
router.use(auth);
router.use(authorize(['agent']));

// Customers
router.get('/customers', wrap(userCtrl.getCustomers));
router.get('/customers/:customerId', guardId('customerId'), wrap(userCtrl.getCustomerById));
router.put('/customers/:customerId', guardId('customerId'), wrap(userCtrl.updateCustomer));
router.post('/customers/:customerId/status', guardId('customerId'), wrap(userCtrl.updateCustomerStatus));

// Bookings
router.get('/bookings', wrap(bookingCtrl.getAllBookings));
router.get('/bookings/:bookingId', guardId('bookingId'), wrap(bookingCtrl.getBookingById));
router.put('/bookings/:bookingId', guardId('bookingId'), wrap(bookingCtrl.updateBooking));
router.post('/bookings/:bookingId/status', guardId('bookingId'), wrap(bookingCtrl.updateBookingStatus));
router.post('/bookings', wrap(bookingCtrl.createBookingForCustomer));

// Journeys
router.get('/journeys', wrap(journeyCtrl.getAllJourneys));
router.get('/journeys/:journeyId', guardId('journeyId'), wrap(journeyCtrl.getJourneyById));
router.put('/journeys/:journeyId', guardId('journeyId'), wrap(journeyCtrl.updateJourney));
router.post('/journeys/:journeyId/assign-guide', guardId('journeyId'), wrap(journeyCtrl.assignGuide));

// Providers
router.get('/providers', wrap(providerCtrl.getAllProviders));
router.get('/providers/:providerId', guardId('providerId'), wrap(providerCtrl.getProviderById));
router.put('/providers/:providerId', guardId('providerId'), wrap(providerCtrl.updateProvider));

module.exports = router;