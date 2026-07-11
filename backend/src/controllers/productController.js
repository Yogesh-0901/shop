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

        if (comment.length < 5 || comment.length > 500) {
            return res.status(400).json({ error: "Comment must be between 5 and 500 characters" });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Create the new review object
        const newReview = {
            user: user.substring(0, 50), // Limit user name
            stars: Number(stars),
            comment: comment.substring(0, 500), // Limit comment
            userImage: userImage || null,
            createdAt: new Date()
        };

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
        const imageUrl = image || (req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : '');

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