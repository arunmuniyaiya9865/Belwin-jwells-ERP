const express = require('express');
const router = express.Router();
const { searchCustomer, getStatus, getDebugInfo } = require('../controllers/customerApprovalController');

// Guest user middleware (consistent with existing customer routes)
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
 * Requirement 8: Route Registration
 */

// GET /api/customer-approval/search?customerId=...&branchId=...
router.get('/search', guestUser, searchCustomer);

// GET /api/customer-approval/status/:customerId
router.get('/status/:customerId', guestUser, getStatus);

// GET /api/customer-approval/debug/:customerId
router.get('/debug/:customerId', guestUser, getDebugInfo);

module.exports = router;
