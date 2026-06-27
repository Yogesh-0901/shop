const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product'); 

exports.toggleWishlist = async (req, res) => {
    try {
        // Get userId from authenticated user or from request body (legacy support)
        const userId = req.userId || req.body.userId;
        const { productId, action } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }

        if (!productId) {
            return res.status(400).json({ error: "Product ID required" });
        }

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = new Wishlist({ userId, items: [] });
        }

        if (action === 'add') {
            if (!wishlist.items.some(item => item.productId.toString() === productId)) {
                wishlist.items.push({ productId });
            }
        } else if (action === 'remove') {
            wishlist.items = wishlist.items.filter(item => item.productId.toString() !== productId);
        } else {
            return res.status(400).json({ error: "Invalid action" });
        }

        await wishlist.save();
        res.status(200).json({ message: "Wishlist updated", items: wishlist.items });
    } catch (error) {
        console.error('Wishlist toggle error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        // Get userId from authenticated user or from query param (legacy support)
        const userId = req.userId || req.query.userId || req.body.userId;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }

        const wishlist = await Wishlist.findOne({ userId });
        
        if (!wishlist) {
            return res.status(200).json([]);
        }

        const productIds = wishlist.items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        res.status(200).json(products);
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ error: error.message });
    }
};
