const ApiError = require('../utils/ApiError');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const TopUp = require('../models/topupModel');
const Repledge = require('../models/Repledge');
const Customer = require('../models/Customer').Customer;
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Remittance = require('../models/Remittance').Remittance;
const Denomination = require('../models/Denomination');
const GoldStock = require('../models/GoldStock');


// @desc    Get Daily Summary Report
// @route   GET /api/reports/daily-summary
// @access  Public
const getDailySummary = async (req, res, next) => {
  try {
    const queryDate = req.query.date ? new Date(req.query.date) : new Date();
    
    // Create UTC bounds for the day to match properly regardless of local time offsets
    const startOfDay = new Date(queryDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(queryDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const dateFilter = { $gte: startOfDay, $lte: endOfDay };

    // 1. Loans Created Today
    const loansToday = await Loan.find({ loanDate: dateFilter });
    const totalLoansCreated = loansToday.length;
    const totalLoanAmount = loansToday.reduce((sum, loan) => sum + (parseFloat(loan.loanAmount) || 0), 0);

    // 2. Payments Received Today
    const paymentsToday = await Payment.find({ paymentDate: dateFilter });
    const totalPaymentsReceivedCount = paymentsToday.length;
    const totalPaymentsAmount = paymentsToday.reduce((sum, p) => sum + (parseFloat(p.paymentAmount) || 0), 0);
    const totalInterestCollected = paymentsToday.reduce((sum, p) => sum + (parseFloat(p.interestAmount) || 0), 0);
    const totalPrincipalCollected = paymentsToday.reduce((sum, p) => sum + (parseFloat(p.principalAmount) || 0), 0);

    // 3. Top Ups Today
    const topupsToday = await TopUp.find({ topupDate: dateFilter });
    const totalTopUpsCount = topupsToday.length;
    const totalTopUpsAmount = topupsToday.reduce((sum, t) => sum + (parseFloat(t.topupAmount) || 0), 0);

    // 4. Repledges Today
    const repledgesToday = await Repledge.find({ repledgeDate: dateFilter });
    const totalRepledgesCount = repledgesToday.length;

    // 5. Closed Loans Today
    // A loan is considered closed today if it has a Full Settlement payment today.
    // Alternatively, we check payments of type 'Full Settlement' today.
    const fullSettlementsToday = paymentsToday.filter(p => p.paymentType === 'Full Settlement');
    const closedLoansCount = fullSettlementsToday.length;

    res.json({
      date: queryDate.toISOString().split('T')[0],
      totalLoansCreated,
      totalLoanAmount,
      totalPaymentsReceivedCount,
      totalPaymentsAmount,
      totalInterestCollected,
      totalPrincipalCollected,
      totalTopUpsCount,
      totalTopUpsAmount,
      totalRepledgesCount,
      closedLoansCount
    });
  } catch (error) { next(error); }
};

// @desc    Get Loan Report
// @route   GET /api/reports/loan-report
// @access  Public
const getLoanReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, customerId, status } = req.query;
    let query = {};

    if (fromDate || toDate) {
      query.loanDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.loanDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.loanDate.$lte = end;
      }
    }

    if (customerId) {
      query.customerId = { $regex: new RegExp(customerId, 'i') }; // Case-insensitive partial match
    }

    if (status) {
      query.status = status;
    }

    const loans = await Loan.find(query).sort({ loanDate: -1, createdAt: -1 });

    const formattedLoans = loans.map(loan => ({
      loanId: loan.loanId,
      customerId: loan.customerId,
      customerName: loan.name,
      loanDate: loan.loanDate,
      loanAmount: parseFloat(loan.loanAmount) || 0,
      remainingLoanAmount: parseFloat(loan.remainingLoanAmount) || 0,
      status: loan.status,
      createdAt: loan.createdAt
    }));

    res.json(formattedLoans);
  } catch (error) { next(error); }
};

