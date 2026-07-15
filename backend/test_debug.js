const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const { Customer } = require('./models/Customer');
const Loan = require('./models/Loan');

const searchVal = '9845678453'; // Phone number
console.log('Search Input:', searchVal);

// Detect type
let searchType = 'loanId';
const trimmedQuery = searchVal.trim();
if (/^\d{10}$/.test(trimmedQuery)) {
    searchType = 'phone';
}
console.log('Detected Type:', searchType);

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        if (searchType === 'phone') {
            const customer = await Customer.findOne({ mobileNumber: trimmedQuery }).lean();
            console.log('Customer Found:', customer ? 'Yes' : 'No');
            console.log('Customer ID:', customer ? customer.customerId : 'N/A');
            
            if (customer) {
                const customerLoans = await Loan.find({ 
                    $or: [{ customerId: customer.customerId }, { customerObjectId: customer._id }] 
                }).sort({ createdAt: -1 }).lean();
                
                console.log('Loans Found:', customerLoans.length);
                console.log('Loan IDs:', customerLoans.map(l => l.loanId).join(', '));
            }
        }
    } catch (e) {
        console.error('Error during search:', e.message);
    }
    process.exit(0);
});
