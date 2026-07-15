const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const { Customer } = require('./models/Customer');
const Loan = require('./models/Loan');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      const loan = await Loan.findOne().lean();
      console.log('--- LOAN ---');
      console.log(JSON.stringify(loan, null, 2));

      if (loan) {
        const customer = await Customer.findOne({ $or: [{ customerId: loan.customerId }, { _id: loan.customerObjectId }] }).lean();
        console.log('\n--- CUSTOMER FOR THIS LOAN ---');
        console.log(JSON.stringify(customer, null, 2));
      } else {
        const customer = await Customer.findOne().lean();
        console.log('--- CUSTOMER ---');
        console.log(JSON.stringify(customer, null, 2));
      }
    } catch (e) {
      console.error(e);
    }
    process.exit(0);
  });
