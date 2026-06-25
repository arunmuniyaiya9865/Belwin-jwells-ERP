const mongoose = require('mongoose');

const goldRequestSchema = new mongoose.Schema({
  requestNo: { type: String, required: true },
  date: { type: Date, required: true },
  branchName: { type: String, required: true },
  itemName: { type: String, required: true },
  goldType: { type: String, required: true },
  weight: { type: Number, required: true },
  purity: { type: String, required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, required: true },
  requestedTo: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  remarks: { type: String },
  requestedBy: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('GoldRequest', goldRequestSchema);
