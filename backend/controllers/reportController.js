const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const TopUp = require('../models/topupModel');
const Repledge = require('../models/Repledge');
const Customer = require('../models/Customer').Customer;
const Income = require('../models/Income');
const Expense = require('../models/Expense');

// @desc    Get Daily Summary Report
// @route   GET /api/reports/daily-summary
// @access  Public
const getDailySummary = async (req, res) => {
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
  } catch (error) {
    console.error('Error generating daily summary report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Loan Report
// @route   GET /api/reports/loan-report
// @access  Public
const getLoanReport = async (req, res) => {
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
  } catch (error) {
    console.error('Error generating loan report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Loan Outstanding Report
// @route   GET /api/reports/loan-outstanding
// @access  Public
const getLoanOutstandingReport = async (req, res) => {
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
  } catch (error) {
    console.error('Error generating loan outstanding report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Interest Pending Report
// @route   GET /api/reports/interest-pending
// @access  Public
const getInterestPendingReport = async (req, res) => {
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
  } catch (error) {
    console.error('Error generating interest pending report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Closed Accounts Report
// @route   GET /api/reports/closed-accounts
// @access  Public
const getClosedAccountsReport = async (req, res) => {
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
  } catch (error) {
    console.error('Error generating closed accounts report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Repledge Report
// @route   GET /api/reports/repledge-report
// @access  Public
const getRepledgeReport = async (req, res) => {
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
  } catch (error) {
    console.error('Error generating repledge report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Account Summary Report
// @route   GET /api/reports/account-summary
// @access  Public
const getAccountSummaryReport = async (req, res) => {
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

  } catch (error) {
    console.error('Error generating account summary report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Today Collection Report
// @route   GET /api/reports/today-collection
// @access  Public
const getTodayCollectionReport = async (req, res) => {
  try {
    const { date } = req.query;

    let targetDate = new Date();
    if (date) {
      targetDate = new Date(date);
    }

    const start = new Date(targetDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setUTCHours(23, 59, 59, 999);

    const query = {
      paymentDate: { $gte: start, $lte: end }
    };

    const payments = await Payment.find(query).sort({ paymentDate: -1, createdAt: -1 });

    // Extract unique loan IDs to map customer names from Loan collection
    const loanIds = [...new Set(payments.map(p => p.loanId))];
    const loans = await Loan.find({ loanId: { $in: loanIds } });
    
    // Map loanId to customerName
    const nameMap = {};
    loans.forEach(loan => {
      nameMap[loan.loanId] = loan.name;
    });

    const formattedPayments = payments.map(payment => ({
      paymentId: payment.paymentId,
      paymentDate: payment.paymentDate,
      loanId: payment.loanId,
      customerId: payment.customerId,
      customerName: nameMap[payment.loanId] || 'Unknown',
      paymentType: payment.paymentType,
      amountReceived: parseFloat(payment.paymentAmount) || 0,
      principalAmount: parseFloat(payment.principalAmount) || 0,
      interestAmount: parseFloat(payment.interestAmount) || 0,
      penaltyAmount: parseFloat(payment.penaltyAmount) || 0
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error('Error generating today collection report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Datewise Pending List Report
// @route   GET /api/reports/datewise-pending
// @access  Public
const getDatewisePendingReport = async (req, res) => {
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
  } catch (error) {
    console.error('Error generating datewise pending report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Cash Assets Report
// @route   GET /api/reports/cash-assets
// @access  Public
const getCashAssetsReport = async (req, res) => {
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
  } catch (error) {
    console.error('Error generating cash assets report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Auction Accounts Report
// @route   GET /api/reports/auction-accounts
// @access  Public
const getAuctionAccountsReport = async (req, res) => {
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
  } catch (error) {
    console.error('Error generating auction accounts report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Business Report
// @route   GET /api/reports/business-report
// @access  Public
const getBusinessReport = async (req, res) => {
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
  } catch (error) {
    console.error('Error generating business report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
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
  getBusinessReport
};
