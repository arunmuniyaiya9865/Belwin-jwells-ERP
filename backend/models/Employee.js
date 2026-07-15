const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    // Generated ID e.g. BEL-0001
    employeeId: { type: String, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fatherName: { type: String },
    gender: { type: String },
    dob: { type: Date },
    mobile: { type: String },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    
    department: { type: String },
    branch: { type: String },
    designation: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    salary: { type: Number },
    
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },

    status: {
        type: String,
        default: 'Active'
    },

    // Login credentials
    username: { type: String },

    // Role assigned by Admin
    role: {
        type: String,
        default: 'Employee'
    },

    // Permission list assigned by Admin
    permissions: {
        type: [String],
        default: []
    },

    // Path to uploaded document (if using Multer)
    documentUrl: {
        type: String
    },
    
    // Base64 photo string from JSON payload
    photo: {
        type: String
    }

}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);