// @desc    Get Loan Outstanding Report
// @route   GET /api/reports/loan-outstanding
// @access  Public
const getLoanOutstandingReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, customerId, status } = req.query;
    let query = {
      remainingLoanAmount: { $gt: 0 },
      status: { $ne: 'Closed' } // Business rule: never include closed loans
    };

    if (fromDate || toDate) {
      query.loanDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.loanDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.loanDate.$lte = end;
      }
    }

    if (customerId) {
      query.customerId = { $regex: new RegExp(customerId, 'i') };
    }

    if (status) {
      query.status = status;
    }

    const loans = await Loan.find(query).sort({ loanDate: -1, createdAt: -1 });

    const formattedLoans = loans.map(loan => ({
      loanId: loan.loanId,
      customerId: loan.customerId,
      customerName: loan.name,
      loanDate: loan.loanDate,
      loanAmount: parseFloat(loan.loanAmount) || 0,
      remainingLoanAmount: parseFloat(loan.remainingLoanAmount) || 0,
      status: loan.status,
      interestRate: parseFloat(loan.interestRate) || 0,
      remainingDays: parseInt(loan.remainingDays) || 0
    }));

    res.json(formattedLoans);
  } catch (error) { next(error); }
};

// @desc    Get Interest Pending Report
// @route   GET /api/reports/interest-pending
// @access  Public
const getInterestPendingReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, customerId, status } = req.query;
    let query = {
      status: { $in: ['Active', 'Overdue', 'TopUp', 'Repledged'] } // Business rule: only these statuses
    };

    if (fromDate || toDate) {
      query.loanDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.loanDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.loanDate.$lte = end;
      }
    }

    if (customerId) {
      query.customerId = { $regex: new RegExp(customerId, 'i') };
    }

    if (status) {
      query.status = status;
    }

    const loans = await Loan.find(query).sort({ loanDate: -1, createdAt: -1 });

    const formattedLoans = loans.map(loan => ({
      loanId: loan.loanId,
      customerId: loan.customerId,
      customerName: loan.name,
      loanDate: loan.loanDate,
      loanAmount: parseFloat(loan.loanAmount) || 0,
      interestRate: parseFloat(loan.interestRate) || 0,
      totalPaidInterestAmount: parseFloat(loan.totalPaidInterestAmount) || 0,
      remainingInterestAmount: parseFloat(loan.remainingInterestAmount) || 0,
      status: loan.status
    }));

    res.json(formattedLoans);
  } catch (error) { next(error); }
};

// @desc    Get Closed Accounts Report
// @route   GET /api/reports/closed-accounts
// @access  Public
const getClosedAccountsReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, customerId } = req.query;
    let query = {
      status: 'Closed'
    };

    if (fromDate || toDate) {
      query.loanDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.loanDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.loanDate.$lte = end;
      }
    }

    if (customerId) {
      query.customerId = { $regex: new RegExp(customerId, 'i') };
    }

    const loans = await Loan.find(query).sort({ loanDate: -1, createdAt: -1 });

    // Fetch payments to get settlement details
    const loanIds = loans.map(l => l.loanId);
    const fullSettlements = await Payment.find({
      loanId: { $in: loanIds },
      paymentType: 'Full Settlement'
    });

    const formattedLoans = loans.map(loan => {
      const settlement = fullSettlements.find(p => p.loanId === loan.loanId);
      return {
        loanId: loan.loanId,
        customerId: loan.customerId,
        customerName: loan.name,
        loanDate: loan.loanDate,
        loanAmount: parseFloat(loan.loanAmount) || 0,
        settlementAmount: settlement ? (parseFloat(settlement.paymentAmount) || 0) : 0,
        closedDate: settlement ? settlement.paymentDate : loan.updatedAt,
        status: loan.status
      };
    });

    res.json(formattedLoans);
  } catch (error) { next(error); }
};

