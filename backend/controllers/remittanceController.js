const { Remittance, RemittanceCounter } = require('../models/Remittance');

// Get next remittance ID
exports.getNextId = async (req, res) => {
    try {
        const counter = await RemittanceCounter.findById('remittanceNo');
        const nextSeq = counter ? counter.seq + 1 : 1;
        const nextId = `REM${String(nextSeq).padStart(6, '0')}`;
        
        res.status(200).json({
            success: true,
            nextId
        });
    } catch (error) {
        console.error('Error fetching next remittance ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch next ID',
            error: error.message
        });
    }
};

// Create a new remittance
exports.createRemittance = async (req, res) => {
    try {
        const remittance = new Remittance(req.body);
        
        // Ensure amount is > 0
        if (remittance.amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        await remittance.save();
        
        res.status(201).json({
            success: true,
            message: 'Remittance created successfully',
            data: remittance
        });
    } catch (error) {
        console.error('Error creating remittance:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create remittance'
        });
    }
};

// Get all remittances
exports.getRemittances = async (req, res) => {
    try {
        const remittances = await Remittance.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: remittances
        });
    } catch (error) {
        console.error('Error fetching remittances:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch remittances',
            error: error.message
        });
    }
};

// Get single remittance by ID
exports.getRemittanceById = async (req, res) => {
    try {
        const remittance = await Remittance.findOne({ remittanceNo: req.params.remittanceId });
        if (!remittance) {
            return res.status(404).json({ success: false, message: 'Remittance not found' });
        }
        res.status(200).json({ success: true, data: remittance });
    } catch (error) {
        console.error('Error fetching remittance:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch remittance', error: error.message });
    }
};

// Get remittance report with filters and summary
exports.getRemittanceReport = async (req, res) => {
    try {
        const { fromDate, toDate, remittanceType, remittanceNo } = req.query;
        let filter = {};

        if (fromDate || toDate) {
            filter.date = {};
            if (fromDate) filter.date.$gte = new Date(fromDate);
            if (toDate) filter.date.$lte = new Date(toDate);
        }

        if (remittanceType) filter.remittanceType = remittanceType;
        if (remittanceNo) filter.remittanceNo = new RegExp(remittanceNo, 'i');

        const remittances = await Remittance.find(filter).sort({ date: -1, createdAt: -1 });

        let totalRemittances = remittances.length;
        let branchToHOAmount = 0;
        let hoToBranchAmount = 0;

        remittances.forEach(rem => {
            if (rem.remittanceType === 'Branch To Head Office') {
                branchToHOAmount += rem.amount;
            } else if (rem.remittanceType === 'Head Office To Branch') {
                hoToBranchAmount += rem.amount;
            }
        });

        const netTransfer = branchToHOAmount - hoToBranchAmount;

        res.status(200).json({
            success: true,
            data: remittances,
            summary: {
                totalRemittances,
                branchToHOAmount,
                hoToBranchAmount,
                netTransfer
            }
        });
    } catch (error) {
        console.error('Error fetching remittance report:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch remittance report', error: error.message });
    }
};
