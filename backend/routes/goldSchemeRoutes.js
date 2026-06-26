const express = require('express');
const router = express.Router();
const {
    createGoldScheme,
    getGoldSchemes,
    getGoldSchemeByCustomer,
    updateGoldScheme,
    deleteGoldScheme
} = require('../controllers/goldSchemeController');

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

router.post('/', guestUser, createGoldScheme);
router.get('/', guestUser, getGoldSchemes);
router.get('/customer/:customerId', guestUser, getGoldSchemeByCustomer);
router.put('/:id', guestUser, updateGoldScheme);
router.delete('/:id', guestUser, deleteGoldScheme);

module.exports = router;
