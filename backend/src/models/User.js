const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { 
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    email: { 
        type: String, 
        unique: true, 
        required: true,
        lowercase: true,
        match: /.+\@.+\..+/
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    },
    role: { 
        type: String, 
        enum: ['customer', 'seller', 'admin'],
        default: 'customer' 
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Use conditional to prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);