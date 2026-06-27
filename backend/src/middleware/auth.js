const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Get token from header (supports both 'x-auth-token' and 'Authorization: Bearer <token>')
    let token = req.header('x-auth-token');
    
    if (!token) {
        const authHeader = req.header('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }
    }

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token using JWT_SECRET from environment
        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-2024';
        const decoded = jwt.verify(token, jwtSecret);
        
        // Add user from payload to request object
        req.user = decoded;
        req.userId = decoded.userId;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({ message: 'Token is invalid or expired' });
    }
};

module.exports = auth;