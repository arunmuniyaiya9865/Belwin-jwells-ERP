const customerApprovalService = require('../services/customerApprovalService');

/**
 * @desc    Search customer for approval module
 * @route   GET /api/customer-approval/search
 * @access  Private
 */
const searchCustomer = async (req, res) => {
    try {
        const { customerId } = req.query;
        const user = req.user; // Provided by auth middleware or guestUser

        const data = await customerApprovalService.findCustomerForApproval(customerId, user);
        
        res.json(data);
    } catch (error) {
        console.error('searchCustomer error:', error);
        const status = error.status || 500;
        const message = error.message || 'Server error';
        res.status(status).json({ 
            success: false, 
            message,
            debug: error.debug // Requirement 11
        });
    }
};

/**
 * @desc    Debug customer find (Requirement 8)
 * @route   GET /api/customer-approval/debug/:customerId
 */
const getDebugInfo = async (req, res) => {
    try {
        const { customerId } = req.params;
        const user = req.user;
        const customer = await require('../models/Customer').Customer.findOne({ 
            customerId: { $regex: `^${customerId}$`, $options: 'i' } 
        });

        res.json({
            searchedId: customerId,
            foundCustomer: !!customer,
            actualDatabaseCustomerId: customer?.customerId || null,
            userRole: user.role
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Get loan status for a specific customer
 * @route   GET /api/customer-approval/status/:customerId
 * @access  Private
 */
const getStatus = async (req, res) => {
    try {
        const { customerId } = req.params;
        const data = await customerApprovalService.getLoanStatus(customerId);
        
        res.json(data);
    } catch (error) {
        console.error('getStatus error:', error);
        const status = error.status || 500;
        const message = error.message || 'Server error';
        res.status(status).json({ success: false, message });
    }
};

module.exports = {
    searchCustomer,
    getStatus,
    getDebugInfo
};
