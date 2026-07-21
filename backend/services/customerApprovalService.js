const { Customer } = require('../models/Customer');

const getPendingApprovals = async () => {
    return await Customer.find({ 
        status: 'Customer Approval Pending', 
        isDeleted: { $ne: true } 
    }).populate({
        path: 'createdBy',
        select: 'username role employeeId',
        populate: {
            path: 'employeeId',
            model: 'Employee',
            select: 'firstName lastName employeeId branch'
        }
    });
};

const processApprovalAction = async (customerId, action, remarks, adminUser, overrideDuplicate, ipAddress, userAgent) => {
    const customer = await Customer.findById(customerId).lean();
    if (!customer) {
        throw { status: 404, message: 'Customer not found' };
    }

    if (customer.status !== 'Customer Approval Pending') {
        throw { status: 400, message: 'Customer is not in a pending state' };
    }

    // Duplicate Check only if action is Approve
    if (action === 'Approve') {
        const duplicates = await Customer.find({
            _id: { $ne: customer._id },
            isDeleted: { $ne: true },
            $or: [
                { aadhaarNumber: customer.aadhaarNumber, aadhaarNumber: { $ne: '' } },
                { panNumber: customer.panNumber, panNumber: { $ne: '' } },
                { mobileNumber: customer.mobileNumber }
            ]
        }).lean();

        if (duplicates.length > 0 && !overrideDuplicate) {
            const hardDuplicates = duplicates.filter(d => 
                (d.aadhaarNumber && d.aadhaarNumber === customer.aadhaarNumber) || 
                (d.panNumber && d.panNumber === customer.panNumber)
            );
            
            const duplicateType = hardDuplicates.length > 0 ? 'Hard' : 'Possible';
            
            throw { 
                status: 409, 
                message: `${duplicateType} Duplicate Detected`,
                duplicateType,
                duplicates: duplicates.map(d => ({
                    customerId: d.customerId,
                    customerName: d.customerName,
                    mobileNumber: d.mobileNumber,
                    aadhaarNumber: d.aadhaarNumber,
                    panNumber: d.panNumber,
                    status: d.status
                }))
            };
        }
    }

    const workflowAction = 
        action === 'Approve' && overrideDuplicate ? 'Duplicate Override Approval' :
        action === 'Approve' ? 'Approved' :
        action === 'Reject' ? 'Rejected' :
        'Sent Back For Correction';

    const empIdStr = adminUser.employeeId?.employeeId || adminUser.employeeId || '';

    const historyEntry = {
        action: workflowAction,
        performedBy: {
            id: adminUser._id,
            employeeId: empIdStr,
            name: adminUser.name || adminUser.username,
            role: adminUser.role
        },
        date: new Date(),
        remarks: remarks || ''
    };
    
    console.log("processApprovalAction: workflowHistory object before push:", historyEntry);
    
    const updatePayload = {
        $set: {
            adminRemarks: remarks
        },
        $push: {
            workflowHistory: historyEntry
        }
    };

    if (action === 'Approve') {
        updatePayload.$set.status = 'Approved';
        updatePayload.$set.approvalStatus = 'Approved';
        updatePayload.$set.approvedBy = adminUser._id;
        updatePayload.$set.approvedDate = new Date();
        updatePayload.$set.approvalIpAddress = ipAddress;
        updatePayload.$set.approvalUserAgent = userAgent;
        updatePayload.$set.approvedByEmployee = {
            employeeId: empIdStr,
            name: adminUser.name || adminUser.username || '',
            role: adminUser.role || ''
        };
    } else if (action === 'Reject') {
        updatePayload.$set.status = 'Rejected';
        updatePayload.$set.approvalStatus = 'Rejected';
        updatePayload.$set.rejectedDate = new Date();
        updatePayload.$set.rejectionReason = remarks;
    } else if (action === 'Send Back') {
        updatePayload.$set.status = 'Correction Required';
    } else {
        throw { status: 400, message: 'Invalid action' };
    }

    try {
        console.log(`processApprovalAction: Saving customer [${customer.customerId}]...`);
        
        // If the corrupted approvedBy field exists and we aren't explicitly overwriting it (Approve), unset it
        if (action !== 'Approve' && (customer.approvedBy === "" || typeof customer.approvedBy === 'string')) {
            updatePayload.$unset = { approvedBy: 1 };
        }

        await Customer.updateOne({ _id: customerId }, updatePayload);
        console.log(`processApprovalAction: Save successful!`);
    } catch (saveErr) {
        console.error('=== ERROR in processApprovalAction Save ===');
        console.error('Message:', saveErr.message);
        console.error('Name:', saveErr.name);
        console.error('Stack:', saveErr.stack);
        if (saveErr.errors) {
            console.error('Validation Errors:', JSON.stringify(saveErr.errors, null, 2));
        }
        throw { status: 500, message: saveErr.message || 'Error saving approval action' };
    }

    // Fetch fresh copy to return
    let updatedCustomer = null;
    try {
        updatedCustomer = await Customer.findById(customerId);
    } catch (e) {
        updatedCustomer = { ...customer, ...updatePayload.$set };
    }

    return updatedCustomer;
};

const findCustomerForApproval = async (customerId, user) => {
    if (!customerId) throw { status: 400, message: 'Invalid customerId' };
    const cleanId = customerId.trim();
    const customer = await Customer.findOne({ 
        customerId: { $regex: `^${cleanId}$`, $options: "i" }, 
        isDeleted: { $ne: true } 
    });
    if (!customer) throw { status: 404, message: 'No Customer Found' };
    return {
        customerId: customer.customerId,
        customerName: customer.customerName,
        mobile: customer.mobileNumber,
        employee: customer.createdBy ? 'Assigned' : 'Unassigned',
        createdAt: customer.createdAt,
        kycStatus: customer.status,
        loanDetails: customer.loanDetails,
        approvalStatus: customer.approvalStatus
    };
};

const getLoanStatus = async (customerId) => {
    if (!customerId) throw { status: 400, message: 'Invalid customerId' };
    const customer = await Customer.findOne({ customerId, isDeleted: { $ne: true } });
    if (!customer) throw { status: 404, message: 'Customer not found' };
    const { loanDetails, approvalStatus, rejectionReason } = customer;
    return {
        applicationNumber: loanDetails.applicationNumber || 'N/A',
        loanAmount: loanDetails.loanAmount || 0,
        loanType: loanDetails.loanType || 'N/A',
        appliedDate: loanDetails.appliedDate || customer.createdAt,
        currentStatus: approvalStatus,
        approvalDate: loanDetails.approvalDate || null,
        rejectionReason: rejectionReason || null
    };
};

module.exports = {
    getPendingApprovals,
    processApprovalAction,
    findCustomerForApproval,
    getLoanStatus
};
