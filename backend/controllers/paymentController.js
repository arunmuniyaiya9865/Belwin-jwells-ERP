const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const { syncGoldStockStatus } = require('./goldStockController');

// @desc    Create new payment and update loan
// @route   POST /api/payments
// @access  Public
const createPayment = async (req, res) => {
  try {
    const {
      loanId,
      customerId,
      paymentType,
      paymentAmount,
      principalAmount,
      interestAmount,
      penaltyAmount,
      paymentDate,
      paymentMode,
      transactionRef,
      collectedBy,
      remarks
    } = req.body;

    // Validate payment amount
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than 0' });
    }

    // Fetch loan using loanId string
    const loan = await Loan.findOne({ loanId });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status === 'Closed') {
      return res.status(400).json({ message: 'Cannot process payment for a Closed loan' });
    }

    // Process loan updates
    const numericPaymentAmount = parseFloat(paymentAmount) || 0;
    const numericInterestAmount = parseFloat(interestAmount) || 0;
    const numericPrincipalAmount = parseFloat(principalAmount) || 0;
    const numericPenaltyAmount = parseFloat(penaltyAmount) || 0;

    // Calculate new values
    const newRemainingAmount = loan.remainingLoanAmount - numericPrincipalAmount;
    
    // Check overpayment (if principal paid > remaining)
    if (newRemainingAmount < 0) {
       return res.status(400).json({ message: 'Payment principal exceeds remaining loan amount' });
    }

    // Create payment record
    const payment = await Payment.create({
      loanId,
      customerId,
      paymentType,
      paymentAmount: numericPaymentAmount,
      principalAmount: numericPrincipalAmount,
      interestAmount: numericInterestAmount,
      penaltyAmount: numericPenaltyAmount,
      paymentDate: paymentDate || new Date(),
      paymentMode,
      transactionRef,
      collectedBy,
      remarks
    });

    // Update loan document
    loan.remainingLoanAmount = newRemainingAmount;
    loan.totalPaidInterestAmount = (loan.totalPaidInterestAmount || 0) + numericInterestAmount;
    
    // Add payment history reference to the loan document as required by previous schema
    loan.payments.push({
      receiptNo: payment.paymentId, // The generated PAYXXXXXX
      paidDate: payment.paymentDate,
      amount: payment.paymentAmount,
      interestAmount: payment.interestAmount,
      principalAmount: payment.principalAmount,
      penalty: payment.penaltyAmount,
      penaltyPending: 0
    });

    // Check closure logic
    if (loan.remainingLoanAmount <= 0) {
      loan.status = 'Closed';
      // Store close date in remarks or if schema supports it, status handles it.
    }

    await loan.save();

    await syncGoldStockStatus(loan.loanId, loan.status);

    res.status(201).json({ payment, loan });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all payments for a specific loan
// @route   GET /api/payments/loan/:loanId
// @access  Public
const getPaymentsByLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const payments = await Payment.find({ loanId }).sort({ paymentDate: -1, createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get aggregated loan and payment history
// @route   GET /api/payments/history/:loanId
// @access  Public
const getPaymentHistory = async (req, res) => {
  try {
    const { loanId } = req.params;
    
    const loan = await Loan.findOne({ loanId }).populate('customerObjectId');
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const payments = await Payment.find({ loanId }).sort({ paymentDate: -1, createdAt: -1 });

    res.json({ loan, payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all payments (global ledger)
// @route   GET /api/payments
// @access  Public
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ paymentDate: -1, createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createPayment,
  getPaymentsByLoan,
  getPaymentHistory,
  getAllPayments
};
