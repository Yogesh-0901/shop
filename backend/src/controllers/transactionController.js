const Transaction = require('../models/Transaction');
const Order = require('../models/Order');

const validStatuses = ['Pending', 'Processing', 'Completed', 'Failed', 'Cancelled'];

exports.logTransaction = async (req, res) => {
    try {
        const { orderId, paymentId, status, amount } = req.body;
        const userId = req.userId || req.body.userId;

        // Validate required fields
        if (!orderId || !paymentId) {
            return res.status(400).json({ error: "Order ID and Payment ID are required" });
        }

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: "Invalid status. Must be one of: " + validStatuses.join(', ') 
            });
        }

        // Verify order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Validate amount if provided
        if (amount && (typeof amount !== 'number' || amount <= 0)) {
            return res.status(400).json({ error: "Amount must be a positive number" });
        }

        const newTransaction = new Transaction({
            orderId,
            userId: userId || order.userId,
            paymentId,
            status,
            amount: amount || order.totalAmount
        });

        await newTransaction.save();

        // Update order status if payment was successful
        if (status === 'Completed') {
            await Order.findByIdAndUpdate(orderId, { status: 'Confirmed' });
        } else if (status === 'Failed' || status === 'Cancelled') {
            await Order.findByIdAndUpdate(orderId, { status: 'Failed' });
        }

        res.status(201).json({ 
            message: "Transaction logged successfully",
            transaction: newTransaction 
        });
    } catch (error) {
        console.error('Log transaction error:', error);
        res.status(500).json({ error: "Failed to log transaction: " + error.message });
    }
};

exports.getTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        if (!transactionId) {
            return res.status(400).json({ error: "Transaction ID is required" });
        }

        const transaction = await Transaction.findById(transactionId);
        
        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        res.status(200).json(transaction);
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ error: "Failed to fetch transaction: " + error.message });
    }
};

exports.getOrderTransactions = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }

        const transactions = await Transaction.find({ orderId }).sort({ createdAt: -1 });
        
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Get order transactions error:', error);
        res.status(500).json({ error: "Failed to fetch transactions: " + error.message });
    }
};