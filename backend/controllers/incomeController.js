const Income = require('../models/Income');

// Create a new income
exports.addIncome = async (req, res) => {
    try {
        const income = new Income(req.body);
        const savedIncome = await income.save();
        res.status(201).json({ success: true, data: savedIncome });
    } catch (error) {
        console.error('Error adding income:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all incomes
exports.getIncomes = async (req, res) => {
    try {
        const incomes = await Income.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: incomes });
    } catch (error) {
        console.error('Error fetching incomes:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get income by ID
exports.getIncomeById = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);
        if (!income) {
            return res.status(404).json({ success: false, message: 'Income not found' });
        }
        res.status(200).json({ success: true, data: income });
    } catch (error) {
        console.error('Error fetching income:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update income
exports.updateIncome = async (req, res) => {
    try {
        const income = await Income.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!income) {
            return res.status(404).json({ success: false, message: 'Income not found' });
        }
        res.status(200).json({ success: true, data: income });
    } catch (error) {
        console.error('Error updating income:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete income
exports.deleteIncome = async (req, res) => {
    try {
        const income = await Income.findByIdAndDelete(req.params.id);
        if (!income) {
            return res.status(404).json({ success: false, message: 'Income not found' });
        }
        res.status(200).json({ success: true, message: 'Income deleted successfully' });
    } catch (error) {
        console.error('Error deleting income:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
