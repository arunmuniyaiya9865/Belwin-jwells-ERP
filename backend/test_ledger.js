const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { getCustomerLedger } = require('./controllers/customerLedgerController');
const { Customer } = require('./models/Customer');

async function testLedger() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/belwin_erp');
        console.log('Connected to DB');

        // Get a sample customerId that has loans/payments if possible
        const sampleCustomer = await Customer.findOne({});
        const customerId = sampleCustomer ? sampleCustomer.customerId : 'CUST000001';
        
        console.log('Testing with customerId:', customerId);

        const req = { params: { customerId } };
        const res = {
            status: function(code) { this.statusCode = code; return this; },
            json: function(data) { console.log('Response:', JSON.stringify(data, null, 2)); }
        };
        const next = (err) => console.error('Next called with error:', err);

        await getCustomerLedger(req, res, next);

        // Test invalid customer
        console.log('\nTesting INVALID customer:');
        req.params.customerId = 'INVALID_XYZ';
        await getCustomerLedger(req, res, next);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

testLedger();
