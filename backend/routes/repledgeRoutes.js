const express = require('express');
const router = express.Router();
const { createRepledge, getRepledgesByLoan, getAllRepledges } = require('../controllers/repledgeController');

// GET /api/repledges - All repledges (reports)
router.get('/', getAllRepledges);

// POST /api/repledges - Create repledge + update loan status
router.post('/', createRepledge);

// GET /api/repledges/loan/:loanId - History for a specific loan
router.get('/loan/:loanId', getRepledgesByLoan);

module.exports = router;