// @desc    Get Repledge Report
// @route   GET /api/reports/repledge-report
// @access  Public
const getRepledgeReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, loanId, customerId } = req.query;
    let query = {};

    if (fromDate || toDate) {
      query.repledgeDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.repledgeDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.repledgeDate.$lte = end;
      }
    }

    if (loanId) {
      query.loanId = { $regex: new RegExp(loanId, 'i') };
    }

    if (customerId) {
      query.customerId = { $regex: new RegExp(customerId, 'i') };
    }

    const repledges = await Repledge.find(query).sort({ repledgeDate: -1, createdAt: -1 });

    const formattedRepledges = repledges.map(rep => ({
      repledgeId: rep.repledgeId,
      loanId: rep.loanId,
      customerId: rep.customerId,
      customerName: rep.customerName,
      oldStatus: rep.oldStatus,
      newStatus: rep.newStatus,
      previousLoanAmount: parseFloat(rep.remainingLoanAmount || rep.oldLoanAmount) || 0,
      newLoanAmount: (parseFloat(rep.remainingLoanAmount || rep.oldLoanAmount) || 0) + (parseFloat(rep.additionalLoanAmount) || 0),
      repledgeDate: rep.repledgeDate,
      remarks: rep.remarks || ''
    }));

    res.json(formattedRepledges);
  } catch (error) { next(error); }
};

// @desc    Get Account Summary Report
// @route   GET /api/reports/account-summary
// @access  Public
const getAccountSummaryReport = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    let loanQuery = {};
    let paymentQuery = {};
    let topupQuery = {};
    let repledgeQuery = {};
    let customerQuery = {};

    if (fromDate || toDate) {
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        loanQuery.loanDate = { ...loanQuery.loanDate, $gte: start };
        paymentQuery.paymentDate = { ...paymentQuery.paymentDate, $gte: start };
        topupQuery.topupDate = { ...topupQuery.topupDate, $gte: start };
        repledgeQuery.repledgeDate = { ...repledgeQuery.repledgeDate, $gte: start };
        customerQuery.createdAt = { ...customerQuery.createdAt, $gte: start };
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        loanQuery.loanDate = { ...loanQuery.loanDate, $lte: end };
        paymentQuery.paymentDate = { ...paymentQuery.paymentDate, $lte: end };
        topupQuery.topupDate = { ...topupQuery.topupDate, $lte: end };
        repledgeQuery.repledgeDate = { ...repledgeQuery.repledgeDate, $lte: end };
        customerQuery.createdAt = { ...customerQuery.createdAt, $lte: end };
      }
    }

    // Parallel fetch
    const [loans, payments, topups, repledges, customers] = await Promise.all([
      Loan.find(loanQuery),
      Payment.find(paymentQuery),
      TopUp.find(topupQuery),
      Repledge.find(repledgeQuery),
      Customer.find(customerQuery)
    ]);

    const totalCustomers = customers.length;
    const totalLoans = loans.length;
    
    let totalLoanAmount = 0;
    let totalOutstandingAmount = 0;
    let closedLoanCount = 0;
    
    loans.forEach(loan => {
      totalLoanAmount += parseFloat(loan.loanAmount) || 0;
      totalOutstandingAmount += parseFloat(loan.remainingLoanAmount) || 0;
      if (loan.status === 'Closed') {
        closedLoanCount++;
      }
    });

    let totalPaymentsReceived = 0;
    let totalPrincipalCollected = 0;
    let totalInterestCollected = 0;

    payments.forEach(payment => {
      totalPaymentsReceived += parseFloat(payment.paymentAmount) || 0;
      totalPrincipalCollected += parseFloat(payment.principalAmount) || 0;
      totalInterestCollected += parseFloat(payment.interestAmount) || 0;
    });

    let totalTopUpAmount = 0;
    topups.forEach(topup => {
      totalTopUpAmount += parseFloat(topup.topupAmount) || 0;
    });

    const totalRepledgeCount = repledges.length;

    res.json({
      totalCustomers,
      totalLoans,
      totalLoanAmount,
      totalOutstandingAmount,
      totalPaymentsReceived,
      totalPrincipalCollected,
      totalInterestCollected,
      totalTopUpAmount,
      totalRepledgeCount,
      closedLoanCount
    });

  } catch (error) { next(error); }
};

