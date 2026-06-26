const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Followup', followupSchema);
