const express = require('express');
const router = express.Router();
const { getProvideLoanDetails } = require('../controllers/provideLoanController');

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

router.get('/customer/:customerId', guestUser, getProvideLoanDetails);

module.exports = router;
