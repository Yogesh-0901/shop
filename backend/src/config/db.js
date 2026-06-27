const mongoose = require('mongoose');
require('dotenv').config();
const seedProducts = require('../seeders/seedProducts');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/shopApp';
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ Connected to MongoDB successfully');
        
        // Seed products if collection is empty
        await seedProducts();
    } catch (err) {
        console.error('❌ Database Connection Error:', err.message);
        console.log('⚠️  Server will continue running but database-dependent features may not work');
        
        // Don't exit - allow server to start anyway
        // This is useful during development
    }
};

module.exports = connectDB;