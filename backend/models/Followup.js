const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema({
<<<<<<< HEAD
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  loanNumber: { type: String, required: true },
  dueAmount: { type: Number },
  dueDate: { type: Date },
  followupType: { type: String },
  nextCallDate: { type: Date },
  staffName: { type: String },
  remarks: { type: String },
  callStatus: { type: String },
  callDate: { type: Date, default: Date.now }
}, { timestamps: true });
=======
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
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6

module.exports = mongoose.model('Followup', followupSchema);
