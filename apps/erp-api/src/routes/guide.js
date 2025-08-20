/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/guide.js - Guide routes for journey and booking management
* Enables guides to manage their assigned journeys and bookings
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
const journeyCtrl = require('../controllers/journey.js');
const bookingCtrl = require('../controllers/booking.js');

// Guide journey management
router.get('/journeys', auth, authorize(['guide']), journeyCtrl.getMyAssignedJourneys);
router.get('/journeys/:journeyId', auth, authorize(['guide']), journeyCtrl.getMyJourneyDetails);
router.put('/journeys/:journeyId/status', auth, authorize(['guide']), journeyCtrl.updateJourneyStatus);
router.post('/journeys/:journeyId/notes', auth, authorize(['guide']), journeyCtrl.addJourneyNotes);

// Guide booking management (view assigned bookings)
router.get('/bookings', auth, authorize(['guide']), bookingCtrl.getMyAssignedBookings);
router.get('/bookings/:bookingId', auth, authorize(['guide']), bookingCtrl.getMyAssignedBooking);
router.put('/bookings/:bookingId/status', auth, authorize(['guide']), bookingCtrl.updateBookingStatus);

// Guide schedule and availability
router.get('/schedule', auth, authorize(['guide']), journeyCtrl.getMySchedule);
router.put('/availability', auth, authorize(['guide']), profileCtrl.updateAvailability);

module.exports = router;
