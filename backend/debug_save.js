const mongoose = require('mongoose');
require('dotenv').config();
const { Customer } = require('./models/Customer');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Try to find any customer pending approval
        let customer = await Customer.findOne({ status: 'Customer Approval Pending' });
        if (!customer) {
            customer = await Customer.findOne();
            if (!customer) {
                console.log('No customers in DB');
                process.exit(0);
            }
        }

        console.log('Found customer:', customer._id);

        const historyEntry = {
            action: 'Sent Back For Correction',
            performedBy: {
                id: customer.createdBy || new mongoose.Types.ObjectId(),
                employeeId: 'BEL-0001',
                name: 'Admin User',
                role: 'admin'
            },
            date: new Date(),
            remarks: 'Test remarks'
        };

        customer.workflowHistory.push(historyEntry);
        customer.adminRemarks = 'Test remarks';
        customer.status = 'Correction Required';

        console.log('Attempting save...');
        await customer.save();
        console.log('Save successful!');

    } catch (error) {
        console.error('=== ERROR DURING SAVE ===');
        console.error('Message:', error.message);
        console.error('Name:', error.name);
        if (error.errors) {
            console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
        }
    } finally {
        await mongoose.disconnect();
    }
}

run();