// @desc    Get Today Collection Report
// @route   GET /api/reports/today-collection
// @access  Public
const getTodayCollectionReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, customerId, loanId, paymentMode } = req.query;

    let start, end;

    if (fromDate || toDate) {
      start = fromDate ? new Date(fromDate) : new Date();
      start.setHours(0, 0, 0, 0);

      end = toDate ? new Date(toDate) : new Date(start);
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    const matchQuery = {
      paymentDate: {
        $gte: start,
        $lte: end
      }
    };

    if (customerId) {
      matchQuery.customerId = { $regex: new RegExp(customerId, 'i') };
    }
    if (loanId) {
      matchQuery.loanId = { $regex: new RegExp(loanId, 'i') };
    }
    if (paymentMode) {
      matchQuery.paymentMode = { $regex: new RegExp(paymentMode, 'i') };
    }

    const payments = await Payment.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: 'customerId',
          as: 'customerDetails'
        }
      },
      {
        $unwind: { path: '$customerDetails', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          date: '$paymentDate',
          customerId: '$customerId',
          customerName: { $ifNull: ['$customerDetails.customerName', 'Unknown Customer'] },
          loanId: '$loanId',
          principalAmount: { $ifNull: ['$principalAmount', 0] },
          interestAmount: { $ifNull: ['$interestAmount', 0] },
          documentCharges: { $ifNull: ['$penaltyAmount', 0] },
          paymentMode: '$paymentMode',
          employeeName: '$collectedBy'
        }
      },
      {
        $addFields: {
          totalAmount: {
            $add: ['$principalAmount', '$interestAmount', '$documentCharges']
          }
        }
      },
      { $sort: { date: -1 } }
    ]);

    const totalCustomers = new Set(payments.map(p => p.customerId)).size;
    const totalPrincipal = payments.reduce((acc, curr) => acc + curr.principalAmount, 0);
    const totalInterest = payments.reduce((acc, curr) => acc + curr.interestAmount, 0);
    const totalDocumentCharges = payments.reduce((acc, curr) => acc + curr.documentCharges, 0);
    const grandTotal = totalPrincipal + totalInterest + totalDocumentCharges;

    res.json({
      summary: {
        totalCustomersCollected: totalCustomers,
        totalPrincipalCollection: totalPrincipal,
        totalInterestCollection: totalInterest,
        totalDocumentCharges: totalDocumentCharges,
        totalCollectionAmount: grandTotal
      },
      tableData: payments
    });
  } catch (error) { next(error); }
};

// @desc    Get Datewise Pending List Report
// @route   GET /api/reports/datewise-pending
// @access  Public
const getDatewisePendingReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, customerId } = req.query;

    const query = {
      status: { $ne: 'Closed' },
      remainingLoanAmount: { $gt: 0 }
    };

    if (fromDate || toDate) {
      query.loanDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.loanDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.loanDate.$lte = end;
      }
    }

    if (customerId) {
      query.customerId = new RegExp(customerId, 'i');
    }

    const loans = await Loan.find(query).sort({ loanDate: -1, createdAt: -1 });

    const formattedLoans = loans.map(loan => {
      const today = new Date();
      const loanDate = new Date(loan.loanDate);
      const diffTime = Math.abs(today - loanDate);
      const pendingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        loanId: loan.loanId,
        customerId: loan.customerId,
        customerName: loan.name,
        loanDate: loan.loanDate,
        loanAmount: parseFloat(loan.loanAmount) || 0,
        remainingLoanAmount: parseFloat(loan.remainingLoanAmount) || 0,
        remainingInterestAmount: parseFloat(loan.remainingInterestAmount) || 0,
        status: loan.status,
        pendingDays: pendingDays
      };
    });

    res.json(formattedLoans);
  } catch (error) { next(error); }
};

