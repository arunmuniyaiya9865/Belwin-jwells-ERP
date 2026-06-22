const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
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
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
