const express = require('express');
const router = express.Router();

const { getEmployeeStats, getMenuPermissions } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');

// Get permission-based menu
router.get('/menu', protect, getMenuPermissions);

// Get dashboard stats
router.get('/stats', protect,
  checkPermission('dashboard:view'),
  getEmployeeStats
);

module.exports = router;