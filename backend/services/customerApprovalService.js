const { Customer } = require('../models/Customer');

/**
 * Requirement 1: Search Customer by ID and Branch
 */
const findCustomerForApproval = async (customerId, branchId, user) => {
    // 1. Basic validation (Requirement 4: Check whitespace)
    if (!customerId) {
        throw { status: 400, message: 'Invalid customerId' };
    }
    const cleanId = customerId.trim();

    console.log("Searching Customer ID (Received):", customerId);
    console.log("Searching Customer ID (Cleaned):", cleanId);

    // 2. Lookup customer (Requirement 9: Search using regex temporarily)
    const customer = await Customer.findOne({ 
        customerId: { $regex: `^${cleanId}$`, $options: "i" }, 
        isDeleted: { $ne: true } 
    });

    console.log("Customer found in DB:", !!customer);
    if (customer) {
        console.log("Customer Branch:", customer.branchId);
        console.log("Search Branch (Received):", branchId);
    }

    if (!customer) {
        // Detailed error for debugging (Requirement 11)
        throw { 
            status: 404, 
            message: 'No Customer Found',
            debug: {
                customerIdReceived: customerId,
                cleanId,
                branchReceived: branchId,
                customerFound: false
            }
        };
    }

    // 3. Branch Security (Requirement 4 & 6)
    // admin can access all, employee only their branch
    if (user.role !== 'admin') {
        // If branchId is missing in record, treat as matching 'Main Branch' as fallback for legacy
        const effectiveBranch = customer.branchId || 'Main Branch';
        const targetBranch = branchId || 'Main Branch';

        if (effectiveBranch !== targetBranch) {
             console.log(`Branch Mismatch: DB[${effectiveBranch}] vs Query[${targetBranch}]`);
             throw { 
                 status: 403, 
                 message: 'Branch access denied',
                 debug: {
                     customerBranch: effectiveBranch,
                     userBranch: targetBranch,
                     role: user.role
                 }
             };
        }
    }

    return {
        customerId:     customer.customerId,
        customerName:   customer.customerName,
        mobile:         customer.mobileNumber,
        branch:         customer.branchId || 'Main Branch',
        employee:       customer.createdBy ? 'Assigned' : 'Unassigned',
        createdAt:      customer.createdAt,
        kycStatus:      customer.status, // Existing status enum
        loanDetails:    customer.loanDetails,
        approvalStatus: customer.approvalStatus // New status enum
    };
};

/**
 * Requirement 2: Get Loan Status by customerId
 */
const getLoanStatus = async (customerId) => {
    if (!customerId) {
        throw { status: 400, message: 'Invalid customerId' };
    }

    const customer = await Customer.findOne({ customerId, isDeleted: { $ne: true } });

    if (!customer) {
        throw { status: 404, message: 'Customer not found' };
    }

    const { loanDetails, approvalStatus, rejectionReason } = customer;

    return {
        applicationNumber: loanDetails.applicationNumber || 'N/A',
        loanAmount:        loanDetails.loanAmount || 0,
        loanType:          loanDetails.loanType || 'N/A',
        appliedDate:       loanDetails.appliedDate || customer.createdAt,
        currentStatus:     approvalStatus,
        approvalDate:      loanDetails.approvalDate || null,
        rejectionReason:   rejectionReason || null
    };
};

module.exports = {
    findCustomerForApproval,
    getLoanStatus
};
