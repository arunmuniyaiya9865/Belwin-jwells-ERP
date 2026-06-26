import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';

import NewCustomer from './pages/NewCustomer';
import EditDeleteCustomer from './pages/EditDeleteCustomer';
import CustomerApprovalPending from './pages/CustomerApprovalPending';
import AadharVerification from './pages/AadharVerification';
import ProvideLoan from './pages/ProvideLoan';
import EditLoan from './pages/EditLoan';
import CustomerHistory from './pages/CustomerHistory';
import RepledgingChangeStatus from './pages/RepledgingChangeStatus';
import TopUpLoan from './pages/TopUpLoan';
import ReceivePayment from './pages/ReceivePayment';
import PaymentHistory from './pages/PaymentHistory';
import ReportsDashboard from './pages/ReportsDashboard';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';
import ExpenseReport from './pages/ExpenseReport';
import AddIncome from './pages/AddIncome';
import EditIncome from './pages/EditIncome';
import IncomeReport from './pages/IncomeReport';
import AddDenomination from './pages/AddDenomination';
import AddFollowup from './pages/AddFollowup';
import AddRemittance from './pages/AddRemittance';
import RemittanceHistory from './pages/RemittanceHistory';
import CallReport from './pages/CallReport';
import SendGoldRequest from './pages/SendGoldRequest';
import GoldStockReport from './pages/GoldStockReport';
import Schemes from './pages/Schemes';
import DailySummaryReport from './pages/DailySummaryReport';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-erp-dark text-text-primary">
        <Header />
        <main className="flex-1 w-full p-6 print:p-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-customer" element={<NewCustomer />} />
            <Route path="/edit-delete-customer" element={<EditDeleteCustomer />} />
            <Route path="/customer-approval-pending" element={<CustomerApprovalPending />} />
            <Route path="/aadhar-verification" element={<AadharVerification />} />
            <Route path="/provide-loan" element={<ProvideLoan />} />
            <Route path="/edit-loan" element={<EditLoan />} />
            <Route path="/customer-history" element={<CustomerHistory />} />
            <Route path="/repledging-change-status" element={<RepledgingChangeStatus />} />
            <Route path="/top-up-loan" element={<TopUpLoan />} />
            <Route path="/receive-payment" element={<ReceivePayment />} />
            <Route path="/payment-history" element={<PaymentHistory />} />

            {/* Reports */}
            <Route path="/daily-summary-report" element={<DailySummaryReport />} />
            <Route path="/today-collection-report" element={<ReportsDashboard />} />
            <Route path="/loan-report" element={<ReportsDashboard />} />
            <Route path="/loan-outstanding-report" element={<ReportsDashboard />} />
            <Route path="/interest-pending-report" element={<ReportsDashboard />} />
            <Route path="/datewise-pending-list" element={<ReportsDashboard />} />
            <Route path="/closed-account-report" element={<ReportsDashboard />} />
            <Route path="/repledge-report" element={<ReportsDashboard />} />
            <Route path="/auction-account" element={<ReportsDashboard />} />
            <Route path="/account-summary-report" element={<ReportsDashboard />} />
            <Route path="/cash-assets-report" element={<ReportsDashboard />} />
            <Route path="/business-report" element={<ReportsDashboard />} />

            {/* Expenses */}
            <Route path="/add-expense" element={<AddExpense />} />
            <Route path="/edit-expense" element={<EditExpense />} />
            <Route path="/expense-report" element={<ExpenseReport />} />

            {/* income */}
            <Route path="/add-income" element={<AddIncome />} />
            <Route path="/edit-income" element={<EditIncome />} />
            <Route path="/income-report" element={<IncomeReport />} />
            <Route path="/add-denomination" element={<AddDenomination />} />

            {/* Customer call */}
            <Route path="/call-log" element={<AddFollowup />} />
            <Route path="/pending-calls" element={<CallReport />} />
            <Route path="/add-followup" element={<AddFollowup />} />
            <Route path="/call-report" element={<CallReport />} />

            {/* Remittance */}
            <Route path="/new-remittance" element={<AddRemittance />} />
            <Route path="/remittance-history" element={<RemittanceHistory />} />

            {/* Gold Stock */}
            <Route path="/send-request" element={<SendGoldRequest />} />
            <Route path="/gold-stock-report" element={<GoldStockReport />} />

            {/* Info */}
            <Route path="/schemes" element={<Schemes />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
