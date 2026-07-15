const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const topupController = require('../controllers/topupController');

router.post('/', protect, topupController.createTopUp);
router.get('/loan/:loanId', protect, topupController.getTopUpsByLoan);
router.get('/', protect, topupController.getAllTopUps);

module.exports = router;
