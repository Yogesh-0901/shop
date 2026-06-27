const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// POST: Log a new transaction
router.post('/log', auth, transactionController.logTransaction);

// GET: Get a specific transaction
router.get('/:transactionId', auth, transactionController.getTransaction);

// GET: Get all transactions for an order
router.get('/order/:orderId', auth, transactionController.getOrderTransactions);

module.exports = router;