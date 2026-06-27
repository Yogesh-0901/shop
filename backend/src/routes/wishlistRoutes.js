const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const auth = require('../middleware/auth');

// POST: Add or remove an item from the wishlist
router.post('/', auth, wishlistController.toggleWishlist);

// GET: Get all items in the wishlist
router.get('/', auth, wishlistController.getWishlist);

module.exports = router;