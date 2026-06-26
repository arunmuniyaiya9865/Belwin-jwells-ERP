const Income = require('../models/Income');

// @desc    Get next Income ID
// @route   GET /api/incomes/next-id
// @access  Public
const getNextIncomeId = async (req, res) => {
  try {
    const lastIncome = await Income.findOne().sort({ createdAt: -1 });
    let nextId = 'INC000001';
    
    if (lastIncome && lastIncome.incomeId && lastIncome.incomeId.startsWith('INC')) {
      const currentNumber = parseInt(lastIncome.incomeId.replace('INC', ''), 10);
      if (!isNaN(currentNumber)) {
        nextId = `INC${String(currentNumber + 1).padStart(6, '0')}`;
      }
    }
    
    res.json({ nextId });
  } catch (error) {
    console.error('Error getting next income ID:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create new income
// @route   POST /api/incomes
// @access  Public
const createIncome = async (req, res) => {
  try {
    const {
      incomeId, incomeDate, incomeCategory, incomeSubCategory,
      amount, paymentMode, receivedFrom, description, receiptNo,
      referenceNoTransactionId, receivedBy, approvedBy, billReceiptUpload,
      gstIncluded, taxAmount
    } = req.body;

    if (!incomeId || !incomeDate || !incomeCategory || !amount || !paymentMode || !receivedFrom) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const incomeExists = await Income.findOne({ incomeId });
    if (incomeExists) {
      return res.status(400).json({ message: `Income ID ${incomeId} already exists` });
    }

    const income = await Income.create({
      incomeId, incomeDate, incomeCategory, incomeSubCategory,
      amount, paymentMode, receivedFrom, description, receiptNo,
      referenceNoTransactionId, receivedBy, approvedBy, billReceiptUpload,
      gstIncluded, taxAmount
    });

    res.status(201).json(income);
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all incomes
// @route   GET /api/incomes
// @access  Public
const getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find().sort({ createdAt: -1 });
    res.json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get income by ID
// @route   GET /api/incomes/:incomeId
// @access  Public
const getIncomeById = async (req, res) => {
  try {
    const { incomeId } = req.params;
    console.log(`[Search Flow] Request received for Income ID: ${incomeId}`);
    
    const income = await Income.findOne({ incomeId });
    if (!income) {
      console.log(`[Search Flow] Income ${incomeId} not found`);
      return res.status(404).json({ message: 'Income not found' });
    }
    
    console.log(`[Search Flow] Income found! Returning data...`);
    res.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update income
// @route   PUT /api/incomes/:incomeId
// @access  Public
const updateIncome = async (req, res) => {
  try {
    const { incomeId } = req.params;
    let updateData = { ...req.body };

    // Business Rules: Prevent modification of immutable fields
    delete updateData.incomeId;
    delete updateData.createdAt;

    if (updateData.amount !== undefined && parseFloat(updateData.amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const updatedIncome = await Income.findOneAndUpdate(
      { incomeId }, 
      updateData, 
      { new: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({ message: 'Income not found' });
    }

    console.log(`[Update Flow] Income ${incomeId} updated successfully`);
    res.json(updatedIncome);
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete income
// @route   DELETE /api/incomes/:incomeId
// @access  Public
const deleteIncome = async (req, res) => {
  try {
    const { incomeId } = req.params;
    const deletedIncome = await Income.findOneAndDelete({ incomeId });

    if (!deletedIncome) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json({ message: 'Income removed successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get income report with filters and summary
// @route   GET /api/incomes/report
// @access  Public
const getIncomeReport = async (req, res) => {
  try {
    const { fromDate, toDate, incomeId, incomeCategory, paymentMode } = req.query;
    
    // Build filter query
    let query = {};
    
    if (fromDate || toDate) {
      query.incomeDate = {};
      if (fromDate) query.incomeDate.$gte = new Date(new Date(fromDate).setUTCHours(0,0,0,0));
      if (toDate) query.incomeDate.$lte = new Date(new Date(toDate).setUTCHours(23,59,59,999));
    }
    
    if (incomeId) query.incomeId = { $regex: incomeId, $options: 'i' };
    if (incomeCategory) query.incomeCategory = incomeCategory;
    if (paymentMode) query.paymentMode = paymentMode;

    const incomes = await Income.find(query).sort({ incomeDate: -1, createdAt: -1 });

    // Calculate Summary
    let totalIncomeAmount = 0;
    let cashIncome = 0;
    let bankOnlineIncome = 0;

    incomes.forEach(inc => {
      const amt = inc.amount || 0;
      totalIncomeAmount += amt;
      
      if (inc.paymentMode === 'Cash') {
        cashIncome += amt;
      } else {
        bankOnlineIncome += amt;
      }
    });

    res.json({
      success: true,
      data: incomes,
      summary: {
        totalIncomeEntries: incomes.length,
        totalIncomeAmount,
        cashIncome,
        bankOnlineIncome
      }
    });
  } catch (error) {
    console.error('Error generating income report:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getNextIncomeId,
  createIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
  getIncomeReport
};
