const express = require('express');
const router = express.Router();
const { getNextIncomeId, createIncome, getIncomes, getIncomeById, updateIncome, deleteIncome, getIncomeReport } = require('../controllers/incomeController');

router.get('/next-id', getNextIncomeId);
router.get('/report', getIncomeReport);
router.post('/', createIncome);
router.get('/', getIncomes);
router.get('/:incomeId', getIncomeById);
router.put('/:incomeId', updateIncome);
router.delete('/:incomeId', deleteIncome);

module.exports = router;
