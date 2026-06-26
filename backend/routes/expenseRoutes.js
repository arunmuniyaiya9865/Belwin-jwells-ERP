const express = require('express');
const router = express.Router();
const { memoryUpload } = require('../config/cloudinary');
const { getNextExpenseId, createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense, getExpenseReport } = require('../controllers/expenseController');

router.get('/next-id', getNextExpenseId);
router.get('/report', getExpenseReport);
router.post('/', memoryUpload.single('expenseImage'), createExpense);
router.get('/', getExpenses);
router.get('/:expenseId', getExpenseById);
router.put('/:id', memoryUpload.single('expenseImage'), updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
