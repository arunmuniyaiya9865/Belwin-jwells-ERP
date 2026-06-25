require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Loan = require('./models/Loan');
const http = require('http');

const testEditLoan = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('MongoDB connected');

    // 1. Fetch a single loan
    const loan = await Loan.findOne({ loanId: { $exists: true } });
    if (!loan) {
      console.log('No migrated loan found.');
      process.exit(0);
    }

    console.log(`Testing with Loan ID: ${loan.loanId}`);
    console.log(`Current Name: ${loan.name}`);

    // 2. Make HTTP PUT request to update using loanId string
    const payloadObj = {
      ...loan.toObject(),
      name: loan.name.includes('Tested') ? loan.name.replace('Tested', 'Re-Tested') : loan.name + ' - Tested',
      remainingLoanAmount: loan.remainingLoanAmount + 100
    };
    const payload = JSON.stringify(payloadObj);

    const putOptions = {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/loans/${loan.loanId}`, // Now passing LOAN000001
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(putOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        console.log('PUT Status:', res.statusCode);
        
        if (res.statusCode === 200) {
            // 3. Make HTTP GET request using customerId string to see if array returns
            const getOptions = {
                hostname: '127.0.0.1',
                port: 5000,
                path: `/api/loans/customer/${loan.customerId}`, // e.g. CUST000007
                method: 'GET'
            };
            
            const req2 = http.request(getOptions, (res2) => {
                let data2 = '';
                res2.on('data', chunk => data2 += chunk);
                res2.on('end', () => {
                    console.log('GET Loans by Customer Status:', res2.statusCode);
                    const loans = JSON.parse(data2);
                    console.log(`Found ${loans.length} loans for Customer ${loan.customerId}`);
                    if (loans.length > 0) {
                        console.log(`First loan in array: ${loans[0].loanId}, Name: ${loans[0].name}`);
                    }
                    process.exit(0);
                });
            });
            req2.on('error', e => console.error(e));
            req2.end();
        } else {
            console.log('Error updating loan:', data);
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

testEditLoan();
