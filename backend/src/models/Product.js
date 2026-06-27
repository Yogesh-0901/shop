const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: {
        type: String,
        required: true,
        default: 'A quality product from our collection.'
    },
    price: { 
        type: Number, 
        required: true 
    },
    category: { 
        type: String, 
        default: 'General' 
    },
    section: { 
        type: String, 
        enum: ['men', 'women', 'kids', 'unisex'], 
        default: 'unisex' 
    },
    image: { 
        type: String, 
        required: true 
    },
    stock: {
        type: Number,
        required: true,
        default: 20,
        min: 0
    },
    rating: {
        type: Number,
        required: true,
        default: 4.5,
        min: 0,
        max: 5
    },
    // CRITICAL: Review Array to prevent "undefined" and JSON parse errors
    reviews: [
        {
            user: { type: String, required: true },
            stars: { type: Number, required: true, min: 1, max: 5 },
            comment: { type: String, required: true },
            userImage: { type: String },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

// Use a conditional to check if the model already exists to avoid OverwriteModelErrors
module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);