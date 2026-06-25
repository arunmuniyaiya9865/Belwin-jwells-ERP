const express = require('express');
const router = express.Router();
const goldStockController = require('../controllers/goldStockController');

router.get('/', goldStockController.getGoldStocks);
router.get('/report', goldStockController.getGoldStockReport);
router.get('/loan/:loanId', goldStockController.getGoldStockByLoanId);
router.get('/:stockId', goldStockController.getGoldStockById);

module.exports = router;
