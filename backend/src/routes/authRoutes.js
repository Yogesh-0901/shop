const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// POST http://192.168.1.38:5000/api/auth/signup
router.post('/signup', authController.signup);

// POST http://192.168.1.38:5000/api/auth/login
router.post('/login', authController.login);

// GET http://192.168.1.38:5000/api/auth/verify
router.get('/verify', auth, authController.verifyToken);

// POST http://192.168.1.38:5000/api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;