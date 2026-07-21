import {
  LayoutDashboard, Users, UserPlus,
  Settings, Database, Sliders, User, Network, Lock, IdCard, Award,
  Calculator, FileText, Car, Store, Boxes, Diamond, TrendingUp, TrendingDown, Key, UserCheck,
  Upload, CheckCircle, ShieldCheck, FileSearch, ShieldBan, Plus,
  Briefcase, BookOpen, CreditCard, Download, FileEdit, ArrowRightLeft, Landmark, Banknote, ClipboardList,
  Wallet, LayoutGrid, Coins, Box, PhoneCall, PhoneForwarded, Send, History, X,
  CalendarDays, UserCog, ClipboardCheck
} from 'lucide-react';

export const ADMIN_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard' },
  {
    id: 'master', label: 'Master', icon: Database,
    children: [
      { label: 'Master Config', icon: Settings, path: '/admin/master/config' }
    ]
  },
  {
    id: 'loan_config', label: 'Loan Configuration', icon: Sliders,
    children: [
      { label: 'Loan Calculator', icon: Calculator, path: '/admin/loan-config/calculator' },
      { label: 'Loan Scheme', icon: FileText, path: '/admin/loan-config/scheme' },
      { label: 'Vehicle Master', icon: Car, path: '/admin/loan-config/vehicle' },
      { label: 'Dealer Master', icon: Store, path: '/admin/loan-config/dealer' },
      { label: 'Item Group Master', icon: Boxes, path: '/admin/loan-config/item-group' },
      { label: 'Purity Master', icon: Diamond, path: '/admin/loan-config/purity' },
      { label: 'Gold Rate Master', icon: TrendingUp, path: '/admin/loan-config/gold-rate' },
      { label: 'Locker Master', icon: Key, path: '/admin/loan-config/locker' },
      { label: 'Valuer Master', icon: UserCheck, path: '/admin/loan-config/valuer' },
    ]
  },
  {
    id: 'borrower', label: 'Borrower', icon: User,
    children: [
      { label: 'New Borrower', icon: UserPlus, path: '/admin/borrower/new' },
      { label: 'KYC Upload', icon: Upload, path: '/admin/borrower/kyc-upload' },
      { label: 'KYC Approval', icon: CheckCircle, path: '/admin/borrower/kyc-approval' },
      { label: 'CIBIL Check', icon: ShieldCheck, path: '/admin/borrower/cibil-check' },
      { label: 'Borrower Synopsis', icon: FileSearch, path: '/admin/borrower/synopsis' },
      { label: 'Borrower Details Report', icon: FileText, path: '/admin/borrower/details-report' },
      { label: 'Borrower Block/Unblock', icon: ShieldBan, path: '/admin/borrower/block' },
    ]
  },
  {
    id: 'accounts', label: 'Accounts', icon: Briefcase,
    children: [
      { label: 'Ledger Master', icon: BookOpen, path: '/admin/accounts/ledger-master' },
      { label: 'Accounts Group Master', icon: Users, path: '/admin/accounts/group-master' },
      { label: 'Payment Voucher Entry', icon: CreditCard, path: '/admin/accounts/payment-voucher' },
      { label: 'Receive Voucher Entry', icon: Download, path: '/admin/accounts/receive-voucher' },
      { label: 'Journal Voucher Entry', icon: FileEdit, path: '/admin/accounts/journal-voucher' },
      { label: 'Contra Voucher Entry', icon: ArrowRightLeft, path: '/admin/accounts/contra-voucher' },
      { label: 'Bank Deposit Entry', icon: Landmark, path: '/admin/accounts/bank-deposit' },
      { label: 'Bank Withdrawl Entry', icon: Banknote, path: '/admin/accounts/bank-withdrawl' },
      { label: 'Journal Report', icon: FileText, path: '/admin/accounts/journal-report' },
      { label: 'Ledger Report', icon: FileText, path: '/admin/accounts/ledger-report' },
    ]
  },
  {
    id: 'employee', label: 'Workforce', icon: Users,
    children: [
      { label: 'Employees List', icon: Users, path: '/admin/employees' },
      { label: 'New Employee', icon: UserPlus, path: '/admin/employees/create' },
      { label: 'New HR', icon: ShieldCheck, path: '/admin/hr/create' },
      { label: 'Attendance Management', icon: UserCheck, path: '/admin/attendance' },
      { label: 'Salary Management', icon: Calculator, path: '/admin/salary' },
      { label: 'Roles & Permissions', icon: Lock, path: '/admin/roles' },
      { label: 'Employee Downline', icon: Network, path: '/admin/employees/downline' },
      { label: 'Employee Block/Unblock', icon: Lock, path: '/admin/employees/block' },
      { label: 'Employee ICard Print', icon: IdCard, path: '/admin/employees/icard' },
      { label: 'Employee Promotion/Demotion', icon: Award, path: '/admin/employees/promotion' },
    ]
  },
  {
    id: 'reports', label: 'Reports', icon: ClipboardList,
    children: [
      { label: 'Loan Account Ledger', icon: FileText, path: '/admin/reports/loan-account-ledger' },
      { label: 'Loan Account Ledger Non EMI', icon: FileText, path: '/admin/reports/loan-account-ledger-non-emi' },
      { label: 'Loan Requisition Report', icon: FileText, path: '/admin/reports/loan-requisition-report' },
      { label: 'Loan Approve Report', icon: FileText, path: '/admin/reports/loan-approve-report' },
      { label: 'Loan Disbursement Report', icon: FileText, path: '/admin/reports/loan-disbursement-report' },
      { label: 'Loan Due Report', icon: FileText, path: '/admin/reports/loan-due-report' },
      { label: 'Loan Over Due Report', icon: FileText, path: '/admin/reports/loan-over-due-report' },
      { label: 'Loan Outstanding Report', icon: FileText, path: '/admin/reports/loan-outstanding-report' },
      { label: 'Loan Emi Collection Report', icon: FileText, path: '/admin/reports/loan-emi-collection-report' },
    ]
  },
  {
    id: 'approval', label: 'Approval', icon: Wallet,
    children: [
      { label: 'Pending Approvals', icon: FileText, path: '/admin/approval/pending' },
    ]
  },
  {
    id: 'repledge', label: 'Repledge Section', icon: LayoutGrid,
    children: [
      { label: 'Repledge Entry', icon: FileText, path: '/admin/repledge/entry' },
    ]
  },
];

