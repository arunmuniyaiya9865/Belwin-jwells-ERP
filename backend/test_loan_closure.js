const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LoanClosure = require('./models/LoanClosure');
const Loan = require('./models/Loan');
const { Customer } = require('./models/Customer');
const GoldStock = require('./models/GoldStock');

dotenv.config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function runTests() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/belwin_erp');
    console.log("Connected.");

    try {
        // Find a closed loan to test with
        const closedLoan = await Loan.findOne({ status: 'Closed', remainingLoanAmount: 0 });
        
        if (!closedLoan) {
            console.log("No closed loans found in DB to test. Creating a dummy closed loan...");
            // Create dummy customer
            const testCust = await Customer.create({ customerId: 'TESTCUST01', customerName: 'Test Name', mobileNumber: '9999999999' });
            // Create dummy loan
            const testLoan = await Loan.create({ 
                loanId: 'TESTLOAN01', 
                customerId: 'TESTCUST01', 
                name: 'Test Name', 
                loanStartDate: new Date(), 
                loanAmount: 10000, 
                remainingLoanAmount: 0, 
                status: 'Closed' 
            });
            // Create dummy gold stock
            await GoldStock.create({
                stockId: 'TESTSTK01',
                loanId: 'TESTLOAN01',
                customerId: 'TESTCUST01',
                customerName: 'Test Name',
                articleName: 'Ring',
                articleType: 'Gold',
                quantity: 1,
                grossWeight: 5,
                netWeight: 5,
                purity: '22K',
                appraisedValue: 20000,
                status: 'Released'
            });

            console.log("Dummy closed loan created. Please re-run the test.");
            return;
        }

        console.log(`\nTesting with Loan: ${closedLoan.loanId}`);
        
        // 1. Ensure gold stock is released for this loan (or fix it)
        await GoldStock.updateMany({ loanId: closedLoan.loanId }, { status: 'Released' });

        // 2. Clear any existing closures for this loan to test fresh
        await LoanClosure.deleteMany({ loanId: closedLoan.loanId });
        console.log("Cleared existing closures.");

        // 3. Test Normal Closure Creation
        const customer = await Customer.findOne({ customerId: closedLoan.customerId });
        
        const closure1 = await LoanClosure.create({
            loanId: closedLoan.loanId,
            customerId: closedLoan.customerId,
            branch: customer ? customer.branch : 'Main',
            employeeName: 'Admin',
            closureType: 'Normal Closure',
            closureRemarks: 'Test Closure 1',
            closedBy: 'Admin',
            closureDate: new Date()
        });
        
        console.log(`✅ Success: First closure created successfully. Closure ID: ${closure1.closureId}`);

        // 4. Test Duplicate Closure Prevention
        console.log("\nTesting Duplicate Closure Prevention...");
        try {
            await LoanClosure.create({
                loanId: closedLoan.loanId, // Same loan ID
                customerId: closedLoan.customerId,
                closureType: 'Early Closure',
                closedBy: 'Admin2'
            });
            console.log("❌ Failed: System allowed duplicate closure!");
        } catch (error) {
            if (error.code === 11000) {
                console.log(`✅ Success: MongoDB properly blocked duplicate closure due to unique index on loanId.`);
            } else {
                console.log(`❌ Failed with unexpected error: ${error.message}`);
            }
        }

    } catch (err) {
        console.error("Test Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

runTests();
