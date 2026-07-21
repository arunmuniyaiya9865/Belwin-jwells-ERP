const mongoose = require('mongoose');
require('dotenv').config();
const { Customer } = require('./models/Customer');
const User = require('./models/User');
const customerApprovalService = require('./services/customerApprovalService');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');

    // 1. Fetch Users
    const admin = await User.findOne({ role: 'admin' }).populate('employeeId');
    const emp = await User.findOne({ role: 'employee' }).populate('employeeId');

    // 2. Mock 'createCustomer' logically
    const customer = new Customer({
        customerId: 'AUDIT-TEST-' + Date.now(),
        customerName: 'Test',
        status: 'Customer Approval Pending',
        createdBy: emp._id,
        createdByEmployee: {
            id: emp._id,
            employeeId: emp.employeeId?.employeeId || emp.employeeId || '',
            employeeName: emp.username || emp.name,
            role: emp.role,
            branchId: emp.branch || null,
            branchName: emp.branchName || ''
        },
        workflowHistory: [{
            action: 'Customer Created',
            performedBy: {
                id: emp._id,
                employeeId: emp.employeeId?.employeeId || emp.employeeId || '',
                name: emp.username || emp.name,
                role: emp.role
            },
            date: new Date(),
            remarks: 'Initial customer creation'
        }]
    });
    await customer.save();
    console.log('Created customer:', customer.customerId);

    // 3. Send back for correction
    await customerApprovalService.processApprovalAction(customer._id, 'Send Back', 'Needs fix', admin, false, '1.1.1.1', 'Mozilla');
    console.log('Sent back');

    // 4. Update customer (Resubmitted)
    await Customer.updateOne(
        { _id: customer._id }, 
        {
            $set: { status: 'Customer Approval Pending' },
            $push: {
                workflowHistory: {
                    action: 'Customer Updated and Resubmitted',
                    performedBy: {
                        id: emp._id,
                        employeeId: emp.employeeId?.employeeId || emp.employeeId || '',
                        name: emp.username || emp.name,
                        role: emp.role
                    },
                    date: new Date(),
                    remarks: 'Customer resubmitted after correction.'
                }
            }
        }
    );
    console.log('Resubmitted');

    // 5. Approve
    await customerApprovalService.processApprovalAction(customer._id, 'Approve', 'Looks good', admin, false, '2.2.2.2', 'Chrome');
    console.log('Approved');

    // 6. Fetch and verify
    const finalDoc = await Customer.findById(customer._id).lean();
    console.log('\n--- VERIFICATION ---');
    console.log('createdByEmployee:', finalDoc.createdByEmployee ? 'Present' : 'Missing');
    console.log('approvedByEmployee:', finalDoc.approvedByEmployee ? 'Present' : 'Missing');
    console.log('approvalIpAddress:', finalDoc.approvalIpAddress);
    console.log('workflowHistory count:', finalDoc.workflowHistory.length);
    finalDoc.workflowHistory.forEach(w => console.log(' ->', w.action));

    await Customer.deleteOne({ _id: customer._id });
    console.log('Cleaned up');
    mongoose.disconnect();
}
run().catch(console.error);
