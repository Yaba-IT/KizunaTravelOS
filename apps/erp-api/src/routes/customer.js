/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/customer.js - Customer routes for booking and journey management
* Enables customers to manage their bookings and browse journeys
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const auth = require('../middlewares/testAuth.js');
const authorize = require('../middlewares/testAuth.js').authorize;
const router = express.Router();

// Import controllers
const userCtrl = require('../controllers/user.js');
// const profileCtrl = require('../controllers/profile.js');
const bookingCtrl = require('../controllers/booking.js');
const journeyCtrl = require('../controllers/journey.js');

// Customer booking management
router.get('/bookings', auth, authorize(['customer']), bookingCtrl.getMyBookings);
router.get('/bookings/:bookingId', auth, authorize(['customer']), bookingCtrl.getMyBooking);
router.post('/bookings', auth, authorize(['customer']), bookingCtrl.createBooking);
router.put('/bookings/:bookingId', auth, authorize(['customer']), bookingCtrl.updateMyBooking);
router.delete('/bookings/:bookingId', auth, authorize(['customer']), bookingCtrl.cancelMyBooking);

// Customer journey browsing
router.get('/journeys', auth, authorize(['customer']), journeyCtrl.getAvailableJourneys);
router.get('/journeys/:journeyId', auth, authorize(['customer']), journeyCtrl.getJourneyDetails);

// Customer account management
router.delete('/account', auth, authorize(['customer']), userCtrl.deactivateAccount);

module.exports = router;
