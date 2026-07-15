const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
  branchId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    uppercase: true
  },
  city: {
    type: String,
    required: true,
    uppercase: true
  },
  state: {
    type: String,
    required: true,
    uppercase: true
  },
  address: String,
  mobile: String,
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true,
  collection: 'branches'
});

module.exports = mongoose.model('Branch', BranchSchema);
