const express = require('express');
const router = express.Router();
const remittanceController = require('../controllers/remittanceController');

// Define routes
router.post('/', remittanceController.createRemittance);
router.get('/', remittanceController.getRemittances);
router.get('/next-id', remittanceController.getNextId);
router.get('/report', remittanceController.getRemittanceReport);
router.get('/:remittanceId', remittanceController.getRemittanceById);

module.exports = router;
