const mongoose = require('mongoose');
const { Counter } = require('./Customer'); // Import Counter for ID generation

const topupSchema = new mongoose.Schema({
  topupId: { type: String, unique: true, index: true },
  loanId: { type: String, required: true, index: true },
  customerId: { type: String },
  customerName: { type: String },
  previousLoanAmount: { type: Number, required: true },
  topupAmount: { type: Number, required: true },
  newLoanAmount: { type: Number, required: true },
  remarks: { type: String },
  topupDate: { type: Date, default: Date.now }
}, { timestamps: true });

// ── Static: generate next topup ID ───────────────────────────────────────
topupSchema.statics.getNextId = async function () {
  const counter = await Counter.findByIdAndUpdate(
      'topupId',
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
  );
  return `TOPUP${String(counter.seq).padStart(6, '0')}`;
};

// ── Pre-save: ensure topupId exists ───────────────────────────────────────
topupSchema.pre('save', async function () {
  if (this.isNew && !this.topupId) {
      this.topupId = await this.constructor.getNextId();
  }
});

module.exports = mongoose.model('TopUp', topupSchema);
