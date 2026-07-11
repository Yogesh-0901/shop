const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// POST: Create a new order
router.post('/', auth, orderController.createOrder);

// GET: Get user's orders
router.get('/', auth, orderController.getUserOrders);

// GET: Get user's orders (legacy - with userId in path)
router.get('/:userId', auth, orderController.getUserOrders);

// GET: Get seller's orders
router.get('/seller/orders', auth, orderController.getSellerOrders);

// PUT: Update order status
router.put('/:id/status', auth, orderController.updateOrderStatus);

module.exports = router;