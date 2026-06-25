const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
<<<<<<< HEAD
  incomeId: { type: String, unique: true, index: true, required: true },
  incomeDate: { type: Date, required: true },
  branchName: { type: String, required: true },
  incomeCategory: { type: String, required: true },
  incomeSubCategory: { type: String },
  amount: { type: Number, required: true },
  paymentMode: { type: String, required: true },
  receivedFrom: { type: String, required: true },
  description: { type: String },
  receiptNo: { type: String },
  referenceNoTransactionId: { type: String },
  receivedBy: { type: String },
  approvedBy: { type: String },
  billReceiptUpload: { type: String },
  gstIncluded: { type: Boolean, default: false },
  taxAmount: { type: Number },
  updatedBy: { type: String }
=======
    incomeId: {
        type: String,
        required: true,
        unique: true
    },
    incomeDate: {
        type: Date,
        required: true
    },
    branchName: {
        type: String,
        required: true
    },
    incomeCategory: {
        type: String,
        required: true
    },
    incomeSubCategory: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMode: {
        type: String,
        required: true
    },
    receivedFrom: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    receiptNo: {
        type: String
    },
    referenceNoTransactionId: {
        type: String
    },
    receivedBy: {
        type: String
    },
    approvedBy: {
        type: String
    },
    billReceiptUpload: {
        type: String
    },
    gstIncluded: {
        type: Boolean,
        default: false
    },
    taxAmount: {
        type: Number
    }
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
