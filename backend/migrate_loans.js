require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const testMigration = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/belwin_erp';
    console.log("Connecting to MongoDB at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);

    const Loan = require('./models/Loan');
    const { Customer } = require('./models/Customer');

    const loans = await Loan.find({});
    console.log(`Found ${loans.length} loans to migrate.`);

    let migrated = 0;

    for (let loan of loans) {
      if (!loan.loanId || !loan.customerObjectId) {
        // Assume loan.customerId currently holds the ObjectId (from old schema)
        // Wait, if it's already a string "CUST...", finding by ID will fail.
        let customer;
        if (mongoose.Types.ObjectId.isValid(loan.customerId)) {
          customer = await Customer.findById(loan.customerId);
        }

        if (customer) {
          loan.customerObjectId = customer._id;
          loan.customerId = customer.customerId; // The string like CUST000009
          if (!loan.loanId) {
            loan.loanId = await Loan.getNextId();
          }
          await loan.save();
          console.log(`Migrated Loan Object ID ${loan._id} -> Loan ID: ${loan.loanId}, Customer ID: ${loan.customerId}`);
          migrated++;
        } else {
          console.log(`Could not resolve customer for loan ${loan._id}`);
          // If it already has customerId string and no loanId:
          if (!mongoose.Types.ObjectId.isValid(loan.customerId) && !loan.loanId) {
             const c = await Customer.findOne({ customerId: loan.customerId });
             if (c) {
               loan.customerObjectId = c._id;
               loan.loanId = await Loan.getNextId();
               await loan.save();
               console.log(`Fixed and Migrated Loan ${loan._id} -> Loan ID: ${loan.loanId}, Customer ID: ${loan.customerId}`);
               migrated++;
             }
          }
        }
      } else {
        console.log(`Loan ${loan.loanId} already migrated.`);
      }
    }

    console.log(`Migration Complete. Migrated ${migrated} loans.`);
    process.exit(0);

  } catch (err) {
    console.error("Migration Error:", err.message);
    process.exit(1);
  }
};

testMigration();
