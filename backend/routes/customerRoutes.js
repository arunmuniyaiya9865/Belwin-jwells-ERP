const express = require('express');
const router = express.Router();

const { customerMultiUpload, memoryUpload } = require('../config/cloudinary');
const {
    validateCreateCustomer,
    validateUpdateCustomer,
    validateRejection,
} = require('../middleware/validateCustomer');

// ── Multer error handlers ──────────────────────────────────────────────────────
const uploadMiddleware = (req, res, next) => {
    customerMultiUpload(req, res, (err) => {
        if (!err) return next();
        return res.status(400).json({ success: false, message: err.message || 'File upload error' });
    });
};

const memoryMiddleware = (req, res, next) => {
    memoryUpload.fields([
        { name: 'photo',      maxCount: 1 },
        { name: 'aadhaarDoc', maxCount: 1 },
        { name: 'proof2Doc',  maxCount: 1 },
    ])(req, res, (err) => {
        if (!err) return next();
        return res.status(400).json({ success: false, message: err.message || 'File upload error' });
    });
};

// ── Inject a default system user when no auth token provided ─────────────────
// This employee portal has no login flow; we attach a guest context so
// createdBy / auditLog fields are always populated safely.
const {
    createCustomer,
    uploadCustomerDocument,
    getCustomers,
    getCustomerById,
    updateCustomer,
    uploadDocuments,
    kycVerify,
    approveCustomer,
    rejectCustomer,
    deleteCustomer,
    getAuditLog,
    getNextCustomerId,
    getPendingCustomers,
    approveCustomerByApprovalId,
    rejectCustomerByApprovalId,
} = require('../controllers/customerController');

const guestUser = (req, res, next) => {
    if (!req.user) {
        req.user = {
            _id: '000000000000000000000000', // placeholder ObjectId string
            username: 'employee-portal',
            role: 'employee',
        };
    }
    next();
};

// ── Routes ─────────────────────────────────────────────────────────────────────
router.get('/next-id', guestUser, getNextCustomerId);
router.get('/search', guestUser, getCustomers);
router.get('/filter', guestUser, getCustomers);
router.get('/pending', guestUser, getPendingCustomers);
router.put('/approve/:customerId', guestUser, approveCustomerByApprovalId);
router.put('/reject/:customerId', guestUser, validateRejection, rejectCustomerByApprovalId);

/**
 * POST   /api/customers/upload -> Standalone upload (returns metadata)
 */
router.post('/upload', memoryMiddleware, guestUser, uploadCustomerDocument);

/**
 * POST   /api/customers      → Create customer (+ optional file uploads)
 * GET    /api/customers      → List / search / filter / paginate
 */
router.route('/')
    .post(memoryMiddleware, guestUser, validateCreateCustomer, createCustomer)
    .get(guestUser, getCustomers);

/**
 * GET    /api/customers/:id  → Single customer
 * PUT    /api/customers/:id  → Update fields
 * DELETE /api/customers/:id  → Soft delete
 */
router.route('/:id')
    .get(guestUser, getCustomerById)
    .put(guestUser, validateUpdateCustomer, updateCustomer)
    .delete(guestUser, deleteCustomer);

/**
 * POST   /api/customers/:id/documents  → Upload / replace Cloudinary files
 */
router.post('/:id/documents', memoryMiddleware, guestUser, uploadDocuments);

/**
 * PUT    /api/customers/:id/kyc-verify → KYC pipeline step
 */
router.put('/:id/kyc-verify', guestUser, kycVerify);

/**
 * PUT    /api/customers/:id/approve    → Approve customer
 */
router.put('/:id/approve', guestUser, approveCustomer);

/**
 * PUT    /api/customers/:id/reject     → Reject with reason
 */
router.put('/:id/reject', guestUser, validateRejection, rejectCustomer);

/**
 * GET    /api/customers/:id/audit      → Full audit trail
 */
router.get('/:id/audit', guestUser, getAuditLog);

module.exports = router;
