// Force Node.js to use Google's DNS to resolve MongoDB Atlas SRV records
// (Local/ISP DNS may block SRV lookups causing ECONNREFUSED errors)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes     = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const customerRoutes = require('./routes/customerRoutes');
const customerHistoryRoutes = require('./routes/customerHistoryRoutes');
const customerApprovalRoutes = require('./routes/customerApprovalRoutes');
const loanRoutes = require('./routes/loanRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const repledgeRoutes = require('./routes/repledgeRoutes');
const topupRoutes = require('./routes/topupRoutes');
const reportRoutes = require('./routes/reportRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const denominationRoutes = require('./routes/denominationRoutes');
const followupRoutes = require('./routes/followupRoutes');
const remittanceRoutes = require('./routes/remittanceRoutes');
const goldStockRoutes = require('./routes/goldStockRoutes');
const goldRequestRoutes = require('./routes/goldRequestRoutes');
const callLogRoutes = require('./routes/callLogRoutes');
const goldSchemeRoutes = require('./routes/goldSchemeRoutes');
const provideLoanRoutes = require('./routes/provideLoanRoutes');
const customerLedgerRoutes = require('./routes/customerLedgerRoutes');
const loanClosureRoutes = require('./routes/loanClosureRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const hrRoutes = require('./routes/hrRoutes');
const searchRoutes = require('./routes/searchRoutes');

app.use('/api/auth',      authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/customer-history', customerHistoryRoutes);
app.use('/api/customer-approval', customerApprovalRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/repledges', repledgeRoutes);
app.use('/api/topups', topupRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/denominations', denominationRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/remittances', remittanceRoutes);
app.use('/api/gold-stocks', goldStockRoutes);
app.use('/api/gold-requests', goldRequestRoutes);
app.use('/api/calls', callLogRoutes);
app.use('/api/gold-schemes', goldSchemeRoutes);
app.use('/api/provide-loan', provideLoanRoutes);
app.use('/api/customer-ledger', customerLedgerRoutes);
app.use('/api/loan-closure', loanClosureRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/search', searchRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Global Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/belwin_erp';

const { initializeEmployeeIds } = require('./controllers/employeeController');

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        await initializeEmployeeIds();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });
