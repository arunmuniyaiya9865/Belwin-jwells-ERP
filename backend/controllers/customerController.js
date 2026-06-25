const { Customer, Counter } = require('../models/Customer');
const { deleteFromCloudinary } = require('../config/cloudinary');

// ─────────────────────────────────────────────────────────────────────────────
// Helper — append audit event
// ─────────────────────────────────────────────────────────────────────────────
const addAudit = (customer, action, user, note = '') => {
    customer.auditLog.push({
        action,
        performedBy: user._id,
        role: user.role,
        note,
        timestamp: new Date(),
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (employee + admin)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload document to Cloudinary (standalone)
// @route   POST /api/customers/upload
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Helper — Manual Cloudinary Upload from Buffer
// ─────────────────────────────────────────────────────────────────────────────
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadFromBuffer = (buffer, folder, public_id) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, public_id, overwrite: true, resource_type: 'auto' },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload document to Cloudinary (standalone)
// @route   POST /api/customers/upload
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const uploadCustomerDocument = async (req, res) => {
    try {
        const files = req.files || {};
        const result = {};

        // If no customerId in query, we can't use the fixed structure properly
        // For standalone, we might use a temp ID or wait for creation
        const customerId = req.query.customerId || `temp_${Date.now()}`;
        const folder = `belwin-jewels/customers/${customerId}`;

        if (req.files) {
            // Because we use memoryStorage for standalone too now
            const photo = req.files.photo?.[0];
            const aadhaar = req.files.aadhaarDoc?.[0];
            const proof2 = req.files.proof2Doc?.[0];

            if (photo) {
                const upload = await uploadFromBuffer(photo.buffer, folder, 'photo');
                result.photo = { url: upload.secure_url, publicId: upload.public_id };
            }
            if (aadhaar) {
                const upload = await uploadFromBuffer(aadhaar.buffer, folder, 'aadhaar');
                result.aadhaarDoc = { url: upload.secure_url, publicId: upload.public_id };
            }
            if (proof2) {
                const upload = await uploadFromBuffer(proof2.buffer, folder, 'proof2');
                result.proof2Doc = { url: upload.secure_url, publicId: upload.public_id };
            }
        }

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('uploadCustomerDocument error:', error);
        res.status(500).json({ success: false, message: 'File upload failed' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (employee + admin)
// ─────────────────────────────────────────────────────────────────────────────
const createCustomer = async (req, res) => {
    const newlyUploadedPublicIds = [];
    
    try {
        // 1. Generate customerId FIRST
        const customerId = await Customer.getNextId();
        const folder = `belwin-jewels/customers/${customerId}`;

        const {
            customerName, guardianName, dateOfBirth, age, gender,
            mobileNumber, alternateNumber, aadhaarNumber, panNumber,
            doorStreet, area, city, postalCode,
            permanentAddress, temporaryAddress, voterId, occupation,
            remarks, proof2Name, branchId,
            customerPhotoUrl, customerPhotoPublicId,
            aadhaarDocumentUrl, aadhaarDocumentPublicId,
            proof2DocumentUrl, proof2DocumentPublicId,
        } = req.body;

        // 2. Handle manual uploads if files provided as buffers
        let photoUrl = customerPhotoUrl, photoId = customerPhotoPublicId;
        let aadhaarUrl = aadhaarDocumentUrl, aadhaarId = aadhaarDocumentPublicId;
        let proof2Url = proof2DocumentUrl, proof2Id = proof2DocumentPublicId;

        if (req.files) {
            const photo = req.files.photo?.[0];
            const aadhaar = req.files.aadhaarDoc?.[0];
            const proof2 = req.files.proof2Doc?.[0];

            if (photo) {
                const upload = await uploadFromBuffer(photo.buffer, folder, 'photo');
                photoUrl = upload.secure_url; photoId = upload.public_id;
                newlyUploadedPublicIds.push(photoId);
            }
            if (aadhaar) {
                const upload = await uploadFromBuffer(aadhaar.buffer, folder, 'aadhaar');
                aadhaarUrl = upload.secure_url; aadhaarId = upload.public_id;
                newlyUploadedPublicIds.push(aadhaarId);
            }
            if (proof2) {
                const upload = await uploadFromBuffer(proof2.buffer, folder, 'proof2');
                proof2Url = upload.secure_url; proof2Id = upload.public_id;
                newlyUploadedPublicIds.push(proof2Id);
            }
        }

        // 3. Create record
        const customer = new Customer({
            customerId, // Manually set generated ID
            branchId: branchId || 'Main Branch', // Support multi-branch
            customerName, guardianName, dateOfBirth, age, gender,
            mobileNumber, alternateNumber, aadhaarNumber, panNumber,
            doorStreet, area, city, postalCode,
            permanentAddress, temporaryAddress, voterId, occupation,
            remarks, proof2Name,
            customerPhotoUrl: photoUrl,
            customerPhotoPublicId: photoId,
            aadhaarDocumentUrl: aadhaarUrl,
            aadhaarDocumentPublicId: aadhaarId,
            proof2DocumentUrl: proof2Url,
            proof2DocumentPublicId: proof2Id,
            status: 'Customer Approval Pending',
            employeeId: req.user._id,
            createdBy: req.user._id,
            // Initialize workflow tracking
            approvalStatus: 'Pending',
            workflowHistory: [{ status: 'Pending', date: new Date() }]
        });

        addAudit(customer, 'CREATED', req.user);
        await customer.save();

        res.status(201).json({ success: true, message: 'Customer created successfully', data: customer });
    } catch (error) {
        console.error('createCustomer error:', error);
        // Rollback Cloudinary
        for (const pid of newlyUploadedPublicIds) {
            await deleteFromCloudinary(pid).catch(() => {});
        }
        res.status(500).json({ success: false, message: error.message || 'Server error', errors: error.errors });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all customers (with search, filter, pagination)
// @route   GET /api/customers
// @access  Private (admin sees all, employee sees own)
// ─────────────────────────────────────────────────────────────────────────────
const getCustomers = async (req, res) => {
    try {
        const {
            page = 1, limit = 10,
            search = '',
            status,
            gender,
            city,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        const query = { isDeleted: { $ne: true } };
        const isGuest = req.user._id === '000000000000000000000000';
        if (req.user.role !== 'admin' && !isGuest) {
            query.createdBy = req.user._id;
        }

        if (search.trim()) {
            query.$or = [
                { customerName:  { $regex: search, $options: 'i' } },
                { mobileNumber:  { $regex: search, $options: 'i' } },
                { customerId:    { $regex: search, $options: 'i' } },
                { aadhaarNumber: { $regex: search, $options: 'i' } },
            ];
        }

        if (status)           query.status = status;
        if (gender)           query.gender = gender;
        if (city)             query.city   = { $regex: city, $options: 'i' };
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate)   query.createdAt.$lte = new Date(endDate);
        }

        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const skip = (Number(page) - 1) * Number(limit);
        const total = await Customer.countDocuments(query);

        let customers = await Customer
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate('createdBy', 'username role')
            .lean();

        res.json({
            success: true,
            data: customers,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('getCustomers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const mongoose = require('mongoose');
        let query = { isDeleted: { $ne: true } };

        if (mongoose.Types.ObjectId.isValid(id)) {
            query._id = id;
        } else {
            // Check case-insensitive match for customerId
            query.customerId = { $regex: `^${id.trim()}$`, $options: 'i' };
        }

        const customer = await Customer
            .findOne(query)
            .populate('createdBy', 'username role')
            .populate('auditLog.performedBy', 'username role');

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const isGuest = req.user._id === '000000000000000000000000';
        if (!isGuest && req.user.role !== 'admin') {
            const ownerId = customer.createdBy?._id?.toString() || customer.createdBy?.toString();
            if (ownerId && ownerId !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
        }

        res.json({ success: true, data: customer });
    } catch (error) {
        console.error('getCustomerById error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update customer info
// @route   PUT /api/customers/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        const isGuest = req.user._id === '000000000000000000000000';
        if (!isGuest && req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
            const ownerId = customer.createdBy?.toString();
            if (ownerId && ownerId !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
        }

        const allowed = [
            'customerName','guardianName','dateOfBirth','age','gender',
            'mobileNumber','alternateNumber','aadhaarNumber','panNumber',
            'doorStreet','area','city','postalCode',
            'permanentAddress','temporaryAddress','voterId','occupation',
            'remarks','proof2Name',
        ];
        allowed.forEach(field => {
            if (req.body[field] !== undefined) customer[field] = req.body[field];
        });

        if (!isGuest) customer.updatedBy = req.user._id;
        addAudit(customer, 'UPDATED', req.user);
        await customer.save();

        res.json({ success: true, message: 'Customer updated', data: customer });
    } catch (error) {
        console.error('updateCustomer error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload / replace documents
// @route   POST /api/customers/:id/documents
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const uploadDocuments = async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        const folder = `belwin-jewels/customers/${customer.customerId}`;
        const files = req.files || {};

        if (req.files) {
            const photo = req.files.photo?.[0];
            const aadhaar = req.files.aadhaarDoc?.[0];
            const proof2 = req.files.proof2Doc?.[0];

            if (photo) {
                const upload = await uploadFromBuffer(photo.buffer, folder, 'photo');
                customer.customerPhotoUrl = upload.secure_url;
                customer.customerPhotoPublicId = upload.public_id;
            }
            if (aadhaar) {
                const upload = await uploadFromBuffer(aadhaar.buffer, folder, 'aadhaar');
                customer.aadhaarDocumentUrl = upload.secure_url;
                customer.aadhaarDocumentPublicId = upload.public_id;
            }
            if (proof2) {
                const upload = await uploadFromBuffer(proof2.buffer, folder, 'proof2');
                customer.proof2DocumentUrl = upload.secure_url;
                customer.proof2DocumentPublicId = upload.public_id;
            }
        }

        addAudit(customer, 'DOCUMENTS_UPDATED', req.user);
        await customer.save();
        res.json({ success: true, message: 'Documents updated', data: customer });
    } catch (error) {
        console.error('uploadDocuments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    KYC workflow
// ─────────────────────────────────────────────────────────────────────────────
const kycVerify = async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        const next = {
            'Customer Approval Pending': 'KYC Verification Pending',
            'KYC Verification Pending':  'KYC Verified',
        }[customer.status];

        if (!next) return res.status(400).json({ success: false, message: 'Invalid status transition' });

        customer.status = next;
        addAudit(customer, `STATUS_CHANGED_TO_${next.replace(/ /g,'_').toUpperCase()}`, req.user);
        await customer.save();
        res.json({ success: true, message: `Status updated to ${next}`, data: customer });
    } catch (error) {
        console.error('kycVerify error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const approveCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
        if (customer.status !== 'KYC Verified') return res.status(400).json({ success: false, message: 'Not KYC Verified' });

        customer.status = 'Approved';
        addAudit(customer, 'APPROVED', req.user);
        await customer.save();
        res.json({ success: true, message: 'Customer approved', data: customer });
    } catch (error) {
        console.error('approveCustomer error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const rejectCustomer = async (req, res) => {
    try {
        const { reason } = req.body;
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        customer.status = 'Rejected';
        customer.rejectionReason = reason;
        addAudit(customer, 'REJECTED', req.user, reason);
        await customer.save();
        res.json({ success: true, message: 'Customer rejected', data: customer });
    } catch (error) {
        console.error('rejectCustomer error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const { hardDelete, deleteReason = '' } = req.query;
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        if (hardDelete === 'true') {
            if (req.user.role !== 'superAdmin') {
                return res.status(403).json({ success: false, message: 'Hard delete requires Super Admin privileges' });
            }
            // Use fixed folder names for safety or stored IDs
            const folder = `belwin-jewels/customers/${customer.customerId}`;
            await deleteFromCloudinary(`${folder}/photo`);
            await deleteFromCloudinary(`${folder}/aadhaar`);
            await deleteFromCloudinary(`${folder}/proof2`);
            
            await Customer.findByIdAndDelete(req.params.id);
            return res.json({ success: true, message: 'Customer permanently deleted' });
        }

        customer.isDeleted = true;
        customer.deletedAt = new Date();
        customer.deleteReason = deleteReason.trim();
        customer.deletedBy = req.user._id;
        addAudit(customer, 'DELETED', req.user, deleteReason.trim());
        await customer.save();
        res.json({ success: true, message: 'Customer deleted' });
    } catch (error) {
        console.error('deleteCustomer error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid customer ID format' });
        }
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get audit trail for a customer
// @route   GET /api/customers/:id/audit
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAuditLog = async (req, res) => {
    try {
        const customer = await Customer
            .findOne({ _id: req.params.id })
            .populate('auditLog.performedBy', 'username role')
            .select('customerId customerName auditLog');

        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        res.json({ success: true, data: customer });
    } catch (error) {
        console.error('getAuditLog error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getNextCustomerId = async (req, res) => {
    try {
        const counter = await Counter.findOne({ _id: 'customerId' });
        const nextSeq = (counter?.seq || 0) + 1;
        const customerId = `CUST${String(nextSeq).padStart(6, '0')}`;
        res.json({ success: true, customerId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all customers whose approvalStatus is Pending
// @route   GET /api/customers/pending
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getPendingCustomers = async (req, res) => {
    try {
        const query = { approvalStatus: 'Pending', isDeleted: { $ne: true } };
        const isGuest = req.user._id === '000000000000000000000000';
        if (req.user.role !== 'admin' && !isGuest) {
            query.createdBy = req.user._id;
        }

        const customers = await Customer
            .find(query)
            .populate('createdBy', 'username role')
            .lean();

        res.json({ success: true, data: customers });
    } catch (error) {
        console.error('getPendingCustomers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Approve customer by MongoDB _id or customerId
// @route   PUT /api/customers/approve/:customerId
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const approveCustomerByApprovalId = async (req, res) => {
    try {
        const { customerId } = req.params;
        const mongoose = require('mongoose');
        let query = { isDeleted: { $ne: true } };

        if (mongoose.Types.ObjectId.isValid(customerId)) {
            query._id = customerId;
        } else {
            query.customerId = { $regex: `^${customerId.trim()}$`, $options: 'i' };
        }

        const customer = await Customer.findOne(query);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        if (customer.approvalStatus === 'Approved') {
            return res.status(400).json({ success: false, message: 'Customer is already approved' });
        }

        // Update fields
        customer.approvalStatus = 'Approved';
        customer.approvedBy = req.user.username || 'admin';
        customer.approvedDate = new Date();

        // Sync legacy status field if appropriate
        customer.status = 'Approved';

        addAudit(customer, 'APPROVED', req.user, req.body.note || 'Approved via pending review');
        await customer.save();

        res.json({ success: true, message: 'Customer approved successfully', data: customer });
    } catch (error) {
        console.error('approveCustomerByApprovalId error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reject customer by MongoDB _id or customerId
// @route   PUT /api/customers/reject/:customerId
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const rejectCustomerByApprovalId = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { reason } = req.body;
        const mongoose = require('mongoose');
        let query = { isDeleted: { $ne: true } };

        if (mongoose.Types.ObjectId.isValid(customerId)) {
            query._id = customerId;
        } else {
            query.customerId = { $regex: `^${customerId.trim()}$`, $options: 'i' };
        }

        const customer = await Customer.findOne(query);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        if (customer.approvalStatus === 'Rejected') {
            return res.status(400).json({ success: false, message: 'Customer is already rejected' });
        }

        // Update fields
        customer.approvalStatus = 'Rejected';
        customer.rejectionReason = reason || 'No reason provided';
        customer.rejectedDate = new Date();

        // Sync legacy status field if appropriate
        customer.status = 'Rejected';

        addAudit(customer, 'REJECTED', req.user, reason || 'Rejected via pending review');
        await customer.save();

        res.json({ success: true, message: 'Customer rejected successfully', data: customer });
    } catch (error) {
        console.error('rejectCustomerByApprovalId error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createCustomer,
    uploadCustomerDocument,
    getNextCustomerId,
    getCustomers,
    getCustomerById,
    updateCustomer,
    uploadDocuments,
    kycVerify,
    approveCustomer,
    rejectCustomer,
    deleteCustomer,
    getAuditLog,
    getPendingCustomers,
    approveCustomerByApprovalId,
    rejectCustomerByApprovalId,
};
