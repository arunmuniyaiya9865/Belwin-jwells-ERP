import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
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

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-erp-dark text-text-primary">
        <Header />
        <main className="flex-1 w-full p-6">
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
            <Route path="/daily-summary-report" element={<ReportsDashboard />} />
            <Route path="/today-collection-report" element={<ReportsDashboard />} />
            <Route path="/loan-report" element={<ReportsDashboard />} />
            <Route path="/loan-outstanding-report" element={<ReportsDashboard />} />
            <Route path="/interest-pending-report" element={<ReportsDashboard />} />
            <Route path="/datewise-pending-list" element={<ReportsDashboard />} />
            <Route path="/closed-account-report" element={<ReportsDashboard />} />
            <Route path="/repledge-report" element={<ReportsDashboard />} />
            <Route path="/auction-account" element={<ReportsDashboard />} />
            <Route path="/accounts-summary-report" element={<ReportsDashboard />} />
            <Route path="/cash-assets-report" element={<ReportsDashboard />} />
            <Route path="/business-report" element={<ReportsDashboard />} />

            {/* Other routes will go here */}
          </Routes>
        </main>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
