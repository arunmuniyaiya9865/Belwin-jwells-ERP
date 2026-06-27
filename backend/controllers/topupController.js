const ApiError = require('../utils/ApiError');
const TopUp = require('../models/topupModel');
const Loan = require('../models/Loan');
const { syncGoldStockStatus } = require('./goldStockController');

const createTopUp = async (req, res, next) => {
  try {
    const { loanId, topupAmount, remarks, topupDate } = req.body;

    if (!loanId || !topupAmount) {
      return next(new ApiError(400, 'loanId and topupAmount are required' ));
    }

    if (topupAmount <= 0) {
      return next(new ApiError(400, 'Top up amount must be greater than 0' ));
    }

    // Check if loan exists
    const loan = await Loan.findOne({ loanId });
    if (!loan) {
      return next(new ApiError(404, 'Loan not found' ));
    }

    // Closed loans cannot be topped up
    if (loan.status === 'Closed') {
      return next(new ApiError(400, 'Closed loans cannot be topped up' ));
    }

    const previousLoanAmount = loan.loanAmount;
    const newLoanAmount = previousLoanAmount + topupAmount;

    // Create top up record
    const topup = new TopUp({
      loanId: loan.loanId,
      customerId: loan.customerId,
      customerName: loan.name,
      previousLoanAmount,
      topupAmount,
      newLoanAmount,
      remarks: remarks || '',
      topupDate: topupDate || new Date()
    });

    await topup.save();

    // Update loan details
    loan.loanAmount = newLoanAmount;
    loan.remainingLoanAmount = (loan.remainingLoanAmount || previousLoanAmount) + topupAmount;
    loan.status = 'TopUp';
    // Mongoose automatically updates 'updatedAt' when saving
    await loan.save();

    await syncGoldStockStatus(loan.loanId, loan.status);

    res.status(201).json({ message: 'Top up created successfully', topup });
  } catch (error) { next(error); }
};

const getTopUpsByLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const topups = await TopUp.find({ loanId }).sort({ createdAt: -1 });
    res.status(200).json({ topups });
  } catch (error) { next(error); }
};

const getAllTopUps = async (req, res, next) => {
  try {
    const topups = await TopUp.find().sort({ createdAt: -1 });
    res.status(200).json({ topups });
  } catch (error) { next(error); }
};

module.exports = {
  createTopUp,
  getTopUpsByLoan,
  getAllTopUps
};
