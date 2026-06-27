const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { createPayment } = require('./controllers/paymentController');
const Loan = require('./models/Loan');

async function testPaymentClosure() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/belwin_erp');
        console.log('Connected to DB');

        // Pick an active loan to test, or create a mock one.
        // Let's create a temporary mock loan for isolation so we don't ruin real data.
        const mockLoanId = 'LOAN_TEST_99999';
        await Loan.deleteOne({ loanId: mockLoanId }); // Cleanup if exists

        const loan = await Loan.create({
            loanId: mockLoanId,
            customerId: 'CUST_TEST_01',
            name: 'Test Customer',
            loanStartDate: new Date(),
            loanAmount: 1000,
            remainingLoanAmount: 1000,
            status: 'Active'
        });

        console.log('Created Mock Loan:', loan.loanId, ' Remaining:', loan.remainingLoanAmount);

        // Make a payment that clears the balance
        const req = {
            body: {
                loanId: mockLoanId,
                customerId: 'CUST_TEST_01',
                paymentType: 'Principal',
                paymentAmount: 1000,
                principalAmount: 1000,
                interestAmount: 0,
                penaltyAmount: 0,
                paymentMode: 'Cash'
            }
        };

        const res = {
            status: function(code) { this.statusCode = code; return this; },
            json: function(data) { console.log('Payment Response Status:', data.loan.status); }
        };

        const next = (err) => console.error('Next called with error:', err);

        console.log('Processing payment...');
        await createPayment(req, res, next);

        // Verify in DB
        const updatedLoan = await Loan.findOne({ loanId: mockLoanId });
        console.log('\n--- VERIFICATION ---');
        console.log('Loan Status:', updatedLoan.status);
        console.log('Loan End Date:', updatedLoan.loanEndDate);

        if (updatedLoan.status === 'Closed' && updatedLoan.loanEndDate) {
            console.log('✅ TEST PASSED: Loan closed and end date populated automatically!');
        } else {
            console.log('❌ TEST FAILED');
        }

        // Cleanup
        await Loan.deleteOne({ loanId: mockLoanId });
        const Payment = require('./models/Payment');
        await Payment.deleteMany({ loanId: mockLoanId });

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

testPaymentClosure();
