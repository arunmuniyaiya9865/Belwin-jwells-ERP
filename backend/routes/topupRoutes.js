const express = require('express');
const router = express.Router();
const topupController = require('../controllers/topupController');

router.post('/', topupController.createTopUp);
router.get('/loan/:loanId', topupController.getTopUpsByLoan);
router.get('/', topupController.getAllTopUps);

module.exports = router;
