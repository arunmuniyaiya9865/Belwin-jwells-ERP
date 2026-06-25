require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Loan = require('./models/Loan');
const Repledge = require('./models/Repledge');
const http = require('http');

const makeRequest = (path, method = 'GET', body = null) => new Promise((resolve, reject) => {
  const payload = body ? JSON.stringify(body) : null;
  const opts = {
    hostname: '127.0.0.1', port: 5000, path, method,
    headers: { 'Content-Type': 'application/json', ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}) }
  };
  const req = http.request(opts, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
  });
  req.on('error', reject);
  if (payload) req.write(payload);
  req.end();
});

const test = async () => {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
  console.log('MongoDB connected\n');

  // Step 1: Find any loan that is not Closed
  let loan = await Loan.findOne({ status: { $ne: 'Closed' } });
  if (!loan) {
    // Reopen a test loan for testing purposes
    loan = await Loan.findOne({});
    if (!loan) { console.log('No loans found. Create a loan first.'); process.exit(0); }
    loan.status = 'Active';
    loan.remainingLoanAmount = 5000;
    await loan.save();
    console.log(`Reopened loan ${loan.loanId} for testing (status=Active, remaining=5000)`);
  }

  console.log(`Testing with Loan: ${loan.loanId} | Status: ${loan.status} | Remaining: ₹${loan.remainingLoanAmount}\n`);

  // Step 2: Repledge the loan (change status to Repledged)
  console.log('── POST /api/repledges ──');
  const rep1 = await makeRequest('/api/repledges', 'POST', {
    loanId: loan.loanId,
    newStatus: 'Repledged',
    additionalLoanAmount: 2000,
    newInterestRate: 2.5,
    repledgeDate: new Date().toISOString().split('T')[0],
    changedBy: 'Test Officer',
    approvalStatus: 'Approved',
    remarks: 'Test repledge with additional amount'
  });
  console.log(`Status: ${rep1.status}`);
  console.log(`Repledge ID: ${rep1.body.repledge?.repledgeId}`);
  console.log(`Old Status → New Status: ${rep1.body.repledge?.oldStatus} → ${rep1.body.repledge?.newStatus}`);
  console.log(`Updated Loan Status: ${rep1.body.loan?.status}`);
  console.log(`Updated Loan Amount: ₹${rep1.body.loan?.loanAmount}`);

  // Step 3: Change status to Overdue
  console.log('\n── POST /api/repledges (status → Overdue) ──');
  const rep2 = await makeRequest('/api/repledges', 'POST', {
    loanId: loan.loanId,
    newStatus: 'Overdue',
    changedBy: 'System Auto',
    remarks: 'Payment overdue'
  });
  console.log(`Status: ${rep2.status} | Repledge ID: ${rep2.body.repledge?.repledgeId}`);

  // Step 4: GET history for this loan
  console.log(`\n── GET /api/repledges/loan/${loan.loanId} ──`);
  const hist = await makeRequest(`/api/repledges/loan/${loan.loanId}`);
  console.log(`Status: ${hist.status} | Total history records: ${hist.body.length}`);
  hist.body.forEach(r => console.log(`  ${r.repledgeId}: ${r.oldStatus} → ${r.newStatus} | By: ${r.changedBy}`));

  // Step 5: GET all repledges
  console.log('\n── GET /api/repledges ──');
  const all = await makeRequest('/api/repledges');
  console.log(`Status: ${all.status} | Total: ${all.body.length} repledge records`);

  // Verify in MongoDB
  const dbRepledges = await Repledge.find({ loanId: loan.loanId });
  console.log(`\n── MongoDB Verify ──`);
  console.log(`Repledge documents for ${loan.loanId}: ${dbRepledges.length}`);
  dbRepledges.forEach(r => console.log(`  ${r.repledgeId} | ${r.oldStatus} → ${r.newStatus}`));

  const updatedLoan = await Loan.findById(loan._id);
  console.log(`Final Loan Status: ${updatedLoan.status}`);
  console.log(`Final Loan Amount: ₹${updatedLoan.loanAmount}`);

  console.log('\n✓ All tests passed!');
  process.exit(0);
};

test().catch(err => { console.error(err); process.exit(1); });
