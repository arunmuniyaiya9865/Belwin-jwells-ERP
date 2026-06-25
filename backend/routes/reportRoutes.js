const express = require('express');
const router = express.Router();
const { getDailySummary, getLoanReport, getLoanOutstandingReport, getInterestPendingReport, getClosedAccountsReport, getRepledgeReport, getAccountSummaryReport, getTodayCollectionReport, getDatewisePendingReport, getCashAssetsReport, getAuctionAccountsReport, getBusinessReport } = require('../controllers/reportController');

// GET /api/reports/daily-summary
router.get('/daily-summary', getDailySummary);

// GET /api/reports/loan-report
router.get('/loan-report', getLoanReport);

// GET /api/reports/loan-outstanding
router.get('/loan-outstanding', getLoanOutstandingReport);

// GET /api/reports/interest-pending
router.get('/interest-pending', getInterestPendingReport);

// GET /api/reports/closed-accounts
router.get('/closed-accounts', getClosedAccountsReport);

// GET /api/reports/repledge-report
router.get('/repledge-report', getRepledgeReport);

// GET /api/reports/account-summary
router.get('/account-summary', getAccountSummaryReport);

// GET /api/reports/today-collection
router.get('/today-collection', getTodayCollectionReport);

// GET /api/reports/datewise-pending
router.get('/datewise-pending', getDatewisePendingReport);

// GET /api/reports/cash-assets
router.get('/cash-assets', getCashAssetsReport);

// GET /api/reports/auction-accounts
router.get('/auction-accounts', getAuctionAccountsReport);

// GET /api/reports/business-report
router.get('/business-report', getBusinessReport);

module.exports = router;
