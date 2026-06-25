require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const http = require('http');
const mongoose = require('mongoose');


async function testLoan() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/belwin_erp';
    console.log("Connecting to MongoDB at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    const Customer = require('./models/Customer').Customer;
    
    // Find any customer and approve it
    let customer = await Customer.findOne();
    if (!customer) {
      // Create a dummy customer if none exists
      customer = await Customer.create({
        customerName: 'Test Customer',
        guardianName: 'Test Guardian',
        age: 30,
        mobileNumber: '9999999999',
        doorStreet: '123 Test St',
        area: 'Test Area',
        approvalStatus: 'Approved'
      });
      console.log(`Created new approved customer: ${customer._id}`);
    } else {
      customer.approvalStatus = 'Approved';
      await customer.save();
      console.log(`Approved existing customer: ${customer.customerId} (${customer._id})`);
    }

    // Payload mimicking ProvideLoan.jsx
    const payload = JSON.stringify({
      customerId: customer._id,
      name: customer.customerName,
      mobileNo: customer.mobileNumber,
      fatherHusbandName: customer.guardianName || 'N/A',
      address: 'Test City',
      loanDate: new Date().toISOString(),
      loanAmount: 15000,
      remainingLoanAmount: 15000,
      status: 'Pending',
      totalNoOfDays: 30,
      interestRate: 2,
      additionalInterestRate: 0,
      totalPaidInterestAmount: 0,
      totalInterestPaidDays: 0,
      remainingDays: 30,
      remainingInterestAmount: 300,
      documentCharge: 50,
      fullSettlementAmount: 15350,
      receiptEntry: {
        enterDays: 0,
        receiptDate: new Date().toISOString(),
        receiptAmount: 0,
        penalty: false
      },
      articles: [
        { category: 'Gold', details: 'Ring', qty: 1, totWt: 5, stoneWt: 0, nettWt: 5, purity: '916', gramRate: 5000, total: 25000 }
      ],
      totalWt: 5
    });

    console.log("Sending POST /api/loans ...");

    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/loans',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', async () => {
        console.log(`Response Code: ${res.statusCode}`);
        console.log("Response Data:", data);
        
        if (res.statusCode === 201) {
            const parsedData = JSON.parse(data);
            console.log("Verifying in Database...");
            const Loan = require('./models/Loan');
            const savedLoan = await Loan.findById(parsedData._id);
            if (savedLoan) {
              console.log("Success! Loan successfully retrieved from MongoDB.");
            }
        }
        process.exit(res.statusCode === 201 ? 0 : 1);
      });
    });

    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
      process.exit(1);
    });

    req.write(payload);
    req.end();

  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

testLoan();
