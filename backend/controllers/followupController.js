const Followup = require('../models/Followup');

// @desc    Create a new followup
// @route   POST /api/followups
// @access  Public
const createFollowup = async (req, res) => {
    try {
        const {
            customerName,
            mobileNumber,
            loanNumber,
            dueAmount,
            dueDate,
            followupType,
            nextCallDate,
            staffName,
            remarks,
            callStatus
        } = req.body;

        const followup = await Followup.create({
            customerName,
            mobileNumber,
            loanNumber,
            dueAmount,
            dueDate,
            followupType,
            nextCallDate,
            staffName,
            remarks,
            callStatus
        });

        res.status(201).json({
            success: true,
            data: followup
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all followups
// @route   GET /api/followups
// @access  Public
const getFollowups = async (req, res) => {
    try {
        const followups = await Followup.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: followups.length,
            data: followups
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

module.exports = {
    createFollowup,
    getFollowups
};
