const Denomination = require('../models/Denomination');

// Add a new denomination record
exports.addDenomination = async (req, res) => {
    try {
        const denomination = new Denomination(req.body);
        const savedDenomination = await denomination.save();
        res.status(201).json({ success: true, data: savedDenomination });
    } catch (error) {
        console.error('Error adding denomination:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all denomination records
exports.getDenominations = async (req, res) => {
    try {
        const denominations = await Denomination.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: denominations });
    } catch (error) {
        console.error('Error fetching denominations:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
