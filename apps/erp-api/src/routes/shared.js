const express = require('express');
const auth = require('../middlewares/auth.js');
const authorize = require('../middlewares/authorize.js');
const canAccessOwnData = require('../middlewares/canAccessOwnData.js');
const router = express.Router();

// controller per resource
const userCtrl = require('../controllers/profile.js');

router.get('/:userId', auth, authorize(['user']), canAccessOwnData, userCtrl.getMyProfile);
router.put('/:userId', auth, authorize(['user']), canAccessOwnData, userCtrl.updateMyProfile);

module.exports = router;
