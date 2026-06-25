const express = require('express');
const router = express.Router();
const { getCustomerHistory } = require('../controllers/customerHistoryController');

// Inject guest user if no auth token is provided (matching other routes)
const guestUser = (req, res, next) => {
    if (!req.user) {
        req.user = {
            _id: '000000000000000000000000',
            username: 'employee-portal',
            role: 'employee',
        };
    }
    next();
};

/**
 * GET /api/customer-history/:customerId
 */
router.get('/:customerId', guestUser, getCustomerHistory);

module.exports = router;
