const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
<<<<<<< HEAD
  expenseId: { type: String, unique: true, index: true, required: true },
  expenseDate: { type: Date, required: true },
  branchName: { type: String, required: true },
  expenseCategory: { type: String, required: true },
  expenseSubCategory: { type: String },
  expenseAmount: { type: Number, required: true },
  paymentMode: { type: String, required: true },
  paidToVendorName: { type: String, required: true },
  description: { type: String },
  billInvoiceNo: { type: String },
  billReceiptUpload: { type: String },
  paymentReferenceNo: { type: String },
  approvedBy: { type: String },
  enteredBy: { type: String },
  gstIncluded: { type: Boolean, default: false },
  taxAmount: { type: Number },
  amount: { type: Number }, // Kept for backwards compatibility with earlier reports if needed, though expenseAmount is used now
  expenseImage: { type: String },
  expenseImagePublicId: { type: String },
  updatedBy: { type: String }
=======
    expenseId: {
        type: String,
        required: true,
        unique: true
    },
    expenseDate: {
        type: Date,
        required: true
    },
    branchName: {
        type: String,
        required: true
    },
    expenseCategory: {
        type: String,
        required: true
    },
    expenseSubCategory: {
        type: String
    },
    expenseAmount: {
        type: Number,
        required: true
    },
    paymentMode: {
        type: String,
        required: true
    },
    paidToVendorName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    billInvoiceNo: {
        type: String
    },
    billReceiptUpload: {
        type: String
    },
    approvedBy: {
        type: String
    },
    enteredBy: {
        type: String
    },
    gstIncluded: {
        type: Boolean,
        default: false
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    paymentReferenceNo: {
        type: String
    }
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
