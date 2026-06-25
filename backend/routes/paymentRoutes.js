const express = require('express');
const router = express.Router();
const { createPayment, getPaymentsByLoan, getPaymentHistory, getAllPayments } = require('../controllers/paymentController');

// ── Immutability enforcement ────────────────────────────────────────────────
// Payments are permanent records. No edit or delete is permitted from any client.
// Future payment reversals must go through the Admin module only.
const paymentImmutable = (req, res) => {
    return res.status(405).json({
        success: false,
        message: 'Payments are immutable after creation. Modification is not permitted.',
        hint: 'Contact admin for payment reversal.'
    });
};

// POST /api/payments - Create a new payment
router.post('/', createPayment);

// GET /api/payments - Get all payments (global ledger)
router.get('/', getAllPayments);

// GET /api/payments/history/:loanId - Get loan + payment history (combined)
router.get('/history/:loanId', getPaymentHistory);

// GET /api/payments/loan/:loanId - Get payments for a loan
router.get('/loan/:loanId', getPaymentsByLoan);

// ── Block all mutation routes explicitly ────────────────────────────────────
router.put('/:id',    paymentImmutable);
router.patch('/:id',  paymentImmutable);
router.delete('/:id', paymentImmutable);
router.put('/',       paymentImmutable);
router.patch('/',     paymentImmutable);
router.delete('/',    paymentImmutable);

module.exports = router;
