const express = require('express');
const router = express.Router();
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

module.exports = router;
