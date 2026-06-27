const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true,
        unique: true,
        index: true
    },
    items: [
        {
            productId: { 
                type: mongoose.Schema.Types.ObjectId, 
                required: true 
            },
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true,
                min: 0
            },
            image: {
                type: String,
                required: true
            },
            quantity: { 
                type: Number, 
                default: 1,
                min: 1,
                max: 999
            }
        }
    ]
}, { timestamps: true });

// Use conditional to prevent OverwriteModelError
module.exports = mongoose.models.Cart || mongoose.model('Cart', CartSchema);