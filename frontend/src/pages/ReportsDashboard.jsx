import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Download, Search, Filter, IndianRupee, Users, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getAllLoans } from '../utils/loanStore';
import { getAllPayments } from '../utils/paymentStore';

// Helper to determine the active report from URL
const REPORTS = [
  { id: 'daily-summary-report', name: 'Daily Summary Report', icon: BarChart3 },
  { id: 'today-collection-report', name: 'Today Collection', icon: IndianRupee },
  { id: 'loan-report', name: 'Loan Report', icon: FileText },
  { id: 'loan-outstanding-report', name: 'Loan Outstanding Report', icon: IndianRupee },
  { id: 'interest-pending-report', name: 'Interest Pending', icon: IndianRupee },
  { id: 'datewise-pending-list', name: 'Datewise', icon: Filter },
  { id: 'closed-account-report', name: 'Closed Account', icon: FileText },
  { id: 'repledge-report', name: 'Repledge', icon: FileText },
  { id: 'auction-account', name: 'Auction', icon: BarChart3 },
  { id: 'accounts-summary-report', name: 'Accounts Summary', icon: Users },
  { id: 'cash-assets-report', name: 'Cash Assets', icon: IndianRupee },
  { id: 'business-report', name: 'Business', icon: BarChart3 },
];

const ReportsDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.replace('/', '');
  const activeReport = REPORTS.find(r => r.id === currentPath) || REPORTS[0];

  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoans(getAllLoans());
    setPayments(getAllPayments());
  }, []);

  // Format currency
  const formatCurrency = (amt) => `₹${parseFloat(amt || 0).toLocaleString('en-IN')}`;

  // Generate Report Configuration based on active report
  const getReportData = () => {
    const data = { cards: [], columns: [], rows: [] };
    const today = new Date().toISOString().split('T')[0];

    switch (activeReport.id) {
      case 'daily-summary-report':
        const todayLoans = loans.filter(l => l.loanDate === today);
        const todayPayments = payments.filter(p => p.paymentDate === today);
        const totalLoanAmount = todayLoans.reduce((sum, l) => sum + parseFloat(l.loanAmount || 0), 0);
        const totalCollected = todayPayments.reduce((sum, p) => sum + parseFloat(p.amountReceived || 0), 0);
        const totalInterest = todayPayments.reduce((sum, p) => sum + parseFloat(p.interestAmount || 0), 0);
        
        data.cards = [
          { label: 'Today Loans Issued', value: todayLoans.length, subValue: formatCurrency(totalLoanAmount) },
          { label: 'Today Collections', value: formatCurrency(totalCollected), subValue: `${todayPayments.length} transactions` },
          { label: 'Today Interest Collection', value: formatCurrency(totalInterest) },
          { label: 'Today Closed Accounts', value: '0' },
          { label: "Today's Cash Balance", value: formatCurrency(totalCollected - totalLoanAmount), highlight: true }
        ];
        data.columns = ['BRANCH', 'LOANS ISSUED', 'COLLECTION', 'INTEREST', 'CASH BALANCE'];
        data.rows = [['Main Branch', todayLoans.length, formatCurrency(totalCollected), formatCurrency(totalInterest), formatCurrency(totalCollected - totalLoanAmount)]];
        break;

      case 'today-collection-report':
        const collections = payments.filter(p => p.paymentDate === today);
        data.columns = ['CUSTOMER NAME', 'LOAN NUMBER', 'COLLECTION AMOUNT', 'INTEREST AMOUNT', 'PAYMENT MODE', 'COLLECTED BY'];
        data.rows = collections.map(p => [p.customerName, p.loanNumber, formatCurrency(p.amountReceived), formatCurrency(p.interestAmount), p.paymentMode, p.collectedBy || 'Admin']);
        break;

      case 'loan-report':
        const activeLoans = loans.filter(l => l.status === 'Active' || l.status === 'Approved');
        data.cards = [
          { label: 'Active Loans', value: activeLoans.length },
          { label: 'New Loans (This Month)', value: loans.length },
          { label: 'Loan Amount Summary', value: formatCurrency(loans.reduce((sum, l) => sum + parseFloat(l.loanAmount || 0), 0)) },
          { label: 'Gold Weight Summary', value: `${loans.reduce((sum, l) => sum + parseFloat(l.grossWeight || 0), 0)}g` }
        ];
        data.columns = ['CUSTOMER NAME', 'LOAN NO', 'AMOUNT', 'GOLD WEIGHT', 'STATUS', 'BRANCH'];
        data.rows = loans.map(l => [l.customerName, l.loanNumber, formatCurrency(l.loanAmount), `${l.grossWeight}g`, l.status || 'Active', 'Main']);
        break;

      case 'loan-outstanding-report':
        data.columns = ['CUSTOMER NAME', 'LOAN NUMBER', 'OUTSTANDING AMOUNT', 'INTEREST DUE', 'DUE DATE', 'OVERDUE DAYS'];
        data.rows = loans.map(l => [l.customerName, l.loanNumber, formatCurrency(l.loanAmount), formatCurrency((parseFloat(l.loanAmount || 0) * (parseFloat(l.interestRate || 0)/100))), l.dueDate || 'N/A', l.status === 'Overdue' ? '15 Days' : '0']);
        break;

      case 'interest-pending-report':
        data.columns = ['CUSTOMER NAME', 'LOAN NUMBER', 'PENDING INTEREST', 'LAST PAYMENT DATE', 'DUE DATE'];
        data.rows = loans.map(l => [l.customerName, l.loanNumber, formatCurrency((parseFloat(l.loanAmount || 0) * 0.02)), 'N/A', l.dueDate || 'N/A']);
        break;

      case 'datewise-pending-list':
        data.cards = [
          { label: 'Pending Customers', value: loans.length },
          { label: 'Pending Amount', value: formatCurrency(loans.reduce((sum, l) => sum + parseFloat(l.loanAmount || 0), 0)) },
          { label: 'Pending Interest', value: formatCurrency(loans.reduce((sum, l) => sum + (parseFloat(l.loanAmount || 0)*0.02), 0)) },
          { label: 'Overdue Accounts', value: loans.filter(l => l.status === 'Overdue').length }
        ];
        data.columns = ['CUSTOMER NAME', 'LOAN NUMBER', 'PENDING AMOUNT', 'PENDING INTEREST', 'OVERDUE DAYS'];
        data.rows = loans.map(l => [l.customerName, l.loanNumber, formatCurrency(l.loanAmount), formatCurrency((parseFloat(l.loanAmount || 0) * 0.02)), l.status === 'Overdue' ? '15' : '0']);
        break;

      case 'closed-account-report':
        const closed = loans.filter(l => l.status === 'Closed');
        data.columns = ['CLOSED LOAN NUMBER', 'CUSTOMER NAME', 'CLOSURE DATE', 'SETTLEMENT AMOUNT', 'RELEASED GOLD DETAILS'];
        data.rows = closed.map(l => [l.loanNumber, l.customerName, today, formatCurrency(l.loanAmount), `${l.grossWeight}g (${l.ornamentType})`]);
        break;

      case 'repledge-report':
        const repledged = loans.filter(l => l.status === 'Repledged');
        data.columns = ['REPLEDGED LOAN NUMBER', 'PREVIOUS LOAN AMOUNT', 'NEW LOAN AMOUNT', 'REPLEDGE DATE', 'INTEREST RATE'];
        data.rows = repledged.map(l => [l.loanNumber, formatCurrency(l.loanAmount), formatCurrency(parseFloat(l.loanAmount)*1.1), today, `${l.interestRate}%`]);
        break;

      case 'auction-account':
        const auctions = loans.filter(l => l.status === 'Auction Ready' || l.status === 'Auctioned');
        data.columns = ['AUCTION ELIGIBLE ACCOUNTS', 'AUCTION DATE', 'OUTSTANDING AMOUNT', 'GOLD WEIGHT', 'AUCTION STATUS'];
        data.rows = auctions.map(l => [l.customerName, today, formatCurrency(l.loanAmount), `${l.grossWeight}g`, l.status]);
        break;

      case 'accounts-summary-report':
        data.cards = [
          { label: 'Total Active Accounts', value: loans.filter(l => l.status !== 'Closed').length },
          { label: 'Total Closed Accounts', value: loans.filter(l => l.status === 'Closed').length },
          { label: 'Total Repledged Accounts', value: loans.filter(l => l.status === 'Repledged').length },
          { label: 'Total Auction Accounts', value: loans.filter(l => l.status === 'Auction Ready').length }
        ];
        data.columns = ['STATUS', 'TOTAL ACCOUNTS', 'TOTAL OUTSTANDING AMOUNT', 'TOTAL GOLD WEIGHT'];
        const statuses = ['Active', 'Closed', 'Repledged', 'Auction Ready', 'Overdue'];
        data.rows = statuses.map(s => {
          const matching = loans.filter(l => l.status === s || (s === 'Active' && (!l.status || l.status === 'Approved')));
          const amt = matching.reduce((sum, l) => sum + parseFloat(l.loanAmount || 0), 0);
          const wt = matching.reduce((sum, l) => sum + parseFloat(l.grossWeight || 0), 0);
          return [s, matching.length, formatCurrency(amt), `${wt}g`];
        });
        break;

      case 'cash-assets-report':
        const totalOut = loans.reduce((sum, l) => sum + parseFloat(l.loanAmount || 0), 0);
        const totalIn = payments.reduce((sum, p) => sum + parseFloat(p.amountReceived || 0), 0);
        data.cards = [
          { label: 'Opening Cash', value: '₹5,00,000' },
          { label: 'Loan Disbursement', value: formatCurrency(totalOut) },
          { label: 'Collections Received', value: formatCurrency(totalIn) },
          { label: 'Expenses', value: '₹0' },
          { label: 'Closing Cash Balance', value: formatCurrency(500000 - totalOut + totalIn), highlight: true }
        ];
        data.columns = ['DATE', 'TRANSACTION TYPE', 'INFLOW', 'OUTFLOW', 'BALANCE'];
        data.rows = [
          [today, 'Opening Balance', '₹5,00,000', '-', '₹5,00,000'],
          [today, 'Loan Disbursements', '-', formatCurrency(totalOut), formatCurrency(500000 - totalOut)],
          [today, 'Collections', formatCurrency(totalIn), '-', formatCurrency(500000 - totalOut + totalIn)],
        ];
        break;

      case 'business-report':
        const uniqueCustomers = new Set(loans.map(l => l.customerId)).size;
        const totalLns = loans.length;
        const loanValue = loans.reduce((sum, l) => sum + parseFloat(l.loanAmount || 0), 0);
        const intEarned = payments.reduce((sum, p) => sum + parseFloat(p.interestAmount || 0), 0);
        data.cards = [
          { label: 'Total Customers', value: uniqueCustomers },
          { label: 'Total Loans', value: totalLns },
          { label: 'Total Loan Value', value: formatCurrency(loanValue) },
          { label: 'Total Interest Earned', value: formatCurrency(intEarned) }
        ];
        data.columns = ['MONTH', 'NEW CUSTOMERS', 'LOANS DISBURSED', 'INTEREST COLLECTED', 'PROFIT & LOSS'];
        data.rows = [
          ['June 2026', uniqueCustomers, formatCurrency(loanValue), formatCurrency(intEarned), formatCurrency(intEarned)]
        ];
        break;

      default:
        break;
    }

    return data;
  };

  const reportData = getReportData();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{activeReport.name}</h2>
          <p className="text-sm text-text-secondary mt-1">View detailed metrics and generate exports for {activeReport.name.toLowerCase()}.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-bold text-red-700 hover:bg-red-100 shadow-sm transition-all">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-6">
        
        {/* Sidebar Navigation */}
        <div className="w-64 shrink-0 flex flex-col gap-2 overflow-y-auto pr-2 pb-4 scrollbar-hide">
          {REPORTS.map(r => (
            <button
              key={r.id}
              onClick={() => navigate(`/${r.id}`)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeReport.id === r.id ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
            >
              <r.icon className={`w-4 h-4 ${activeReport.id === r.id ? 'text-white' : 'text-gray-400'}`} />
              {r.name}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-4 gap-6 pr-2">
          
          {/* Summary Cards */}
          {reportData.cards.length > 0 && (
            <div className={`grid gap-4 ${reportData.cards.length > 4 ? 'grid-cols-5' : 'grid-cols-' + reportData.cards.length}`}>
              {reportData.cards.map((c, i) => (
                <div key={i} className={`p-4 rounded-xl shadow-sm border flex flex-col justify-center ${c.highlight ? 'bg-gradient-to-br from-green-600 to-green-800 border-green-700 text-white' : 'bg-white border-gray-200'}`}>
                  <span className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${c.highlight ? 'text-green-100' : 'text-gray-500'}`}>{c.label}</span>
                  <div className={`text-xl font-bold ${c.highlight ? 'text-white' : 'text-gray-900'}`}>{c.value}</div>
                  {c.subValue && <span className={`text-xs mt-1 font-medium ${c.highlight ? 'text-green-200' : 'text-gray-400'}`}>{c.subValue}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Table Area */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col flex-1 min-h-[400px]">
            {/* Table Tools */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50 rounded-t-xl">
              <div className="relative w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search within report..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white" />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 shadow-sm">
                <Filter className="w-4 h-4" /> Advanced Filter
              </button>
            </div>

            {/* Actual Table */}
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-gray-100/50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    {reportData.columns.map((col, i) => (
                      <th key={i} className="px-6 py-3 text-[11px] font-bold text-gray-500 tracking-wider uppercase border-b border-gray-200">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={reportData.columns.length} className="px-6 py-12 text-center text-sm text-gray-400 bg-gray-50/30">
                        No data available for this report.
                      </td>
                    </tr>
                  ) : (
                    reportData.rows.filter(row => row.some(cell => String(cell).toLowerCase().includes(searchQuery.toLowerCase()))).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                        {row.map((cell, j) => (
                          <td key={j} className="px-6 py-4 text-sm font-medium text-gray-700">{cell}</td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 flex justify-between items-center rounded-b-xl">
              <span>Showing {reportData.rows.length} records</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100" disabled>Previous</button>
                <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100" disabled>Next</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
