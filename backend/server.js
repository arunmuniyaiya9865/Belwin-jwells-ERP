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

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes     = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
<<<<<<< HEAD
const customerRoutes = require('./routes/customerRoutes');
const customerHistoryRoutes = require('./routes/customerHistoryRoutes');
const customerApprovalRoutes = require('./routes/customerApprovalRoutes');
const loanRoutes = require('./routes/loanRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const repledgeRoutes = require('./routes/repledgeRoutes');
const topupRoutes = require('./routes/topupRoutes');
const reportRoutes = require('./routes/reportRoutes');
=======
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const denominationRoutes = require('./routes/denominationRoutes');
const followupRoutes = require('./routes/followupRoutes');
<<<<<<< HEAD
const remittanceRoutes = require('./routes/remittanceRoutes');
const goldStockRoutes = require('./routes/goldStockRoutes');
const goldRequestRoutes = require('./routes/goldRequestRoutes');
const callLogRoutes = require('./routes/callLogRoutes');
=======
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6

app.use('/api/auth',      authRoutes);
app.use('/api/employees', employeeRoutes);
<<<<<<< HEAD
app.use('/api/customers', customerRoutes);
app.use('/api/customer-history', customerHistoryRoutes);
app.use('/api/customer-approval', customerApprovalRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/repledges', repledgeRoutes);
app.use('/api/topups', topupRoutes);
app.use('/api/reports', reportRoutes);
=======
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/denominations', denominationRoutes);
app.use('/api/followups', followupRoutes);
<<<<<<< HEAD
app.use('/api/remittances', remittanceRoutes);
app.use('/api/gold-stocks', goldStockRoutes);
app.use('/api/gold-requests', goldRequestRoutes);
app.use('/api/calls', callLogRoutes);
=======
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/belwin_erp';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });
