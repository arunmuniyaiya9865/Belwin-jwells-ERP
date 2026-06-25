const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { memoryUpload } = require('../config/cloudinary');
const { getNextExpenseId, createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense, getExpenseReport } = require('../controllers/expenseController');

router.get('/next-id', getNextExpenseId);
router.get('/report', getExpenseReport);
router.post('/', memoryUpload.single('expenseImage'), createExpense);
router.get('/', getExpenses);
router.get('/:expenseId', getExpenseById);
router.put('/:id', memoryUpload.single('expenseImage'), updateExpense);
router.delete('/:id', deleteExpense);
=======
const expenseController = require('../controllers/expenseController');

// Add a new expense
router.post('/', expenseController.addExpense);

// Get all expenses
router.get('/', expenseController.getAllExpenses);

// Get a single expense by ID
router.get('/:id', expenseController.getExpenseById);

// Update an expense
router.put('/:id', expenseController.updateExpense);

// Delete an expense
router.delete('/:id', expenseController.deleteExpense);
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6

module.exports = router;
