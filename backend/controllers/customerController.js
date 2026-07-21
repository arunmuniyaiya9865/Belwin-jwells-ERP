const ApiError = require('../utils/ApiError');
const { Customer } = require('../models/Customer');
const Counter = require('../models/Counter');
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
const uploadCustomerDocument = async (req, res, next) => {
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
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (employee + admin)
// ─────────────────────────────────────────────────────────────────────────────
const createCustomer = async (req, res, next) => {
    const newlyUploadedPublicIds = [];
    
    try {
        // 1. Generate customerId FIRST
        const customerId = await Customer.getNextId();
        const folder = `belwin-jewels/customers/${customerId}`;

        const {
            customerName, guardianName, dateOfBirth, age, gender,
            mobileNumber, alternateNumber, email, aadhaarNumber, panNumber,
            doorStreet, area, city, district, state, postalCode,
            permanentAddress, temporaryAddress, voterId, occupation,
            remarks, proof2Name, proof2Number,
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
            customerName, guardianName, dateOfBirth, age, gender,
            mobileNumber, alternateNumber, email, aadhaarNumber, panNumber,
            doorStreet, area, city, district, state, postalCode,
            permanentAddress, temporaryAddress, voterId, occupation,
            remarks, proof2Name, proof2Number,
            customerPhotoUrl: photoUrl,
            customerPhotoPublicId: photoId,
            aadhaarDocumentUrl: aadhaarUrl,
            aadhaarDocumentPublicId: aadhaarId,
            proof2DocumentUrl: proof2Url,
            proof2DocumentPublicId: proof2Id,
            status: 'Customer Approval Pending',
            employeeId: req.user._id,
            createdBy: req.user._id,
            branchId: req.user.branch || req.user.branchId || null,
            branchName: req.user.branchName || '',
            // Snapshot creator employee
            createdByEmployee: {
                id: req.user._id,
                employeeId: req.user.employeeId?.employeeId || req.user.employeeId || '',
                employeeName: req.user.name || req.user.username || '',
                role: req.user.role || '',
                branchId: req.user.branch || req.user.branchId || null,
                branchName: req.user.branchName || ''
            },
            // Initialize workflow tracking
            approvalStatus: 'Pending',
            workflowHistory: [{
                action: 'Customer Created',
                performedBy: {
                    id: req.user._id,
                    employeeId: req.user.employeeId?.employeeId || req.user.employeeId || '',
                    name: req.user.name || req.user.username || '',
                    role: req.user.role || ''
                },
                date: new Date(),
                remarks: 'Initial customer creation'
            }]
        });

        addAudit(customer, 'CREATED', req.user);
        
        console.log(`[DEBUG] About to save customer. ID: ${customer.customerId}`);
        console.log(`[DEBUG] MongoDB Connection Host: ${require('mongoose').connection.host}, DB Name: ${require('mongoose').connection.name}`);
        
        try {
            await customer.save();
            console.log(`[DEBUG] Customer saved successfully! ID: ${customer._id}`);
        } catch (saveError) {
            console.error(`[DEBUG ERROR] Failed to save customer:`, saveError);
            throw saveError;
        }

        res.status(201).json({ success: true, message: 'Customer created successfully', data: customer });
    } catch (error) {
        console.error('createCustomer error:', error);
        // Rollback Cloudinary
        for (const pid of newlyUploadedPublicIds) {
            await deleteFromCloudinary(pid).catch(() => {});
        }
        next(new ApiError(500, error.message || 'Server error'));
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all customers (with search, filter, pagination)
// @route   GET /api/customers
// @access  Private (admin sees all, employee sees own)
// ─────────────────────────────────────────────────────────────────────────────
const getCustomers = async (req, res, next) => {
    try {
        const {
            page = 1, limit = 10,
            search = '',
            status,
            gender,
            city,
            branchId,
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
        if (branchId)         query.branchId = branchId;
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
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getCustomerById = async (req, res, next) => {
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
            return next(new ApiError(404, 'Customer not found' ));
        }

        const isGuest = req.user._id === '000000000000000000000000';
        if (!isGuest && req.user.role !== 'admin') {
            const ownerId = customer.createdBy?._id?.toString() || customer.createdBy?.toString();
            if (ownerId && ownerId !== req.user._id.toString()) {
                return next(new ApiError(403, 'Access denied' ));
            }
        }

        res.json({ success: true, data: customer });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update customer info
// @route   PUT /api/customers/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).lean();
        if (!customer) return next(new ApiError(404, 'Customer not found' ));

        if (customer.status === 'Approved' || customer.status === 'Rejected') {
            return res.status(403).json({
                success: false,
                message: "Customer is locked. Editing is not allowed."
            });
        }

        const isGuest = req.user._id === '000000000000000000000000';
        if (!isGuest && req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
            const ownerId = customer.createdBy?.toString();
            if (ownerId && ownerId !== req.user._id.toString()) {
                return next(new ApiError(403, 'Access denied' ));
            }
        }

        const allowed = [
            'customerName','guardianName','dateOfBirth','age','gender',
            'mobileNumber','alternateNumber','aadhaarNumber','panNumber',
            'doorStreet','area','city','postalCode','district','state',
            'permanentAddress','temporaryAddress','voterId','occupation',
            'remarks','proof2Name','proof2Number'
        ];
        
        const updatePayload = { $set: {} };
        allowed.forEach(field => {
            if (req.body[field] !== undefined) updatePayload.$set[field] = req.body[field];
        });

        if (!isGuest) updatePayload.$set.updatedBy = req.user._id;
        
        // Handle Correction Required resubmission
        if (customer.status === 'Correction Required') {
            updatePayload.$set.status = 'Customer Approval Pending';
            updatePayload.$set.approvalStatus = 'Pending';
            updatePayload.$set.correctionFields = [];
            updatePayload.$set.correctionStatus = false;
            updatePayload.$set.resubmittedAt = new Date();
            updatePayload.$set.resubmissionCount = (customer.resubmissionCount || 0) + 1;
            
            updatePayload.$push = {
                workflowHistory: {
                    action: 'Customer Updated and Resubmitted',
                    performedBy: {
                        id: req.user._id,
                        employeeId: req.user.employeeId?.employeeId || req.user.employeeId || '',
                        name: req.user.name || req.user.username || '',
                        role: req.user.role || ''
                    },
                    date: new Date(),
                    remarks: 'Customer resubmitted after correction.'
                }
            };
        }

        // Fix corrupted approvedBy field if present
        if (customer.approvedBy === "" || typeof customer.approvedBy === 'string') {
            updatePayload.$unset = { approvedBy: 1 };
        }

        await Customer.updateOne({ _id: customer._id }, updatePayload);

        // Fetch fresh copy to return
        let updatedCustomer = null;
        try {
            updatedCustomer = await Customer.findById(customer._id);
        } catch (e) {
            updatedCustomer = { ...customer, ...updatePayload.$set };
        }

        res.json({ success: true, message: 'Customer updated', data: updatedCustomer });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload / replace documents
// @route   POST /api/customers/:id/documents
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const uploadDocuments = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).lean();
        if (!customer) return next(new ApiError(404, 'Customer not found' ));

        const folder = `belwin-jewels/customers/${customer.customerId}`;
        const files = req.files || {};
        const updatePayload = { $set: {} };

        console.log('\n=============================================');
        console.log('[DEBUG] UPLOAD DOCUMENTS ENDPOINT HIT!');
        console.log('[DEBUG] req.params.id:', req.params.id);
        console.log('[DEBUG] req.headers["content-type"]:', req.headers['content-type']);
        console.log('[DEBUG] Object.keys(req.files || {}):', Object.keys(req.files || {}));
        console.log('[DEBUG] req.body keys:', Object.keys(req.body || {}));
        console.log('=============================================\n');

        if (req.files) {
            const documentFields = [
                { fileKey: 'photo',      urlKey: 'customerPhotoUrl',   idKey: 'customerPhotoPublicId',   suffix: 'photo' },
                { fileKey: 'aadhaarDoc', urlKey: 'aadhaarDocumentUrl', idKey: 'aadhaarDocumentPublicId', suffix: 'aadhaar' },
                { fileKey: 'proof2Doc',  urlKey: 'proof2DocumentUrl',  idKey: 'proof2DocumentPublicId',  suffix: 'proof2' }
            ];

            for (const field of documentFields) {
                const file = req.files[field.fileKey]?.[0];
                if (file) {
                    console.log(`\n=== REPLACING ${field.suffix.toUpperCase()} ===`);
                    // Delete old image from Cloudinary if it exists
                    if (customer[field.idKey]) {
                        console.log(`[Cloudinary Audit] Found old public_id: ${customer[field.idKey]}`);
                        try {
                            const destroyResult = await require('../config/cloudinary').cloudinary.uploader.destroy(customer[field.idKey]);
                            console.log(`[Cloudinary Audit] Destroy result:`, destroyResult);
                        } catch (err) {
                            console.error(`[Cloudinary Audit] Destroy failed:`, err.message);
                        }
                    } else {
                        console.log(`[Cloudinary Audit] No old public_id found.`);
                    }
                    
                    // Upload new image with unique timestamp to guarantee cache-busting
                    const uniqueSuffix = `${field.suffix}_${Date.now()}`;
                    const upload = await uploadFromBuffer(file.buffer, folder, uniqueSuffix);
                    console.log(`[Cloudinary Audit] New upload public_id: ${upload.public_id}`);
                    console.log(`[Cloudinary Audit] New secure_url: ${upload.secure_url}`);
                    
                    updatePayload.$set[field.urlKey] = upload.secure_url;
                    updatePayload.$set[field.idKey] = upload.public_id;
                }
            }
        }

        // Fix corrupted approvedBy field if present
        if (customer.approvedBy === "" || typeof customer.approvedBy === 'string') {
            updatePayload.$unset = { approvedBy: 1 };
        }

        if (Object.keys(updatePayload.$set).length > 0 || updatePayload.$unset) {
            await Customer.updateOne({ _id: customer._id }, updatePayload);
        }

        // Fetch fresh copy to return
        let updatedCustomer = null;
        try {
            updatedCustomer = await Customer.findById(customer._id);
            console.log(`\n=== FINAL MONGODB STATE AFTER SAVE ===`);
            console.log(`customerPhotoPublicId: ${updatedCustomer.customerPhotoPublicId}`);
            console.log(`aadhaarDocumentPublicId: ${updatedCustomer.aadhaarDocumentPublicId}`);
            console.log(`proof2DocumentPublicId: ${updatedCustomer.proof2DocumentPublicId}`);
        } catch (e) {
            updatedCustomer = { ...customer, ...updatePayload.$set };
        }

        res.json({ success: true, message: 'Documents updated', data: updatedCustomer });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    KYC workflow
// ─────────────────────────────────────────────────────────────────────────────
const kycVerify = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return next(new ApiError(404, 'Customer not found' ));

        const next = {
            'Customer Approval Pending': 'KYC Verification Pending',
            'KYC Verification Pending':  'KYC Verified',
        }[customer.status];

        if (!next) return next(new ApiError(400, 'Invalid status transition' ));

        customer.status = next;
        addAudit(customer, `STATUS_CHANGED_TO_${next.replace(/ /g,'_').toUpperCase()}`, req.user);
        await customer.save();
        res.json({ success: true, message: `Status updated to ${next}`, data: customer });
    } catch (error) { next(error); }
};

const approveCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return next(new ApiError(404, 'Customer not found' ));
        if (customer.status !== 'KYC Verified') return next(new ApiError(400, 'Not KYC Verified' ));

        customer.status = 'Approved';
        addAudit(customer, 'APPROVED', req.user);
        await customer.save();
        res.json({ success: true, message: 'Customer approved', data: customer });
    } catch (error) { next(error); }
};

const rejectCustomer = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return next(new ApiError(404, 'Customer not found' ));

        customer.status = 'Rejected';
        customer.rejectionReason = reason;
        addAudit(customer, 'REJECTED', req.user, reason);
        await customer.save();
        res.json({ success: true, message: 'Customer rejected', data: customer });
    } catch (error) { next(error); }
};

const deleteCustomer = async (req, res, next) => {
    try {
        const { hardDelete, deleteReason = '' } = req.query;
        const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!customer) return next(new ApiError(404, 'Customer not found' ));

        if (hardDelete === 'true') {
            if (req.user.role !== 'superAdmin') {
                return next(new ApiError(403, 'Hard delete requires Super Admin privileges' ));
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
            return next(new ApiError(400, 'Invalid customer ID format' ));
        }
        next(new ApiError(500, error.message || 'Server error' ));
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get audit trail for a customer
// @route   GET /api/customers/:id/audit
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAuditLog = async (req, res, next) => {
    try {
        const customer = await Customer
            .findOne({ _id: req.params.id })
            .populate('auditLog.performedBy', 'username role')
            .select('customerId customerName auditLog');

        if (!customer) return next(new ApiError(404, 'Customer not found' ));

        res.json({ success: true, data: customer });
    } catch (error) { next(error); }
};

const getNextCustomerId = async (req, res, next) => {
    try {
        const counter = await Counter.findOne({ _id: 'customerId' });
        const nextSeq = (counter?.seq || 0) + 1;
        const customerId = `CUST${String(nextSeq).padStart(6, '0')}`;
        res.json({ success: true, customerId });
    } catch (error) {
        next(new ApiError(500, 'Server error' ));
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all customers whose approvalStatus is Pending
// @route   GET /api/customers/pending
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getPendingCustomers = async (req, res, next) => {
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
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Approve customer by MongoDB _id or customerId
// @route   PUT /api/customers/approve/:customerId
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const approveCustomerByApprovalId = async (req, res, next) => {
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
            return next(new ApiError(404, 'Customer not found' ));
        }

        if (customer.approvalStatus === 'Approved') {
            return next(new ApiError(400, 'Customer is already approved' ));
        }

        // Update fields
        customer.approvalStatus = 'Approved';
        customer.approvedBy = req.user._id;
        customer.approvedDate = new Date();

        // Sync legacy status field if appropriate
        customer.status = 'Approved';

        addAudit(customer, 'APPROVED', req.user, req.body.note || 'Approved via pending review');
        await customer.save();

        res.json({ success: true, message: 'Customer approved successfully', data: customer });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reject customer by MongoDB _id or customerId
// @route   PUT /api/customers/reject/:customerId
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const rejectCustomerByApprovalId = async (req, res, next) => {
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
            return next(new ApiError(404, 'Customer not found' ));
        }

        if (customer.approvalStatus === 'Rejected') {
            return next(new ApiError(400, 'Customer is already rejected' ));
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
    } catch (error) { next(error); }
};

const getCorrections = async (req, res, next) => {
    try {
        const query = { status: 'Correction Required', isDeleted: { $ne: true } };
        const isGuest = req.user._id === '000000000000000000000000';
        
        // Employees only see their own branch's / their own correction requests
        if (req.user.role !== 'admin' && req.user.role !== 'superAdmin' && !isGuest) {
            const userBranch = req.user.branch || req.user.branchId;
            if (userBranch) {
                query.branchId = userBranch;
            } else {
                query.createdBy = req.user._id;
            }
        }

        const customers = await Customer
            .find(query)
            .populate('createdBy', 'username role')
            .lean();

        res.json({ success: true, data: customers });
    } catch (error) { next(error); }
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
    getCorrections,
};
