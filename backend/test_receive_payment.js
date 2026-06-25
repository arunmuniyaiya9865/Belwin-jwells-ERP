require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Loan = require('./models/Loan');
const Payment = require('./models/Payment');
const http = require('http');

const testReceivePayment = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('MongoDB connected');

    // 1. Fetch an open loan
    const loan = await Loan.findOne({ remainingLoanAmount: { $gt: 0 } });
    if (!loan) {
      console.log('No open loan found for testing.');
      process.exit(0);
    }

    console.log(`Testing with Loan ID: ${loan.loanId}`);
    console.log(`Current Remaining Amount: ${loan.remainingLoanAmount}`);

    // 2. Make HTTP POST request to pay full remaining amount
    const payloadObj = {
      loanId: loan.loanId,
      customerId: loan.customerId,
      paymentType: 'Full Settlement',
      paymentAmount: loan.remainingLoanAmount + 500, // 500 interest
      principalAmount: loan.remainingLoanAmount,
      interestAmount: 500,
      paymentMode: 'Cash',
      remarks: 'Test Full Settlement'
    };
    const payload = JSON.stringify(payloadObj);

    const postOptions = {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/payments`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(postOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        console.log('POST Payment Status:', res.statusCode);
        
        if (res.statusCode === 201) {
            const result = JSON.parse(data);
            console.log(`Payment saved! ID: ${result.payment.paymentId}`);
            console.log(`Updated Loan Status: ${result.loan.status}`);
            console.log(`Updated Remaining Amount: ${result.loan.remainingLoanAmount}`);

            // Verify in DB
            const updatedLoan = await Loan.findById(loan._id);
            if (updatedLoan.status === 'Closed' && updatedLoan.remainingLoanAmount === 0) {
               console.log('Test Passed: Loan successfully closed in MongoDB.');
            } else {
               console.log('Test Failed: Loan status/amount mismatch in DB.');
            }
            process.exit(0);
        } else {
            console.log('Error creating payment:', data);
            process.exit(1);
        }
      });
    });
    
    req.on('error', e => {
      console.error('Request Error:', e);
      process.exit(1);
    });
    req.write(payload);
    req.end();

  } catch (err) {
    console.error('Error in test:', err);
    process.exit(1);
  }
};

testReceivePayment();