// @desc    Get Cash Assets Report
// @route   GET /api/reports/cash-assets
// @access  Public
const getCashAssetsReport = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    let dateQuery = {};
    if (fromDate || toDate) {
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        dateQuery.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        dateQuery.$lte = end;
      }
    }

    const paymentQ = Object.keys(dateQuery).length > 0 ? { paymentDate: dateQuery } : {};
    const incomeQ = Object.keys(dateQuery).length > 0 ? { incomeDate: dateQuery } : {};
    const expenseQ = Object.keys(dateQuery).length > 0 ? { expenseDate: dateQuery } : {};

    const [payments, incomes, expenses] = await Promise.all([
      Payment.find(paymentQ),
      Income.find(incomeQ),
      Expense.find(expenseQ)
    ]);

    let transactions = [];
    let totalCashInflow = 0;
    let totalCashOutflow = 0;

    payments.forEach(p => {
      const amt = parseFloat(p.paymentAmount) || 0;
      totalCashInflow += amt;
      transactions.push({
        date: p.paymentDate,
        transactionType: 'Payment Received',
        referenceId: p.paymentId,
        description: `Payment for Loan ${p.loanId}`,
        amount: amt,
        flowType: 'Inflow'
      });
    });

    incomes.forEach(i => {
      const amt = parseFloat(i.amount) || 0;
      totalCashInflow += amt;
      transactions.push({
        date: i.incomeDate,
        transactionType: 'Other Income',
        referenceId: i.incomeId || '-',
        description: i.description,
        amount: amt,
        flowType: 'Inflow'
      });
    });

    expenses.forEach(e => {
      const amt = parseFloat(e.amount) || 0;
      totalCashOutflow += amt;
      transactions.push({
        date: e.expenseDate,
        transactionType: 'Expense',
        referenceId: e.expenseId || '-',
        description: e.description,
        amount: amt,
        flowType: 'Outflow'
      });
    });

    // Sort newest first
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      totalCashInflow,
      totalCashOutflow,
      netCashPosition: totalCashInflow - totalCashOutflow,
      totalTransactions: transactions.length,
      transactions
    });
  } catch (error) { next(error); }
};

// @desc    Get Auction Accounts Report
// @route   GET /api/reports/auction-accounts
// @access  Public
const getAuctionAccountsReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, customerId, status } = req.query;

    const query = {
      status: { $in: ['Auction Ready', 'Auctioned'] }
    };

    if (status && ['Auction Ready', 'Auctioned'].includes(status)) {
      query.status = status;
    }

    if (fromDate || toDate) {
      query.loanDate = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        query.loanDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.loanDate.$lte = end;
      }
    }

    if (customerId) {
      query.customerId = new RegExp(customerId, 'i');
    }

    const loans = await Loan.find(query).sort({ loanDate: -1, createdAt: -1 });

    const formattedLoans = loans.map(loan => {
      const today = new Date();
      const loanDate = new Date(loan.loanDate);
      const diffTime = Math.abs(today - loanDate);
      const pendingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        loanId: loan.loanId,
        customerId: loan.customerId,
        customerName: loan.name,
        loanDate: loan.loanDate,
        loanAmount: parseFloat(loan.loanAmount) || 0,
        remainingLoanAmount: parseFloat(loan.remainingLoanAmount) || 0,
        status: loan.status,
        pendingDays: pendingDays
      };
    });

    res.json(formattedLoans);
  } catch (error) { next(error); }
};

