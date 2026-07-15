const express = require('express');
const router = express.Router();

const {
  getDailySummary,
  getLoanReport,
  getLoanOutstandingReport,
  getInterestPendingReport,
  getClosedAccountsReport,
  getRepledgeReport,
  getAccountSummaryReport,
  getTodayCollectionReport,
  getTodayCollectionById,
  exportTodayCollection,
  getDatewisePendingReport,
  getCashAssetsReport,
  getAuctionAccountsReport,
  getBusinessReport,
  getDailyClosingSummary
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/reports/daily-closing-summary
router.get('/daily-closing-summary', protect, getDailyClosingSummary);

// GET /api/reports/daily-summary
router.get('/daily-summary', protect, getDailySummary);

// GET /api/reports/loan-report
router.get('/loan-report', protect, getLoanReport);

// GET /api/reports/loan-outstanding
router.get('/loan-outstanding', protect, getLoanOutstandingReport);

// GET /api/reports/interest-pending
router.get('/interest-pending', protect, getInterestPendingReport);

// GET /api/reports/closed-accounts
router.get('/closed-accounts', protect, getClosedAccountsReport);

// GET /api/reports/repledge-report
router.get('/repledge-report', protect, getRepledgeReport);

// GET /api/reports/account-summary
router.get('/account-summary', protect, getAccountSummaryReport);

// GET /api/reports/today-collection — Protected, paginated report
router.get('/today-collection/export', protect, authorize('admin', 'hr', 'employee'), exportTodayCollection);
router.get('/today-collection/:receiptId', protect, authorize('admin', 'hr', 'employee'), getTodayCollectionById);
router.get('/today-collection', protect, authorize('admin', 'hr', 'employee'), getTodayCollectionReport);

// GET /api/reports/datewise-pending
router.get('/datewise-pending', protect, getDatewisePendingReport);

// GET /api/reports/cash-assets
router.get('/cash-assets', protect, getCashAssetsReport);

// GET /api/reports/auction-accounts
router.get('/auction-accounts', protect, getAuctionAccountsReport);

// GET /api/reports/business-report
router.get('/business-report', protect, getBusinessReport);

module.exports = router;
