const mongoose = require('mongoose');
const Loan = require('./models/Loan');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        console.log('Testing findOne...');
        await Loan.findOne().populate('branch').lean();
        console.log('findOne did NOT throw!');
    } catch (e) {
        console.log('findOne threw:', e.message);
    }
    
    try {
        console.log('Testing find...');
        await Loan.find().populate('branch').lean();
        console.log('find did NOT throw!');
    } catch (e) {
        console.log('find threw:', e.message);
    }
    
    process.exit(0);
});
