const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    designation: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    address: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' },
    documentUrl: { type: String } // Path to uploaded document
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
