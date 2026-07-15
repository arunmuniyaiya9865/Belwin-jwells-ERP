import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, ChevronDown, ChevronRight, UserPlus,
  Settings, X, Gem, Database, Sliders, User, Network, Lock, IdCard, Award,
  Calculator, FileText, Car, Store, Boxes, Diamond, TrendingUp, TrendingDown, Key, UserCheck,
  Upload, CheckCircle, ShieldCheck, FileSearch, ShieldBan, Plus,
  Briefcase, BookOpen, CreditCard, Download, FileEdit, ArrowRightLeft, Landmark, Banknote, ClipboardList,
  Wallet, LayoutGrid, Coins, Box, PhoneCall, PhoneForwarded, Send, History,
  CalendarDays, UserCog, ClipboardCheck
} from 'lucide-react';

const ADMIN_NAV = [
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
      { label: 'Customer List', icon: Users, path: '/admin/borrower/customer-list' },
      { label: 'Customer Approval', icon: CheckCircle, path: '/admin/borrower/customer-approval' },
      { label: 'New Borrower', icon: UserPlus, path: '/admin/borrower/new' },
      { label: 'KYC Upload', icon: Upload, path: '/admin/borrower/kyc-upload' },
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

const EMPLOYEE_NAV = [
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
      { label: 'Aadhar Verification', icon: ShieldCheck, path: '/aadhar-verification' },
      { label: 'Customer Ledger', icon: BookOpen, path: '/customer-ledger' }
    ]
  },
  {
    id: 'loan', label: 'Loan', icon: Users, // Using Users as a fallback for Handshake or similar
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

const HR_NAV = [
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

const Sidebar = ({ collapsed, setCollapsed, isMobile, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const role = user.role || 'employee';
  const isRoutingAdmin = role === 'admin' || role === 'Super Admin';

  const NAV = isRoutingAdmin ? ADMIN_NAV : EMPLOYEE_NAV;

  const isActive = (path) => location.pathname === path;
  const isParentActive = (item) =>
    item.children?.some((c) => location.pathname === c.path);

  const toggleMenu = (id) => setOpenMenus((p) => ({ ...p, [id]: !p[id] }));

  const navTo = (path) => {
    navigate(path);
    if (isMobile && onClose) onClose();
  };

  return (
    <aside className={`flex flex-col bg-white border-r border-gray-200 h-full relative transition-all duration-200 flex-shrink-0 z-40 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
      
      {/* Collapse Toggle Button */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 hover:border-green-200 transition-colors z-50 shadow-sm cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <X size={14} />}
        </button>
      )}

      {/* Brand */}
      <div className={`flex items-center gap-3 h-[72px] border-b border-gray-100 ${collapsed ? 'justify-center px-4' : 'px-6'}`}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base flex-shrink-0"
             style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}>
          <Gem size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="text-lg font-bold text-[#14532d] truncate">Belwin Jewels</span>
            <span className="text-xs font-semibold tracking-wide text-green-600 uppercase truncate">Enterprise ERP</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-none px-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.path ? isActive(item.path) : isParentActive(item);
          const isOpen = openMenus[item.id] || isParentActive(item);

          if (item.children) {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => {
                    if (collapsed) {
                      setCollapsed(false);
                      setOpenMenus((p) => ({ ...p, [item.id]: true }));
                    } else {
                      toggleMenu(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer text-left ${
                    active
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                  }`}
                >
                  <Icon size={20} className={active ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-700'} strokeWidth={active ? 2.5 : 2} />
                  {!collapsed && (
                    <>
                      <span className="text-sm flex-1">
                        {item.label}
                      </span>
                      {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                    </>
                  )}
                </button>

                {!collapsed && isOpen && (
                  <div className="pl-4 pr-2 space-y-1 mt-1">
                    {item.children.map((child) => {
                      const CIcon = child.icon;
                      const childActive = isActive(child.path);
                      return (
                        <button
                          key={child.path}
                          onClick={() => navTo(child.path)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer text-left ${
                            childActive
                              ? 'text-green-600 bg-green-50/50 font-semibold'
                              : 'text-gray-500 hover:text-green-600 hover:bg-green-50/30'
                          }`}
                        >
                          <CIcon size={16} className={childActive ? 'text-green-600' : 'text-gray-400'} strokeWidth={childActive ? 2.5 : 2} />
                          <span className="text-xs">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navTo(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer text-left ${
                active
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
              }`}
            >
              <Icon size={20} className={active ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-700'} strokeWidth={active ? 2.5 : 2} />
              {!collapsed && (
                <span className="text-sm">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-gray-100 text-[10px] text-gray-400 tracking-wide ${collapsed ? 'text-center' : 'text-left'}`}>
        {collapsed ? 'v2.0' : 'Belwin ERP v2.0 · © 2026'}
      </div>
    </aside>
  );
};

export default Sidebar;
