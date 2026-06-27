const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
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
                required: true,
                ref: 'Product'
            },
            addedAt: { 
                type: Date, 
                default: Date.now 
            }
        }
    ]
}, { timestamps: true });

// Use conditional to prevent OverwriteModelError
module.exports = mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);
