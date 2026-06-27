const multer = require('multer');
const path = require('path');

// Configure where and how files are saved
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // This refers to the 'uploads' folder in your backend root
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Saves file as: current-timestamp.extension (e.g., 1705012345.jpg)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
});

module.exports = upload;