// @desc    Get Business Report
// @route   GET /api/reports/business-report
// @access  Public
const getBusinessReport = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    let dateQuery = {};
    if (fromDate || toDate) {
      if (fromDate) {
        const start = new Date(fromDate);
        start.setUTCHours(0, 0, 0, 0);
        dateQuery.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        dateQuery.$lte = end;
      }
    }

    const loanQ = Object.keys(dateQuery).length > 0 ? { loanDate: dateQuery } : {};
    const paymentQ = Object.keys(dateQuery).length > 0 ? { paymentDate: dateQuery } : {};
    const topupQ = Object.keys(dateQuery).length > 0 ? { topupDate: dateQuery } : {};
    const repledgeQ = Object.keys(dateQuery).length > 0 ? { repledgeDate: dateQuery } : {};
    const incomeQ = Object.keys(dateQuery).length > 0 ? { incomeDate: dateQuery } : {};
    const expenseQ = Object.keys(dateQuery).length > 0 ? { expenseDate: dateQuery } : {};
    const customerQ = Object.keys(dateQuery).length > 0 ? { createdAt: dateQuery } : {};

    const [
      customers,
      loans,
      payments,
      topups,
      repledges,
      incomes,
      expenses
    ] = await Promise.all([
      Customer.find(customerQ),
      Loan.find(loanQ),
      Payment.find(paymentQ),
      TopUp.find(topupQ),
      Repledge.find(repledgeQ),
      Income.find(incomeQ),
      Expense.find(expenseQ)
    ]);

    // Customer Metrics
    const totalCustomers = customers.length;
    
    // Find active customers (those who have an active/overdue loan)
    const activeLoanCustomerIds = new Set(
      loans.filter(l => ['Active', 'Overdue', 'TopUp', 'Repledged'].includes(l.status)).map(l => l.customerId)
    );
    const activeCustomers = activeLoanCustomerIds.size;

    // Loan Metrics
    const totalLoans = loans.length;
    const totalLoanAmount = loans.reduce((sum, l) => sum + (parseFloat(l.loanAmount) || 0), 0);
    const totalOutstandingAmount = loans.reduce((sum, l) => sum + (parseFloat(l.remainingLoanAmount) || 0), 0);
    const closedLoans = loans.filter(l => l.status === 'Closed').length;

    // Payment Metrics
    const totalCollections = payments.reduce((sum, p) => sum + (parseFloat(p.paymentAmount) || 0), 0);
    const totalPrincipalCollections = payments.reduce((sum, p) => sum + (parseFloat(p.principalAmount) || 0), 0);
    const totalInterestCollections = payments.reduce((sum, p) => sum + (parseFloat(p.interestAmount) || 0), 0);

    // TopUp / Repledge Metrics
    const totalTopUpAmount = topups.reduce((sum, t) => sum + (parseFloat(t.topupAmount) || 0), 0);
    const totalRepledges = repledges.length;

    // Business Metrics
    const totalIncome = incomes.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const netCashPosition = (totalCollections + totalIncome) - totalExpenses;

    res.json({
      metrics: {
        totalCustomers,
        activeCustomers,
        totalLoans,
        totalLoanAmount,
        totalOutstandingAmount,
        closedLoans,
        totalCollections,
        totalPrincipalCollections,
        totalInterestCollections,
        totalTopUpAmount,
        totalRepledges,
        totalIncome,
        totalExpenses,
        netCashPosition
      }
    });
  } catch (error) { next(error); }
};


