import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout components
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ComingSoon from './components/ComingSoon';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeList from './pages/admin/EmployeeList';
import EmployeeForm from './pages/admin/EmployeeForm';
import EmployeeView from './pages/admin/EmployeeView';
import ResetPassword from './pages/admin/ResetPassword';
import Attendance from './pages/admin/Attendance';
import SalaryManagement from './pages/admin/SalaryManagement';
import RolesPermissions from './pages/admin/RolesPermissions';
import AdminCustomerApprovalPending from './pages/admin/CustomerApprovalPending';
// Employee Pages
import Dashboard from './pages/employee/main/Dashboard';
import Login from './pages/employee/main/Login';
import NewCustomer from './pages/employee/customer/NewCustomer';
import EditDeleteCustomer from './pages/employee/customer/EditDeleteCustomer';
import CustomerApprovalPending from './pages/employee/customer/CustomerApprovalPending';
import AadharVerification from './pages/employee/customer/AadharVerification';
import ProvideLoan from './pages/employee/loan/ProvideLoan';
import EditLoan from './pages/employee/loan/EditLoan';
import CustomerHistory from './pages/employee/loan/CustomerHistory';
import CustomerLedger from './pages/employee/customer/CustomerLedger';
import LoanClosure from './pages/employee/loan/LoanClosure';
import RepledgingChangeStatus from './pages/employee/loan/RepledgingChangeStatus';
import TopUpLoan from './pages/employee/loan/TopUpLoan';
import ReceivePayment from './pages/employee/payment/ReceivePayment';
import PaymentHistory from './pages/employee/payment/PaymentHistory';
import ReportsDashboard from './pages/employee/report/ReportsDashboard';
import AddExpense from './pages/employee/expenses/AddExpense';
import EditExpense from './pages/employee/expenses/EditExpense';
import ExpenseReport from './pages/employee/expenses/ExpenseReport';
import AddIncome from './pages/employee/income/AddIncome';
import EditIncome from './pages/employee/income/EditIncome';
import IncomeReport from './pages/employee/income/IncomeReport';
import AddDenomination from './pages/employee/income/AddDenomination';
import AddFollowup from './pages/employee/call/AddFollowup';
import AddRemittance from './pages/employee/remittance/AddRemittance';
import RemittanceHistory from './pages/employee/remittance/RemittanceHistory';
import CallReport from './pages/employee/call/CallReport';
import SendGoldRequest from './pages/employee/gold-stock/SendGoldRequest';
import GoldStockReport from './pages/employee/gold-stock/GoldStockReport';
import Schemes from './pages/employee/info/Schemes';
import DailySummaryReport from './pages/employee/report/DailySummaryReport';
import AuditorReport from './pages/employee/info/AuditorReport';
import License from './pages/employee/info/License';
import UpdateIncentive from './pages/employee/info/UpdateIncentive';
import WeightMachine from './pages/employee/info/WeightMachine';
import AdvanceDetails from './pages/employee/info/AdvanceDetails';
function App() {
  return (
    <Router>
      <Routes>
        {/* Base redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        
        {/* Unified Login (no layout) */}
        <Route path="/login" element={<Login />} />

        {/* Admin Layout Routes */}
        <Route element={<ProtectedRoute role="admin"><AppLayout /></ProtectedRoute>}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<EmployeeList />} />
          <Route path="/admin/employees/create" element={<EmployeeForm />} />
          <Route path="/admin/employees/edit/:id" element={<EmployeeForm />} />
          <Route path="/admin/employees/view/:id" element={<EmployeeView />} />
          <Route path="/admin/employees/reset-password/:id" element={<ResetPassword />} />
          <Route path="/admin/attendance" element={<Attendance />} />
          <Route path="/admin/salary" element={<SalaryManagement />} />
          <Route path="/admin/roles" element={<RolesPermissions />} />

          {/* Placeholders for unfinished modules from sidebar */}
          <Route path="/admin/master/*" element={<ComingSoon />} />
          <Route path="/admin/loan-config/*" element={<ComingSoon />} />
          <Route path="/admin/borrower/*" element={<ComingSoon />} />
          <Route path="/admin/borrower/customer-approval" element={<AdminCustomerApprovalPending />} />
          <Route path="/admin/accounts/*" element={<ComingSoon />} />
          <Route path="/admin/reports/*" element={<ComingSoon />} />
          <Route path="/admin/approval/pending" element={<AdminCustomerApprovalPending />} />
          <Route path="/admin/repledge/*" element={<ComingSoon />} />
          
          <Route path="/admin/employees/downline" element={<ComingSoon />} />
          <Route path="/admin/employees/block" element={<ComingSoon />} />
          <Route path="/admin/employees/icard" element={<ComingSoon />} />
          <Route path="/admin/employees/promotion" element={<ComingSoon />} />
        </Route>

        {/* Employee Layout Routes */}
        <Route element={<ProtectedRoute role="employee"><AppLayout /></ProtectedRoute>}>
          <Route path="/employee-dashboard" element={<Dashboard />} />
          <Route path="/new-customer" element={<NewCustomer />} />
          <Route path="/edit-delete-customer" element={<EditDeleteCustomer />} />
          <Route path="/customer-approval-pending" element={<CustomerApprovalPending />} />
          <Route path="/aadhar-verification" element={<AadharVerification />} />
          <Route path="/customer-ledger" element={<CustomerLedger />} />
          <Route path="/provide-loan" element={<ProvideLoan />} />
          <Route path="/edit-loan" element={<EditLoan />} />
          <Route path="/customer-history" element={<CustomerHistory />} />
          <Route path="/loan-closure" element={<LoanClosure />} />
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
          <Route path="/followups" element={<AddFollowup />} />
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
          <Route path="/license" element={<License />} />
          <Route path="/update-incentive" element={<UpdateIncentive />} />
          <Route path="/weight-machine" element={<WeightMachine />} />
          <Route path="/auditor-report" element={<AuditorReport />} />
          <Route path="/advance-details" element={<AdvanceDetails />} />
          
        </Route>

      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
