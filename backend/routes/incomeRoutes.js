const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { getNextIncomeId, createIncome, getIncomes, getIncomeById, updateIncome, deleteIncome, getIncomeReport } = require('../controllers/incomeController');

router.get('/next-id', getNextIncomeId);
router.get('/report', getIncomeReport);
router.post('/', createIncome);
router.get('/', getIncomes);
router.get('/:incomeId', getIncomeById);
router.put('/:incomeId', updateIncome);
router.delete('/:incomeId', deleteIncome);
=======
const incomeController = require('../controllers/incomeController');

// Add a new income
router.post('/', incomeController.addIncome);

// Get all incomes
router.get('/', incomeController.getIncomes);

// Get income by ID
router.get('/:id', incomeController.getIncomeById);

// Update income
router.put('/:id', incomeController.updateIncome);

// Delete income
router.delete('/:id', incomeController.deleteIncome);
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6

module.exports = router;
