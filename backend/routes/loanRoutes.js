const express = require('express');
const router = express.Router();
const { createLoan, getLoanById, getLoansByCustomer, updateLoan, updateLoanStatus, getLoansByStatus } = require('../controllers/loanController');

// POST /api/loans - Create a new loan
router.post('/', createLoan);

// GET /api/loans/customer/:customerId - Get all loans for a customer
router.get('/customer/:customerId', getLoansByCustomer);

// GET /api/loans/by-status/:status - Get loans by status (for reports)
router.get('/by-status/:status', getLoansByStatus);

// PUT /api/loans/status/:loanId - Update loan status only
router.put('/status/:loanId', updateLoanStatus);

// GET /api/loans/:id - Get a loan by ID or Loan ID
router.get('/:id', getLoanById);

// PUT /api/loans/:id - Update a loan by ID or Loan ID
router.put('/:id', updateLoan);

module.exports = router;
