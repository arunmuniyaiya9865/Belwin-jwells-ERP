const express = require('express');
const router = express.Router();

const {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getNextEmployeeId,
    toggleEmployeeStatus,
    resetPassword
} = require('../controllers/employeeController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/next-id', protect, getNextEmployeeId);
router.post('/reset-password', protect, authorize('admin', 'hr'), resetPassword);
router.patch('/toggle-status/:id', protect, authorize('admin', 'hr'), toggleEmployeeStatus);

router.route('/')
    .get(protect, getEmployees)
    .post(protect, authorize('admin', 'hr'), upload.single('document'), createEmployee);

router.route('/:id')
    .get(protect, getEmployeeById)
    .put(protect, authorize('admin', 'hr'), upload.single('document'), updateEmployee)
    .delete(protect, authorize('admin', 'hr'), deleteEmployee);

module.exports = router;
