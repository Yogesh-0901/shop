const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * 1. Create a new order
 * Triggered by the "SUBMIT ORDER" button on the Checkout page.
 */
exports.createOrder = async (req, res) => {
    try {
        // Get userId from authenticated user or from request body (legacy support)
        const userId = req.userId || req.body.userId;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const { deliveryCarrier, deliveryAddress, paymentMethod } = req.body;
        
        // Find user's cart to get the actual items being purchased
        const cart = await Cart.findOne({ userId });
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: "Your cart is empty. Cannot place order." });
        }

        // Validate stock for all items
        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
                });
            }
        }

        // Calculate total amount from cart items (validation)
        const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create the new order document in MongoDB
        const newOrder = new Order({
            userId, // Store as String (email or userId)
            items: cart.items,
            totalAmount,
            deliveryCarrier: deliveryCarrier || 'Standard',
            deliveryAddress: deliveryAddress || '',
            paymentMethod: paymentMethod || 'Cash on Delivery',
            status: 'Processing'
        });

        await newOrder.save();

        // Deduct stock from products
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } }
            );
        }

        // IMPORTANT: Clear the user's cart after successful order placement
        // This ensures the basket is empty when they return to the home screen.
        await Cart.findOneAndDelete({ userId }); 

        // Send back a success response to the mobile app
        res.status(201).json({ 
            message: "Order placed successfully", 
            orderId: newOrder._id,
            order: {
                _id: newOrder._id,
                items: newOrder.items,
                totalAmount: newOrder.totalAmount,
                status: newOrder.status,
                createdAt: newOrder.createdAt
            }
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: "Checkout process failed: " + error.message });
    }
};

/**
 * 2. Fetch user order history
 * Used by the Profile page to display "My Orders".
 */
exports.getUserOrders = async (req, res) => {
    try {
        // Get userId from authenticated user or from params (legacy support)
        const userId = req.userId || req.params.userId || req.body.userId;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Find all orders associated with this user
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: "Failed to fetch orders: " + error.message });
    }
};

/**
 * 3. Fetch orders for a specific seller
 * Finds all orders containing at least one product owned by the seller.
 */
exports.getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user.userId;

        // 1. Find all products owned by this seller
        const sellerProducts = await Product.find({ seller: sellerId }, '_id');
        const sellerProductIds = sellerProducts.map(p => p._id.toString());

        if (sellerProductIds.length === 0) {
            return res.status(200).json([]);
        }

        // 2. Find all orders that contain at least one of these products
        const orders = await Order.find({
            'items.productId': { $in: sellerProductIds }
        }).sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({ error: "Failed to fetch seller orders" });
    }
};

/**
 * 4. Update Order Status (Seller only)
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status update" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        order.status = status;
        await order.save();

        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: "Failed to update order status" });
    }
};