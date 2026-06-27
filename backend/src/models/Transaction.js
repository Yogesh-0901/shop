const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    orderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order', 
        required: true,
        index: true
    },
    userId: { 
        type: String,
        required: false,
        index: true
    },
    paymentId: { 
        type: String,
        required: true,
        unique: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash on Delivery', 'Credit Card', 'Debit Card', 'UPI', 'Wallet'],
        default: 'Cash on Delivery'
    },
    status: { 
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Cancelled'],
        default: 'Processing' 
    },
    amount: { 
        type: Number,
        required: true,
        min: 0
    },
    reference: {
        type: String,
        default: null
    },
    date: { 
        type: Date, 
        default: Date.now,
        index: true
    }
}, { timestamps: true });

// Use conditional to prevent OverwriteModelError
module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);