const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token and attach to request object
            req.user = await User.findById(decoded.id).select('-password');
            
            // Proceed to the next middleware or the route handler
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};


const isStaff = (req, res, next) => {
    if (req.user && (req.user.role === 'Staff' )) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Access is restricted to staff members.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Access is restricted to staff members.' });
    }
};
module.exports = {protect, isStaff, isAdmin};


