const fs = require('fs');

let content = fs.readFileSync('backend/controllers/reportController.js', 'utf8');

// I will overwrite getDailyClosingSummary
const newFunc = `
// @desc    Get Daily Closing Summary Report (Ledger Format)
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
  } catch (error) {
    console.error('Error generating daily closing summary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
`;

const regex = /\/\/ @desc    Get Daily Closing Summary Report[\s\S]*?res\.status\(500\)\.json\(\{ message: 'Server Error', error: error\.message \}\);\n  \}\n\};/m;
content = content.replace(regex, newFunc.trim());

fs.writeFileSync('backend/controllers/reportController.js', content);
console.log('Updated getDailyClosingSummary');
