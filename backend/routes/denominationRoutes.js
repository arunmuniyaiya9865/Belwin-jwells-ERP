const express = require('express');
const router = express.Router();
const denominationController = require('../controllers/denominationController');

// Add a new denomination
router.post('/', denominationController.addDenomination);

// Get all denominations
router.get('/', denominationController.getDenominations);

module.exports = router;
