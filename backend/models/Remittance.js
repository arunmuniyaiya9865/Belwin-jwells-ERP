const mongoose = require('mongoose');

// Auto-increment remittance ID counter
const remittanceCounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});

const RemittanceCounter = mongoose.model('RemittanceCounter', remittanceCounterSchema);

const remittanceSchema = new mongoose.Schema({
    remittanceNo: { type: String, unique: true, index: true },
    date: { type: Date, required: true },
    branchName: { type: String, required: true, trim: true },
    remittanceType: { type: String, required: true, trim: true },
    amount: { 
        type: Number, 
        required: true,
        min: [0.01, 'Amount must be greater than 0']
    },
    fromBranchOrPerson: { type: String, required: true, trim: true },
    toBranchOrPerson: { type: String, required: true, trim: true },
    paymentMode: { type: String, required: true, trim: true },
    referenceNo: { type: String, trim: true },
    remarks: { type: String, trim: true },
    enteredBy: { type: String, required: true, trim: true },
    status: { type: String, default: 'Pending', trim: true }
}, { timestamps: true });

// Generate next remittance ID
remittanceSchema.statics.getNextId = async function () {
    const counter = await RemittanceCounter.findByIdAndUpdate(
        'remittanceNo',
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true }
    );
    return `REM${String(counter.seq).padStart(6, '0')}`;
};

// Pre-save hook to ensure remittanceNo exists
remittanceSchema.pre('save', async function () {
    if (this.isNew && !this.remittanceNo) {
        this.remittanceNo = await this.constructor.getNextId();
    }
});

module.exports = {
    Remittance: mongoose.model('Remittance', remittanceSchema),
    RemittanceCounter
};
