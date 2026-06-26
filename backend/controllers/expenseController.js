const Expense = require('../models/Expense');
const { cloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadFromBuffer = (buffer, folder, public_id) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, public_id, overwrite: true, resource_type: 'auto' },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// @desc    Get next Expense ID
// @route   GET /api/expenses/next-id
// @access  Public
const getNextExpenseId = async (req, res) => {
  try {
    const lastExpense = await Expense.findOne().sort({ createdAt: -1 });
    let nextId = 'EXP000001';
    
    if (lastExpense && lastExpense.expenseId && lastExpense.expenseId.startsWith('EXP')) {
      const currentNumber = parseInt(lastExpense.expenseId.replace('EXP', ''), 10);
      if (!isNaN(currentNumber)) {
        nextId = `EXP${String(currentNumber + 1).padStart(6, '0')}`;
      }
    }
    
    res.json({ nextId });
  } catch (error) {
    console.error('Error getting next expense ID:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Public
const createExpense = async (req, res) => {
  try {
    const {
      expenseId, expenseDate, expenseCategory, expenseSubCategory,
      expenseAmount, paymentMode, paidToVendorName, description, billInvoiceNo,
      billReceiptUpload, paymentReferenceNo, approvedBy, enteredBy, gstIncluded, taxAmount
    } = req.body;

    if (!expenseId || !expenseDate || !expenseCategory || !expenseAmount || !paymentMode || !paidToVendorName) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (parseFloat(expenseAmount) <= 0) {
      return res.status(400).json({ message: 'Expense amount must be greater than 0' });
    }

    const expenseExists = await Expense.findOne({ expenseId });
    if (expenseExists) {
      return res.status(400).json({ message: `Expense ID ${expenseId} already exists` });
    }

    let expenseImageUrl = null;
    let expenseImagePublicId = null;

    if (req.file) {
      const folder = `belwin-jewels/expenses/${expenseId}`;
      const upload = await uploadFromBuffer(req.file.buffer, folder, `bill_${Date.now()}`);
      expenseImageUrl = upload.secure_url;
      expenseImagePublicId = upload.public_id;
    }

    const expense = await Expense.create({
      expenseId, expenseDate, expenseCategory, expenseSubCategory,
      expenseAmount, paymentMode, paidToVendorName, description, billInvoiceNo,
      billReceiptUpload, paymentReferenceNo, approvedBy, enteredBy, gstIncluded, taxAmount,
      amount: expenseAmount,
      expenseImage: expenseImageUrl,
      expenseImagePublicId: expenseImagePublicId
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Public
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:expenseId
// @access  Public
const getExpenseById = async (req, res) => {
  try {
    const { expenseId } = req.params;
    console.log(`[Search Flow] Request received for Expense ID: ${expenseId}`);
    
    const expense = await Expense.findOne({ expenseId });
    if (!expense) {
      console.log(`[Search Flow] Expense ${expenseId} not found`);
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    console.log(`[Search Flow] Expense found! Returning data...`);
    res.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Public
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Business rules: cannot edit expenseId or created date
    delete updateData.expenseId;
    delete updateData.createdAt;

    const existingExpense = await Expense.findOne({ expenseId: id });
    if (!existingExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (updateData.expenseAmount !== undefined) {
      if (parseFloat(updateData.expenseAmount) <= 0) {
        return res.status(400).json({ message: 'Expense amount must be greater than 0' });
      }
      updateData.amount = updateData.expenseAmount; // Keep 'amount' in sync
    }

    // Maintain audit trail
    updateData.updatedAt = new Date();
    if (req.body.enteredBy) {
      updateData.updatedBy = req.body.enteredBy;
    }

    if (req.file) {
      const folder = `belwin-jewels/expenses/${id}`;
      // delete old if exists
      if (existingExpense.expenseImagePublicId) {
        await deleteFromCloudinary(existingExpense.expenseImagePublicId).catch(() => {});
      }
      const upload = await uploadFromBuffer(req.file.buffer, folder, `bill_${Date.now()}`);
      updateData.expenseImage = upload.secure_url;
      updateData.expenseImagePublicId = upload.public_id;
    }

    const updatedExpense = await Expense.findOneAndUpdate(
      { expenseId: id }, 
      updateData, 
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    console.log(`[Update Flow] Expense ${id} updated successfully`);
    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Public
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await Expense.findOneAndDelete({ expenseId: id });

    if (!deletedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (deletedExpense.expenseImagePublicId) {
      await deleteFromCloudinary(deletedExpense.expenseImagePublicId).catch(() => {});
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get expense report with filters and summary
// @route   GET /api/expenses/report
// @access  Public
const getExpenseReport = async (req, res) => {
  try {
    const { fromDate, toDate, expenseId, expenseCategory, paymentMode } = req.query;
    
    // Build filter query
    let query = {};
    
    if (fromDate || toDate) {
      query.expenseDate = {};
      if (fromDate) query.expenseDate.$gte = new Date(new Date(fromDate).setUTCHours(0,0,0,0));
      if (toDate) query.expenseDate.$lte = new Date(new Date(toDate).setUTCHours(23,59,59,999));
    }
    
    if (expenseId) query.expenseId = { $regex: expenseId, $options: 'i' };
    if (expenseCategory) query.expenseCategory = expenseCategory;
    if (paymentMode) query.paymentMode = paymentMode;

    const expenses = await Expense.find(query).sort({ expenseDate: -1, createdAt: -1 });

    // Calculate Summary
    let totalExpenseAmount = 0;
    let cashExpenses = 0;
    let bankOnlineExpenses = 0;

    expenses.forEach(exp => {
      const amt = exp.expenseAmount || exp.amount || 0;
      totalExpenseAmount += amt;
      
      if (exp.paymentMode === 'Cash') {
        cashExpenses += amt;
      } else {
        bankOnlineExpenses += amt;
      }
    });

    res.json({
      success: true,
      data: expenses,
      summary: {
        totalExpenses: expenses.length,
        totalExpenseAmount,
        cashExpenses,
        bankOnlineExpenses
      }
    });
  } catch (error) {
    console.error('Error generating expense report:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getNextExpenseId,
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseReport
};
