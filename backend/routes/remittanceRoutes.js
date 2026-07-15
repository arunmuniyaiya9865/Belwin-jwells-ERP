const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const remittanceController = require('../controllers/remittanceController');

// Define routes
router.post('/', protect, remittanceController.createRemittance);
router.get('/', protect, remittanceController.getRemittances);
router.get('/next-id', protect, remittanceController.getNextId);
router.get('/report', protect, remittanceController.getRemittanceReport);
router.get('/:remittanceId', protect, remittanceController.getRemittanceById);

module.exports = router;
