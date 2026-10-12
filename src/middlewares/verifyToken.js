/**
 * JWT Authentication Middleware
 *
 * Verifies JWT tokens from Authorization header
 * and attaches decoded user payload to request object.
 *
 * Author: Fayez Ahmad Protik
 */

const jwt = require('jsonwebtoken');

/**
 * Verify JWT token from Authorization header
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access. No token provided.'
        });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access. Invalid token format.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.decoded = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        return res.status(403).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

/**
 * Generate JWT token for user
 * @param {Object} userData - User data to encode in token
 * @param {string} expiresIn - Token expiration time (default: '24h')
 * @returns {string} JWT token
 */
const generateToken = (userData, expiresIn = '24h') => {
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn });
};

module.exports = { verifyToken, generateToken };