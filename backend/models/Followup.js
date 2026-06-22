const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, 'Customer name is required']
    },
    mobileNumber: {
        type: String,
        required: [true, 'Mobile number is required']
    },
    loanNumber: {
        type: String,
        required: [true, 'Loan number is required']
    },
    dueAmount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    followupType: {
        type: String,
        required: [true, 'Followup type is required'],
        enum: ['Due Reminder', 'Interest Reminder', 'Overdue Reminder', 'Auction Warning', 'Repledge Reminder']
    },
    nextCallDate: {
        type: Date,
        required: true
    },
    staffName: {
        type: String,
        required: [true, 'Staff name is required']
    },
    remarks: {
        type: String
    },
    callStatus: {
        type: String,
        required: [true, 'Call status is required'],
        enum: ['Connected', 'Not Reachable', 'Will Pay', 'Call Back Later']
    },
    callDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Followup', followupSchema);
