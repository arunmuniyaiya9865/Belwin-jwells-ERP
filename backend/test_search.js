const mongoose = require('mongoose');
const { Customer } = require('./models/Customer');
const Loan = require('./models/Loan');

mongoose.connect('mongodb://127.0.0.1:27017/belwin_erp')
  .then(async () => {
    try {
      const customer = await Customer.findOne().lean();
      console.log('--- CUSTOMER ---');
      console.log(JSON.stringify(customer, null, 2));

      if (customer) {
        const loans = await Loan.find({ $or: [{ customerId: customer.customerId }, { customerObjectId: customer._id }] }).lean();
        console.log('\n--- LOANS FOR THIS CUSTOMER ---');
        console.log(JSON.stringify(loans, null, 2));
      }
    } catch (e) {
      console.error(e);
    }
    process.exit(0);
  });
