const Loan = require('../models/Loan');
const { Customer } = require('../models/Customer');
const GoldStock = require('../models/GoldStock');
const { syncGoldStockStatus } = require('./goldStockController');
const mongoose = require('mongoose');

// @desc    Create new loan
// @route   POST /api/loans
// @access  Public
const createLoan = async (req, res) => {
  try {
    const {
      customerId, // This is currently passed as an ObjectId from ProvideLoan
      name,
      mobileNo,
      fatherHusbandName,
      address,
      loanDate,
      loanStartDate,
      loanEndDate,
      loanAmount,
      remainingLoanAmount,
      status,
      totalNoOfDays,
      interestRate,
      additionalInterestRate,
      totalPaidInterestAmount,
      totalInterestPaidDays,
      remainingDays,
      remainingInterestAmount,
      documentCharge,
      fullSettlementAmount,
      receiptEntry,
      articles,
      totalWt,
      payments,
      repledgeDetails,
      schemeId,
      schemeName,
      employeeId,
      employeeName,
      interestPercent,
      gramRate,
      minimumGram,
      maturePeriod,
      interestRepaymentMonths,
      documentCharges,
      penaltyPercent
    } = req.body;

    let customerStringId = '';
    let customerObjectId = null;

    if (customerId) {
      // customerId is passed as ObjectId from frontend ProvideLoan
      if (mongoose.Types.ObjectId.isValid(customerId)) {
        customerObjectId = customerId;
        const customerExists = await Customer.findById(customerId);
        if (!customerExists) {
          return res.status(404).json({ message: 'Customer not found' });
        }
        if (customerExists.approvalStatus !== 'Approved') {
          return res.status(400).json({ message: 'Customer must be Approved to receive a loan' });
        }
        customerStringId = customerExists.customerId; // "CUSTXXXXXX"
      } else {
        // If frontend passes "CUSTXXXXXX" string
        customerStringId = customerId;
        const customerExists = await Customer.findOne({ customerId });
        if (!customerExists) {
          return res.status(404).json({ message: 'Customer not found' });
        }
        if (customerExists.approvalStatus !== 'Approved') {
          return res.status(400).json({ message: 'Customer must be Approved to receive a loan' });
        }
        customerObjectId = customerExists._id;
      }
    }

    const newLoan = await Loan.create({
      customerId: customerStringId,
      customerObjectId,
      name,
      mobileNo,
      fatherHusbandName,
      address,
      loanDate,
      loanStartDate,
      loanEndDate,
      loanAmount,
      remainingLoanAmount,
      status: status || 'Pending',
      totalNoOfDays,
      interestRate,
      additionalInterestRate,
      totalPaidInterestAmount,
      totalInterestPaidDays,
      remainingDays,
      remainingInterestAmount,
      documentCharge,
      fullSettlementAmount,
      receiptEntry,
      articles,
      totalWt,
      payments,
      repledgeDetails,
      schemeId,
      schemeName,
      employeeId,
      employeeName,
      interestPercent,
      gramRate,
      minimumGram,
      maturePeriod,
      interestRepaymentMonths,
      documentCharges,
      penaltyPercent
    });

    // --- AUTOMATED GOLD STOCK LEDGER CREATION ---
    if (newLoan.articles && newLoan.articles.length > 0) {
      const stockPromises = newLoan.articles.map(article => {
        return GoldStock.create({
          loanId: newLoan.loanId,
          customerId: newLoan.customerId,
          customerName: newLoan.name,
          articleName: article.category || 'Unknown',
          articleType: article.details || 'Unknown',
          quantity: article.qty || 1,
          grossWeight: article.totWt || 0,
          netWeight: article.nettWt || 0,
          purity: article.purity || 'Unknown',
          appraisedValue: article.total || 0,
          status: 'In Stock',
          stockDate: newLoan.loanDate || Date.now()
        });
      });
      await Promise.all(stockPromises);
    }
    // --------------------------------------------

    res.status(201).json(newLoan);
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get loan by ID or LoanId
// @route   GET /api/loans/:id
// @access  Public
const getLoanById = async (req, res) => {
  try {
    const id = req.params.id;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.loanId = id;
    }

    const loan = await Loan.findOne(query).populate('customerObjectId');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json(loan);
  } catch (error) {
    console.error('Error fetching loan by ID:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all loans for a customer
// @route   GET /api/loans/customer/:customerId
// @access  Public
const getLoansByCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const loans = await Loan.find({ customerId }).sort({ createdAt: -1 }).populate('customerObjectId');
    res.json(loans);
  } catch (error) {
    console.error('Error fetching loans for customer:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update loan
// @route   PUT /api/loans/:id
// @access  Public
const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.loanId = id;
    }

    const loan = await Loan.findOne(query);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const updatedLoan = await Loan.findOneAndUpdate(
      query,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (updatedLoan && req.body.status) {
        await syncGoldStockStatus(updatedLoan.loanId, updatedLoan.status);
    }

    res.json(updatedLoan);
  } catch (error) {
    console.error('Error updating loan:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update loan status only (for Repledge / Change Status module)
// @route   PUT /api/loans/status/:loanId
// @access  Public
const updateLoanStatus = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }

    const loan = await Loan.findOne({ loanId });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status === 'Closed') {
      return res.status(400).json({ message: 'Cannot change status of a Closed loan' });
    }

    loan.status = status;
    await loan.save();

    await syncGoldStockStatus(loan.loanId, loan.status);

    res.json(loan);
  } catch (error) {
    console.error('Error updating loan status:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get loans by status (for reports tab)
// @route   GET /api/loans/by-status/:status
// @access  Public
const getLoansByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const loans = await Loan.find({ status }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    console.error('Error fetching loans by status:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createLoan,
  getLoanById,
  getLoansByCustomer,
  updateLoan,
  updateLoanStatus,
  getLoansByStatus
};
