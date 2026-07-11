const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Seller Image Uploads via Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ecommerce_products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }] // Optional: resize images
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        // Only accept image files
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// 2. Define API Routes

// GET: Fetch all products for the Home Page
// Matches: GET http://192.168.1.38:5000/api/products
router.get('/', productController.getProducts); 

// GET: Fetch products for the logged-in seller
// Matches: GET http://192.168.1.38:5000/api/products/seller
router.get('/seller', auth, productController.getSellerProducts);

// GET: Fetch a single product for the Product Details Page
// Matches: GET http://192.168.1.38:5000/api/products/:id
router.get('/:id', productController.getProductById); 

// POST: Submit a review for a specific product
// Matches: POST http://192.168.1.38:5000/api/products/:id/review
router.post('/:id/review', productController.addReview);

// POST: Create a new product with an image (Seller Mode - Protected)
// Matches: POST http://192.168.1.38:5000/api/products
router.post('/', auth, upload.single('image'), productController.createProduct);

// PUT: Update an existing product (Seller Mode - Protected)
// Matches: PUT http://192.168.1.38:5000/api/products/:id
router.put('/:id', auth, upload.single('image'), productController.updateProduct);

// DELETE: Delete a product (Seller Mode - Protected)
// Matches: DELETE http://192.168.1.38:5000/api/products/:id
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;