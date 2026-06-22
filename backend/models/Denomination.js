const mongoose = require('mongoose');

const denominationSchema = new mongoose.Schema({
    entryDate: {
        type: Date,
        required: true
    },
    branchName: {
        type: String,
        required: true
    },
    cashInHandTotal: {
        type: Number,
        required: true
    },
    notes500: {
        type: Number,
        default: 0
    },
    notes200: {
        type: Number,
        default: 0
    },
    notes100: {
        type: Number,
        default: 0
    },
    notes50: {
        type: Number,
        default: 0
    },
    notes20: {
        type: Number,
        default: 0
    },
    notes10: {
        type: Number,
        default: 0
    },
    coinsTotal: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        required: true
    },
    enteredBy: {
        type: String
    },
    verifiedBy: {
        type: String
    },
    verifiedTime: {
        type: Date
    },
    remarks: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Denomination', denominationSchema);
