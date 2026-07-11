const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// 1. Configure Multer Storage for Seller Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Files will be saved in the 'uploads' directory at the root
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Create a unique filename using the current timestamp
        cb(null, `${Date.now()}-${file.originalname}`); 
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