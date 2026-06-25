require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const { Customer } = require('./models/Customer');
const Loan = require('./models/Loan');
const Payment = require('./models/Payment');
const TopUp = require('./models/topupModel');

async function testTopUpFlow() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/belwin_erp';
    console.log("Connecting to MongoDB at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    
    // 1. Create a Customer if not exists
    let customer = await Customer.findOne();
    if (!customer) {
      customer = await Customer.create({
        customerName: 'Test TopUp Customer',
        mobileNumber: '8888888888',
        approvalStatus: 'Approved'
      });
      console.log(`Created customer: ${customer._id}`);
    }

    // 2. Create Loan (LOAN000001 conceptually, but will auto-generate)
    const loan = new Loan({
      customerId: customer.customerId || 'CUST999',
      customerObjectId: customer._id,
      name: customer.customerName,
      loanAmount: 10000,
      remainingLoanAmount: 10000,
      status: 'Active'
    });
    await loan.save();
    console.log(`Created Loan: ${loan.loanId} with amount ${loan.loanAmount}`);

    // 3. Receive Payment
    const payment = new Payment({
      loanId: loan.loanId,
      customerId: customer.customerId || 'CUST999',
      paymentType: 'Principal',
      paymentAmount: 1000,
      paymentDate: new Date(),
      paymentMode: 'Cash',
      interestAmount: 200,
      principalAmount: 800
    });
    // simulate payment modifying loan
    loan.remainingLoanAmount -= payment.principalAmount;
    await payment.save();
    await loan.save();
    console.log(`Received Payment: ${payment.receiptNo}. Loan remaining: ${loan.remainingLoanAmount}`);

    // 4. Top Up Loan
    console.log("Performing Top Up via API logic...");
    const topupAmount = 5000;
    
    // Validate rules
    if (loan.status === 'Closed') throw new Error("Cannot top up closed loan");
    if (topupAmount <= 0) throw new Error("Top up must be > 0");

    const previousLoanAmount = loan.loanAmount;
    const newLoanAmount = previousLoanAmount + topupAmount;

    const topup = new TopUp({
      loanId: loan.loanId,
      customerId: loan.customerId,
      customerName: loan.name,
      previousLoanAmount,
      topupAmount,
      newLoanAmount,
      remarks: 'Festive season requirement'
    });
    await topup.save();

    loan.loanAmount = newLoanAmount;
    loan.remainingLoanAmount = loan.remainingLoanAmount + topupAmount;
    loan.status = 'TopUp';
    await loan.save();

    console.log(`Top Up saved: ${topup.topupId}`);
    
    // 5. Verify topups collection
    const savedTopUp = await TopUp.findOne({ topupId: topup.topupId });
    if (savedTopUp) {
      console.log(`Verified topup document in DB: ${JSON.stringify(savedTopUp, null, 2)}`);
    } else {
      console.error("TopUp not found!");
    }

    // 6. Verify loan amount update & status
    const savedLoan = await Loan.findOne({ loanId: loan.loanId });
    console.log(`Verified Loan after Top Up - loanAmount: ${savedLoan.loanAmount}, remaining: ${savedLoan.remainingLoanAmount}, status: ${savedLoan.status}`);
    
    if (savedLoan.loanAmount === 15000 && savedLoan.status === 'TopUp') {
      console.log("All verifications passed successfully!");
    } else {
      console.error("Verifications failed!");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

testTopUpFlow();
