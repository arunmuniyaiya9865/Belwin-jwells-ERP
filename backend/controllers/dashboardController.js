const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const { Customer } = require('../models/Customer');
const Employee = require('../models/Employee');
const Expense = require('../models/Expense');

exports.getEmployeeStats = async (req, res) => {
  try {

    // Branch module not merged yet
    const filter = {};

    // Today's Collections
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayCollections = await Payment.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$paymentAmount"
          }
        }
      }
    ]);

    // Loan Statistics
    const loanStats = await Loan.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalWeight: { $sum: "$totalWt" }
        }
      }
    ]);

    // Customers
    const totalCustomers = await Customer.countDocuments(filter);

    const activeLoans =
      loanStats.find(s => s._id === "Active")?.count || 0;

    const closedAccounts =
      loanStats.find(s => s._id === "Closed")?.count || 0;

    const auctionAccounts =
      (loanStats.find(s => s._id === "Auction Ready")?.count || 0) +
      (loanStats.find(s => s._id === "Auctioned")?.count || 0);

    const totalGoldWeight =
      loanStats.reduce((sum, s) => sum + (s.totalWeight || 0), 0);

    // Expense Statistics
    const expenseStats = await Expense.aggregate([
      {
        $match: {
          requestedBy: req.user.employeeId
        }
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1
          }
        }
      }
    ]);

    const recentExpenses = await Expense.find({
      requestedBy: req.user.employeeId
    })
      .sort({ createdAt: -1 })
      .limit(4);

    const pendingExpenses =
      expenseStats.find(s => s._id === "Pending")?.count || 0;

    const approvedExpenses =
      expenseStats.find(s => s._id === "Approved")?.count || 0;

    const rejectedExpenses =
      expenseStats.find(s => s._id === "Rejected")?.count || 0;

    return res.json({
      success: true,
      stats: {
        todayCollections: todayCollections[0]?.total || 0,
        activeLoans,
        closedAccounts,
        auctionAccounts,
        totalCustomers,
        totalGoldWeight,
        pendingInterest: 0,

        pendingExpenses,
        approvedExpenses,
        rejectedExpenses,
        recentExpenses
      }
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics"
    });
  }
};

exports.getMenuPermissions = async (req, res) => {
  try {

    const employee = await Employee.findById(req.user.employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    if (employee.role === "Super Admin") {
      return res.json({
        success: true,
        role: employee.role,
        permissions: ["*"]
      });
    }

    return res.json({
      success: true,
      role: employee.role,
      permissions: employee.permissions || []
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};