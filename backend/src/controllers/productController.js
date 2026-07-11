const Product = require('../models/Product'); 

// 1. Fetch products with optional filtering (Section and Category)
exports.getProducts = async (req, res) => {
    try {
        // Extract filters from the URL query parameters (e.g., ?section=men&category=Watches)
        const { section, category, limit, skip } = req.query; 
        let query = {};

        // If 'section' (men/women/kids) is provided, add it to the search
        if (section) query.section = section; 
        
        // If 'category' (Watches/Shoes/etc.) is provided, add it to the search
        if (category) query.category = category; 

        // Pagination support
        const skipValue = parseInt(skip) || 0;
        const limitValue = Math.min(parseInt(limit) || 50, 100); // Max 100 per page

        // Retrieves products from MongoDB matching the query, sorted by newest first
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skipValue)
            .limit(limitValue);

        const total = await Product.countDocuments(query);

        res.status(200).json({ 
            products, 
            total, 
            page: Math.floor(skipValue / limitValue) + 1,
            pages: Math.ceil(total / limitValue)
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: "Failed to fetch products: " + error.message });
    }
};

// 2. Fetch a single product for the Product Details Page
exports.getProductById = async (req, res) => {
    try {
        // Find product by its MongoDB _id from the URL parameter
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.status(200).json(product);
    } catch (error) {
        console.error('Get product by id error:', error);
        res.status(500).json({ error: "Error fetching product: " + error.message });
    }
};

// 3. Add a review to a specific product
exports.addReview = async (req, res) => {
    try {
        const { stars, comment, user, userImage } = req.body;
        const productId = req.params.id;

        // Validate input
        if (!stars || !comment || !user) {
            return res.status(400).json({ error: "Stars, comment, and user name are required" });
        }

        if (typeof stars !== 'number' || stars < 1 || stars > 5) {
            return res.status(400).json({ error: "Stars must be between 1 and 5" });
        }

        if (comment.length < 1 || comment.length > 500) {
            return res.status(400).json({ error: "Comment must be between 1 and 500 characters" });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Create the new review object
        const newReview = {
            user: String(user).substring(0, 50), // Limit user name
            stars: Number(stars),
            comment: String(comment).substring(0, 500), // Limit comment
            userImage: userImage ? String(userImage) : null,
            createdAt: new Date()
        };

        if (!product.reviews) {
            product.reviews = [];
        }

        // Push review to the product's review array
        product.reviews.push(newReview); 
        await product.save();

        // Return the updated list of reviews so the app updates instantly
        res.status(201).json({ message: "Review added", reviews: product.reviews });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ error: "Review submission failed: " + error.message });
    }
};

// 4. Create a new product (Seller Upload) - Protected endpoint
exports.createProduct = async (req, res) => {
    try {
        const { name, price, category, section, description, stock, rating, image } = req.body;
        
        // Validate required fields
        if (!name || !price || !description) {
            return res.status(400).json({ error: "Name, price, and description are required" });
        }

        // Validate input types and ranges
        const priceNum = Number(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            return res.status(400).json({ error: "Price must be a positive number" });
        }

        if (name.length < 3 || name.length > 200) {
            return res.status(400).json({ error: "Name must be between 3 and 200 characters" });
        }

        if (description.length < 10 || description.length > 2000) {
            return res.status(400).json({ error: "Description must be between 10 and 2000 characters" });
        }

        const stockNum = Number(stock || 20);
        if (isNaN(stockNum) || stockNum < 0) {
            return res.status(400).json({ error: "Stock must be a non-negative number" });
        }

        const ratingNum = Number(rating || 4.5);
        if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
            return res.status(400).json({ error: "Rating must be between 0 and 5" });
        }

        // Get image URL
        const imageUrl = image || (req.file ? req.file.path : '');

        if (!imageUrl) {
            return res.status(400).json({ error: "Please provide an image URL or upload a product image" });
        }

        // Validate section if provided
        const validSections = ['men', 'women', 'kids', 'unisex'];
        if (section && !validSections.includes(section)) {
            return res.status(400).json({ error: "Invalid section. Must be one of: " + validSections.join(', ') });
        }

        const newProduct = new Product({
            name: name.trim(),
            seller: req.user.userId,
            description: description.trim(),
            price: priceNum,
            category: (category || 'General').trim(),
            section: section || 'unisex',
            image: imageUrl,
            stock: stockNum,
            rating: ratingNum
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: "Product creation failed: " + error.message });
    }
};

// 5. Get Products for the Logged-in Seller
exports.getSellerProducts = async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user.userId }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error('Get seller products error:', error);
        res.status(500).json({ error: "Failed to fetch seller products" });
    }
};

// 6. Update a Product (Seller only)
exports.updateProduct = async (req, res) => {
    try {
        const { name, price, description, category, section, stock, image } = req.body;
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check if the user owns this product
        if (product.seller.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Unauthorized. You do not own this product." });
        }

        const priceNum = Number(price);
        if (price !== undefined && (isNaN(priceNum) || priceNum <= 0)) {
            return res.status(400).json({ error: "Price must be a positive number" });
        }

        if (name) product.name = name.trim();
        if (price) product.price = priceNum;
        if (description) product.description = description.trim();
        if (category) product.category = category.trim();
        if (section) product.section = section;
        if (stock !== undefined) product.stock = Number(stock);
        if (image) {
            product.image = image;
        } else if (req.file) {
            product.image = req.file.path;
        } await product.save();
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: "Failed to update product" });
    }
};

// 7. Delete a Product (Seller only)
exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (product.seller.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Unauthorized. You do not own this product." });
        }

        await Product.findByIdAndDelete(productId);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: "Failed to delete product" });
    }
};