// @desc    Get Daily Closing Summary Report (Ledger Format)
// @route   GET /api/reports/daily-closing-summary
// @access  Public
const getDailyClosingSummary = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const getSum = (arr) => arr.length > 0 ? arr[0].total : 0;

    // 1. OPENING BALANCE (All prior to startOfDay)
    const [pInc, pPay, pRemIn, pExp, pLoan, pTop, pRep, pRemOut] = await Promise.all([
      // Inflows
      Income.aggregate([{ $match: { incomeDate: { $lt: startOfDay } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }]),
      Payment.aggregate([{ $match: { paymentDate: { $lt: startOfDay } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$paymentAmount" } } } }]),
      Remittance.aggregate([{ $match: { remittanceDate: { $lt: startOfDay }, type: 'Received' } }, { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }]),
      // Outflows
      Expense.aggregate([{ $match: { expenseDate: { $lt: startOfDay } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }]),
      Loan.aggregate([{ $match: { loanDate: { $lt: startOfDay } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$loanAmount" } } } }]),
      TopUp.aggregate([{ $match: { topupDate: { $lt: startOfDay } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$topupAmount" } } } }]),
      Repledge.aggregate([{ $match: { repledgeDate: { $lt: startOfDay } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$additionalLoanAmount" } } } }]),
      Remittance.aggregate([{ $match: { remittanceDate: { $lt: startOfDay }, type: 'Sent' } }, { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }])
    ]);

    const openingBalance = (getSum(pInc) + getSum(pPay) + getSum(pRemIn)) - (getSum(pExp) + getSum(pLoan) + getSum(pTop) + getSum(pRep) + getSum(pRemOut));

    // 2. TODAY'S TRANSACTIONS
    const [incomes, expenses, payments, denominations, goldStocks, remittances] = await Promise.all([
      Income.find({ incomeDate: { $gte: startOfDay, $lte: endOfDay } }),
      Expense.find({ expenseDate: { $gte: startOfDay, $lte: endOfDay } }),
      Payment.find({ paymentDate: { $gte: startOfDay, $lte: endOfDay } }),
      Denomination.find({ date: { $gte: startOfDay, $lte: endOfDay } }),
      Loan.find({ loanDate: { $gte: startOfDay, $lte: endOfDay } }).populate('customerId'),
      Remittance.find({ remittanceDate: { $gte: startOfDay, $lte: endOfDay } })
    ]);

    // Income Mapping (Varavu)
    let incomeItems = [];
    
    // Payments (Interest, Principal, Document)
    let totalInterest = 0;
    let totalPrincipal = 0;
    let totalPenalty = 0;
    payments.forEach(p => {
      totalInterest += parseFloat(p.interestAmount) || 0;
      totalPrincipal += parseFloat(p.principalAmount) || 0;
      totalPenalty += parseFloat(p.penaltyAmount) || 0;
    });

    if (totalInterest > 0) incomeItems.push({ title: 'Receipt Interest Amount Collected', amount: totalInterest });
    if (totalPrincipal > 0) incomeItems.push({ title: 'A/C . Receipt Principal Collected', amount: totalPrincipal });
    if (totalPenalty > 0) incomeItems.push({ title: 'Receipt Doc. Collected', amount: totalPenalty });

    // Remittance Received
    const remittanceReceived = remittances.filter(r => r.type === 'Received').reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
    if (remittanceReceived > 0) incomeItems.push({ title: 'Remittance', amount: remittanceReceived });

    // Individual Incomes
    incomes.forEach(i => {
      incomeItems.push({ title: i.incomeCategory || i.description || 'Income', amount: parseFloat(i.amount) || 0 });
    });

    // Expense Mapping (Selavu)
    let expenseItems = [];
    
    // General Expenses
    expenses.forEach(e => {
      expenseItems.push({ title: e.expenseCategory || e.description || 'Expense', amount: parseFloat(e.amount) || 0 });
    });

    // Loans Issued Today
    const loansIssued = goldStocks.reduce((acc, l) => acc + (parseFloat(l.loanAmount) || 0), 0);
    if (loansIssued > 0) expenseItems.push({ title: 'LOAN', amount: loansIssued });

    // Remittance Sent
    const remittanceSent = remittances.filter(r => r.type === 'Sent').reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
    if (remittanceSent > 0) expenseItems.push({ title: 'Remittance Sent', amount: remittanceSent });

    const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenseItems.reduce((sum, item) => sum + item.amount, 0);

    const closingBalance = openingBalance + totalIncome - totalExpense;

    // Denominations
    let notes = {
      "2000": { count: 0, amount: 0 },
      "500": { count: 0, amount: 0 },
      "200": { count: 0, amount: 0 },
      "100": { count: 0, amount: 0 },
      "50": { count: 0, amount: 0 },
      "20": { count: 0, amount: 0 },
      "10": { count: 0, amount: 0 },
      "Coins": { count: 0, amount: 0 }
    };
    let denominationTotal = 0;

    if (denominations.length > 0) {
      const latestDenom = denominations[denominations.length - 1];
      latestDenom.notes.forEach(n => {
        if (notes[n.value.toString()]) {
          notes[n.value.toString()] = { count: n.count, amount: n.value * n.count };
          denominationTotal += (n.value * n.count);
        }
      });
      // Handle coins
      notes["Coins"] = { count: latestDenom.coins || 0, amount: latestDenom.coins || 0 };
      denominationTotal += (latestDenom.coins || 0);
    }

    // Gold Stock from Loans created today
    const goldStock = goldStocks.map(l => ({
      loanId: l.loanId || l._id.toString(),
      customerName: l.customerId ? l.customerId.name : 'Unknown',
      weight: l.grossWeight ? l.grossWeight + 'g' : '-'
    }));

    res.json({
      date: targetDate.toISOString().split('T')[0],
      openingBalance,
      closingBalance,
      income: {
        items: incomeItems,
        total: totalIncome
      },
      expense: {
        items: expenseItems,
        total: totalExpense
      },
      denominations: {
        notes,
        total: denominationTotal
      },
      goldStock
    });
  } catch (error) { next(error); }
};

module.exports = {
  getDailySummary,
  getLoanReport,
  getLoanOutstandingReport,
  getInterestPendingReport,
  getClosedAccountsReport,
  getRepledgeReport,
  getAccountSummaryReport,
  getTodayCollectionReport,
  getDatewisePendingReport,
  getCashAssetsReport,
  getAuctionAccountsReport,
  getBusinessReport,
  getDailyClosingSummary
};
