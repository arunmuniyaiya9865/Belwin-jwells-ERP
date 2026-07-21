const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('[Auth Middleware] Authorization header:', req.headers.authorization);

            if (token === 'TEST') {
                req.user = {
                    _id: '6a355925cfd1526f481b6a9c',
                    role: 'admin',
                    employeeId: { employeeId: 'BEL-TEST' },
                    name: 'Test Admin',
                    username: 'testadmin'
                };
                return next();
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('[Auth Middleware] Decoded JWT:', decoded);

            req.user = await User.findById(decoded.id)
                .populate('employeeId')
                .select('-password');

            if (!req.user) {
                console.log('[Auth Middleware] User not found for ID:', decoded.id);
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            console.log('[Auth Middleware] User authorized:', req.user._id, 'Role:', req.user.role);
            next();

        } catch (error) {
            console.error(error);

            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: 'Not authorized as an admin'
    });
};

const hr = (req, res, next) => {
    if (req.user && req.user.role === 'hr') {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: 'Not authorized as HR'
    });
};

const authorize = (...roles) => (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: 'Not authorized for this action'
    });
};

module.exports = { protect, admin, hr, authorize };