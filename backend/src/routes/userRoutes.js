const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// PUT /api/users/profile
router.put('/profile', auth, userController.updateProfile);

// PUT /api/users/change-password
router.put('/change-password', auth, userController.changePassword);

module.exports = router;
