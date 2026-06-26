const fs = require('fs');

let content = fs.readFileSync('backend/controllers/reportController.js', 'utf8');

const newImports = `const Remittance = require('../models/Remittance');
const Denomination = require('../models/Denomination');
const GoldStock = require('../models/GoldStock');
`;

content = content.replace(`const Expense = require('../models/Expense');`, `const Expense = require('../models/Expense');\n${newImports}`);

const newFunc = `
// @desc    Get Daily Closing Summary Report
// @route   GET /api/reports/daily-closing-summary
// @access  Public
const getDailyClosingSummary = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const getSum = (arr) => arr.length > 0 ? arr[0].total : 0;

    // Opening Balance (Before targetDate)
    const [pInc, pPay, pExp, pLoan, pTop, pRep] = await Promise.all([
      Income.aggregate([{ $match: { incomeDate: { $lt: startOfDay } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }]),
      Payment.aggregate([{ $match: { paymentDate: { $lt: startOfDay } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$paymentAmount" } } } }]),
      Expense.aggregate([{ $match: { expenseDate: { $lt: startOfDay } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }]),
      Loan.aggregate([{ $match: { loanDate: { $lt: startOfDay } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$loanAmount" } } } }]),
      TopUp.aggregate([{ $match: { topupDate: { $lt: startOfDay } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$topupAmount" } } } }]),
      Repledge.aggregate([{ $match: { repledgeDate: { $lt: startOfDay } } }, { $group: { _id: null, total: { $sum: { $toDouble: "$additionalLoanAmount" } } } }])
    ]);

    const openingBalance = (getSum(pInc) + getSum(pPay)) - (getSum(pExp) + getSum(pLoan) + getSum(pTop) + getSum(pRep));

    // Today's Data
    const [incomes, expenses, payments, denominations, goldStocks] = await Promise.all([
      Income.find({ incomeDate: { $gte: startOfDay, $lte: endOfDay } }),
      Expense.find({ expenseDate: { $gte: startOfDay, $lte: endOfDay } }),
      Payment.find({ paymentDate: { $gte: startOfDay, $lte: endOfDay } }),
      Denomination.find({ date: { $gte: startOfDay, $lte: endOfDay } }),
      GoldStock.find()
    ]);

    // Calculate Totals
    const totalIncomeList = incomes.map(i => ({ title: i.incomeCategory || i.description || 'Income', amount: parseFloat(i.amount) || 0 }));
    const totalExpenseList = expenses.map(e => ({ title: e.expenseCategory || e.description || 'Expense', amount: parseFloat(e.amount) || 0 }));
    
    let interestCollection = 0;
    let principalCollection = 0;
    let documentCharges = 0;
    payments.forEach(p => {
      interestCollection += parseFloat(p.interestAmount) || 0;
      principalCollection += parseFloat(p.principalAmount) || 0;
      documentCharges += parseFloat(p.penaltyAmount) || 0;
    });

    totalIncomeList.push({ title: 'Interest Collection', amount: interestCollection });
    totalIncomeList.push({ title: 'Principal Collection', amount: principalCollection });
    if (documentCharges > 0) totalIncomeList.push({ title: 'Document Charges', amount: documentCharges });

    const totalIncome = totalIncomeList.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = totalExpenseList.reduce((sum, item) => sum + item.amount, 0);

    const closingBalance = openingBalance + totalIncome - totalExpense;

    // Denomination summary
    let denominationSummary = [];
    if (denominations.length > 0) {
      const latestDenom = denominations[denominations.length - 1];
      denominationSummary = latestDenom.notes.map(n => ({ value: n.value, count: n.count, amount: n.value * n.count })).filter(n => n.count > 0);
    }

    // Gold Stock Summary
    const totalGoldArticles = goldStocks.length;
    const totalGoldWeight = goldStocks.reduce((sum, g) => sum + (parseFloat(g.netWeight) || 0), 0);
    const auctionReadyCount = goldStocks.filter(g => g.status === 'Auction Ready').length;

    res.json({
      date: targetDate.toISOString().split('T')[0],
      openingBalance,
      totalIncome,
      totalExpense,
      closingBalance,
      incomeBreakdown: totalIncomeList,
      expenseBreakdown: totalExpenseList,
      denominationSummary,
      goldStockSummary: {
        totalArticles: totalGoldArticles,
        totalWeight: totalGoldWeight,
        auctionReadyCount
      }
    });
  } catch (error) {
    console.error('Error generating daily closing summary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
`;

content = content.replace('module.exports = {', newFunc + '\nmodule.exports = {');

content = content.replace('getBusinessReport\n};', 'getBusinessReport,\n  getDailyClosingSummary\n};');

fs.writeFileSync('backend/controllers/reportController.js', content);
console.log('Patched reportController.js');