export const EMPLOYEE_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/employee-dashboard' },
  {
    id: 'info', label: 'Info', icon: Database,
    children: [
      { label: 'Schemes', icon: BookOpen, path: '/schemes' },
      { label: 'Auditor Report', icon: FileText, path: '/auditor-report' },
      { label: 'Update Incentive', icon: TrendingUp, path: '/update-incentive' },
      { label: 'Weight Machine', icon: Sliders, path: '/weight-machine' },
      { label: 'License', icon: IdCard, path: '/license' },
      { label: 'Advance Details', icon: Wallet, path: '/advance-details' }
    ]
  },
  {
    id: 'customer', label: 'Customer', icon: Users,
    children: [
      { label: 'New Customer', icon: UserPlus, path: '/new-customer' },
      { label: 'Edit/Delete Customer', icon: FileEdit, path: '/edit-delete-customer' },
      { label: 'Customer Approval Pending', icon: ClipboardList, path: '/customer-approval-pending' },
      { label: 'Correction Requests', icon: ClipboardList, path: '/correction-requests' },
      { label: 'Aadhar Verification', icon: ShieldCheck, path: '/aadhar-verification' },
      { label: 'Customer Ledger', icon: BookOpen, path: '/customer-ledger' }
    ]
  },
  {
    id: 'loan', label: 'Loan', icon: Wallet,
    children: [
      { label: 'Provide Loan', icon: Wallet, path: '/provide-loan' },
      { label: 'Edit Loan', icon: FileEdit, path: '/edit-loan' },
      { label: 'Customer History', icon: History, path: '/customer-history' },
      { label: 'Loan Closure', icon: X, path: '/loan-closure' },
      { label: 'Repledging & Change Status', icon: ArrowRightLeft, path: '/repledging-change-status' },
      { label: 'Top up Loan', icon: TrendingUp, path: '/top-up-loan' }
    ]
  },
  {
    id: 'payment', label: 'Payment', icon: CreditCard,
    children: [
      { label: 'Receive Payment', icon: Download, path: '/receive-payment' },
      { label: 'Payment History', icon: History, path: '/payment-history' }
    ]
  },
  {
    id: 'report', label: 'Report', icon: ClipboardList,
    children: [
      { label: 'Daily Summary Report', icon: FileText, path: '/daily-summary-report' },
      { label: 'Today Collection Report', icon: FileText, path: '/today-collection-report' },
      { label: 'Loan Report', icon: FileText, path: '/loan-report' },
      { label: 'Loan Outstanding Report', icon: FileText, path: '/loan-outstanding-report' },
      { label: 'Interest Pending Report', icon: FileText, path: '/interest-pending-report' },
      { label: 'Datewise Pending List', icon: FileText, path: '/datewise-pending-list' },
      { label: 'Closed Account Report', icon: FileText, path: '/closed-account-report' },
      { label: 'Repledge Report', icon: FileText, path: '/repledge-report' },
      { label: 'Auction Account', icon: FileText, path: '/auction-account' },
      { label: 'Account Summary Report', icon: FileText, path: '/account-summary-report' },
      { label: 'Cash Assets Report', icon: FileText, path: '/cash-assets-report' },
      { label: 'Business Report', icon: FileText, path: '/business-report' }
    ]
  },
  {
    id: 'expenses', label: 'Expenses', icon: TrendingDown,
    children: [
      { label: 'Add Expense', icon: Plus, path: '/add-expense' },
      { label: 'Edit Expense', icon: FileEdit, path: '/edit-expense' },
      { label: 'Expense Report', icon: FileText, path: '/expense-report' }
    ]
  },
  {
    id: 'income', label: 'Income', icon: TrendingUp,
    children: [
      { label: 'Add Income', icon: Plus, path: '/add-income' },
      { label: 'Edit Income', icon: FileEdit, path: '/edit-income' },
      { label: 'Income Report', icon: FileText, path: '/income-report' },
      { label: 'Add Denomination', icon: Calculator, path: '/add-denomination' }
    ]
  },
  {
    id: 'customer_call', label: 'Customer Call', icon: PhoneCall,
    children: [
      { label: 'Followups', icon: PhoneCall, path: '/followups' },
      { label: 'Call Report', icon: PhoneForwarded, path: '/call-report' }
    ]
  },
  {
    id: 'remittance', label: 'Remittance', icon: Send,
    children: [
      { label: 'New Remittance', icon: Send, path: '/new-remittance' },
      { label: 'Remittance History', icon: History, path: '/remittance-history' }
    ]
  },
  {
    id: 'gold_stock', label: 'Gold Stock', icon: Coins,
    children: [
      { label: 'Send Request', icon: Send, path: '/send-request' },
      { label: 'Gold Stock Report', icon: Box, path: '/gold-stock-report' }
    ]
  }
];

export const HR_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/hr-dashboard' },
  {
    id: 'employee_mgmt', label: 'Employee Management', icon: Users,
    children: [
      { label: 'Employee List', icon: Users, path: '/hr/employees' },
      { label: 'Create Employee', icon: UserPlus, path: '/hr/employees/create' },
    ]
  },
  {
    id: 'attendance', label: 'Attendance', icon: CalendarDays,
    children: [
      { label: 'Mark Attendance', icon: ClipboardCheck, path: '/hr/attendance' },
    ]
  },
  {
    id: 'leave', label: 'Leave', icon: CalendarDays,
    children: [
      { label: 'Leave Management', icon: FileText, path: '/hr/leave' },
    ]
  },
  {
    id: 'salary', label: 'Salary', icon: Calculator,
    children: [
      { label: 'Salary Management', icon: Calculator, path: '/hr/salary' },
    ]
  },
  {
    id: 'reports', label: 'Reports', icon: ClipboardList,
    children: [
      { label: 'HR Reports', icon: FileText, path: '/hr/reports' },
    ]
  },
  { id: 'profile', label: 'My Profile', icon: UserCog, path: '/hr/profile' },
];
