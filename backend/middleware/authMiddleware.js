const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Protect routes by verifying JWT token.
 * @details This middleware checks for a 'Bearer' token in the authorization header.
 * If the token is valid, it decodes it, finds the corresponding user in the database,
 * and attaches the user object (without the password) to the request object as `req.user`.
 */
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

/**
 * @desc    Middleware to check if the user is a staff member.
 * @details This function should be used *after* the `protect` middleware.
 * It checks the `role` property of the `req.user` object. If the user is a
 * 'staff' or 'admin', it allows access. Otherwise, it returns a 403 Forbidden error.
 */
const isStaff = (req, res, next) => {
    // Check if req.user exists and has a role (it should if 'protect' middleware ran successfully)
    if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
        next(); // User is staff or admin, proceed
    } else {
        // User is not authorized
        res.status(403).json({ message: 'Forbidden: Access is restricted to staff members.' });
    }
};

module.exports = {protect};

// Export both middleware functions so they can be imported in your route files.
