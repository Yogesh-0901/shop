const Cart = require('../models/Cart');
const Product = require('../models/Product');

// 1. Fetch the cart
exports.getCart = async (req, res) => {
    try {
        // Get userId from authenticated user or from params (legacy support)
        const userId = req.userId || req.params.userId || req.body.userId;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const cart = await Cart.findOne({ userId });
        
        if (cart && cart.items.length > 0) {
            const validItems = [];
            let cartModified = false;
            
            for (const item of cart.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    validItems.push(item);
                } else {
                    cartModified = true;
                }
            }
            
            if (cartModified) {
                cart.items = validItems;
                await cart.save();
            }
        }
        
        // Return the items array or an empty array if no cart exists
        res.status(200).json(cart ? cart.items : []);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch cart: " + error.message });
    }
};

// 2. Add, Update, or Remove items
exports.updateCart = async (req, res) => {
    try {
        // Get userId from authenticated user or from params (legacy support)
        const userId = req.userId || req.params.userId || req.body.userId;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const { productId, action, quantity } = req.body;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        // Fetch product to validate and get current price
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Validate stock
        if (action === 'add' || action === 'plus') {
            if (product.stock <= 0) {
                return res.status(400).json({ error: "Product is out of stock" });
            }
        }

        let cart = await Cart.findOne({ userId });

        // Create a new cart if one doesn't exist for this user
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);

        if (action === 'add' || action === 'plus') {
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += 1;
                // Update price in case it changed
                cart.items[itemIndex].price = product.price;
            } else {
                cart.items.push({ 
                    productId, 
                    name: product.name, 
                    price: product.price, 
                    image: product.image, 
                    quantity: 1 
                });
            }
        } else if (action === 'minus') {
            if (itemIndex > -1 && cart.items[itemIndex].quantity > 1) {
                cart.items[itemIndex].quantity -= 1;
            } else if (itemIndex > -1) {
                cart.items = cart.items.filter(p => p.productId.toString() !== productId);
            }
        } else if (action === 'remove') {
            cart.items = cart.items.filter(p => p.productId.toString() !== productId);
        } else {
            return res.status(400).json({ error: "Invalid action" });
        }

        await cart.save();
        res.status(200).json({ message: "Cart updated", items: cart.items }); // Return updated list to frontend
    } catch (error) {
        console.error('Cart update error:', error);
        res.status(500).json({ error: "Cart update failed: " + error.message });
    }
};