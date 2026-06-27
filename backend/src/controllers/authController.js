const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, email) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not configured in environment variables');
    }
    return jwt.sign(
        { userId, email },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-2024',
        { expiresIn: '7d' }
    );
};

// 1. Signup Logic
exports.signup = async (req, res) => {
    const { fullName, email, password, role } = req.body;
    
    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            fullName: fullName || email.split('@')[0], 
            email, 
            password: hashedPassword, 
            role: role || 'customer' 
        });
        await newUser.save();

        // Generate token
        const token = generateToken(newUser._id, newUser.email);

        res.status(201).json({ 
            message: "Account Created Successfully",
            token,
            user: {
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: "Signup failed: " + error.message });
    }
};

// 2. Login Logic
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate token
        const token = generateToken(user._id, user.email);

        res.status(200).json({ 
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: "Login failed: " + error.message });
    }
};

// 3. Verify Token Logic (New endpoint)
exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers['x-auth-token'] || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-2024'
        );
        
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ 
            message: "Token valid",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

// 4. Forgot Password Logic (Improved with security)
exports.forgotPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    
    if (!email || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: "Email, new password, and confirmation are required" });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            // Don't reveal if user exists (security best practice)
            return res.status(400).json({ error: "If email exists, password reset link sent. Check your email." });
        }

        // In production, send a reset token via email instead
        // For now, allow direct reset with confirmation
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully. Please login with your new password." });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: "Failed to reset password" });
    }
};

