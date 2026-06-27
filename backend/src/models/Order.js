const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true,
        index: true
    },
    items: {
        type: Array,
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Order must contain at least one item'
        }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    deliveryCarrier: {
        type: String,
        default: 'Standard',
        enum: ['Standard', 'Express', 'Overnight', 'Pickup']
    },
    deliveryAddress: {
        type: String,
        default: ''
    },
    paymentMethod: {
        type: String,
        default: 'Cash on Delivery',
        enum: ['Cash on Delivery', 'Credit Card', 'Debit Card', 'UPI', 'Wallet']
    },
    status: {
        type: String,
        default: 'Processing',
        enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Failed']
    },
    trackingNumber: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Index for faster queries
OrderSchema.index({ userId: 1, createdAt: -1 });

// Use conditional to prevent OverwriteModelError
module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);