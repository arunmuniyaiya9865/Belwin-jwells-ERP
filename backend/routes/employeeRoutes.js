const express = require('express');
const router = express.Router();
const {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(protect, getEmployees)
    .post(protect, admin, upload.single('document'), createEmployee);

router.route('/:id')
    .get(protect, getEmployeeById)
    .put(protect, admin, upload.single('document'), updateEmployee)
    .delete(protect, admin, deleteEmployee);

module.exports = router;
