const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Customer } = require('./models/Customer');
const { processApprovalAction } = require('./services/customerApprovalService');

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Provide a fake admin user
        const adminUser = {
            _id: new mongoose.Types.ObjectId(),
            employeeId: 'BEL-TEST',
            name: 'Test Admin',
            role: 'admin'
        };

        // Find the specific customer
        const customerId = '6a355925cfd1526f481b6a9c';
        const customer = await Customer.findById(customerId);
        if (!customer) {
            console.log('Customer not found with ID:', customerId);
            const anyCustomer = await Customer.findOne();
            if (anyCustomer) {
                console.log('Using fallback customer:', anyCustomer._id);
                try {
                    await processApprovalAction(anyCustomer._id, 'Send Back', 'Test Remarks', adminUser, false, '127.0.0.1', 'test');
                    console.log('SUCCESS on fallback customer!');
                } catch (err) {
                    console.log('FAILED on fallback customer:', err);
                }
            }
        } else {
            console.log('Customer found!', customer.status);
            try {
                await processApprovalAction(customerId, 'Send Back', 'Test Remarks', adminUser, false, '127.0.0.1', 'test');
                console.log('SUCCESS on requested customer!');
            } catch (err) {
                console.log('FAILED on requested customer:', err);
            }
        }
    } catch (e) {
        console.error('Fatal:', e);
    } finally {
        await mongoose.disconnect();
    }
}
run();
