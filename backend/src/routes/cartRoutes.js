const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

// GET: Fetch user's cart
// Matches: GET /api/cart with auth token
router.get('/', auth, cartController.getCart);

// GET: Fetch specific user's cart (with auth)
router.get('/:userId', auth, cartController.getCart);

// POST: Add, Update, or Remove items
// Matches: POST /api/cart with auth token
router.post('/', auth, cartController.updateCart);

// POST: Add, Update, or Remove items (legacy - with userId in path)
router.post('/:userId', auth, cartController.updateCart);

module.exports = router;