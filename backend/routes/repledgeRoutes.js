const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createRepledge, getRepledgesByLoan, getAllRepledges } = require('../controllers/repledgeController');

// GET /api/repledges - All repledges (reports)
router.get('/', protect, getAllRepledges);

// POST /api/repledges - Create repledge + update loan status
router.post('/', protect, createRepledge);

// GET /api/repledges/loan/:loanId - History for a specific loan
router.get('/loan/:loanId', protect, getRepledgesByLoan);

module.exports = router;
