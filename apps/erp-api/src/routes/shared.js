/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/shared.js - Shared routes for all authenticated users
* Provides common functionality for all user types
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

// Shared profile routes for all authenticated users
router.get('/profile/me', auth, profileCtrl.getMyProfile);
router.put('/profile/me', auth, profileCtrl.updateMyProfile);

// Shared account management routes for all authenticated users
router.put('/account/password', auth, userCtrl.changePassword);
router.put('/account/email', auth, userCtrl.updateEmail);

// Shared profile routes with user ID parameter (own data only)
router.get('/:userId', auth, canAccessOwnData, profileCtrl.getMyProfile);
router.put('/:userId', auth, canAccessOwnData, profileCtrl.updateMyProfile);

module.exports = router;
