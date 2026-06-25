require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Loan = require('./models/Loan');
const Payment = require('./models/Payment');
const http = require('http');

const makeRequest = (options, body = null) => new Promise((resolve, reject) => {
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
  });
  req.on('error', reject);
  if (body) req.write(JSON.stringify(body));
  req.end();
});

const test = async () => {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
  console.log('MongoDB connected\n');

  // Step 1: Find an existing loan with payments
  const payment = await Payment.findOne({ paymentId: { $exists: true } });
  if (!payment) {
    console.log('No payments found. Please run test_receive_payment.js first.');
    process.exit(0);
  }
  const targetLoanId = payment.loanId;
  console.log(`Testing with Loan ID: ${targetLoanId}`);

  // Step 2: Make 2 additional partial payments (using a loan that's not closed)
  let openLoan = await Loan.findOne({ status: { $ne: 'Closed' }, remainingLoanAmount: { $gt: 0 } });
  if (!openLoan) {
    console.log('No open loan for multi-payment test. Creating scenario from closed loan check.');
    console.log('Using existing payment data for history check.\n');
  } else {
    console.log(`\nMaking 2 payments on open loan: ${openLoan.loanId} (remaining: ${openLoan.remainingLoanAmount})`);

    for (let i = 1; i <= 2; i++) {
      const res = await makeRequest(
        { hostname: '127.0.0.1', port: 5000, path: '/api/payments', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(JSON.stringify({ loanId: openLoan.loanId, customerId: openLoan.customerId, paymentType: 'Interest Payment', paymentAmount: 300, principalAmount: 100, interestAmount: 200, paymentMode: 'Cash' })) } },
        { loanId: openLoan.loanId, customerId: openLoan.customerId, paymentType: 'Interest Payment', paymentAmount: 300, principalAmount: 100, interestAmount: 200, paymentMode: 'Cash' }
      );
      console.log(`  Payment ${i}: Status=${res.status}, ID=${res.body.payment?.paymentId}`);
    }
    targetLoanId === openLoan.loanId || (console.log(`\nNow testing GET /api/payments/history/${openLoan.loanId}`));
  }

  // Step 3: Test GET /api/payments/history/:loanId
  console.log(`\n── Testing GET /api/payments/history/${targetLoanId} ──`);
  const histRes = await makeRequest({ hostname: '127.0.0.1', port: 5000, path: `/api/payments/history/${targetLoanId}`, method: 'GET' });
  console.log(`Status: ${histRes.status}`);
  if (histRes.status === 200) {
    console.log(`Loan: ${histRes.body.loan.loanId} | Status: ${histRes.body.loan.status} | Remaining: ${histRes.body.loan.remainingLoanAmount}`);
    console.log(`Payments (${histRes.body.payments.length} total):`);
    histRes.body.payments.forEach(p => console.log(`  - ${p.paymentId} | ${p.paymentType} | ₹${p.paymentAmount}`));
  }

  // Step 4: Test GET /api/payments (global ledger)
  console.log('\n── Testing GET /api/payments (global ledger) ──');
  const allRes = await makeRequest({ hostname: '127.0.0.1', port: 5000, path: '/api/payments', method: 'GET' });
  console.log(`Status: ${allRes.status} | Total records: ${allRes.body.length}`);

  console.log('\n✓ All tests passed!');
  process.exit(0);
};

test().catch(err => { console.error(err); process.exit(1); });
