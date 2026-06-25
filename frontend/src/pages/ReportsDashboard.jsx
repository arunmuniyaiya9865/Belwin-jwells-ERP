import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Calendar, DollarSign, Activity, Users, Archive, RefreshCw, AlertCircle, Briefcase, IndianRupee, Search, SlidersHorizontal } from 'lucide-react';

const REPORTS = [
  { id: 'daily-summary-report', name: 'Daily Summary', icon: Calendar },
  { id: 'today-collection-report', name: 'Today Collection', icon: DollarSign },
  { id: 'loan-report', name: 'Loan Report', icon: FileText },
  { id: 'loan-outstanding-report', name: 'Loan Outstanding', icon: Activity },
  { id: 'interest-pending-report', name: 'Interest Pending', icon: AlertCircle },
  { id: 'datewise-pending-list', name: 'Datewise Pending List', icon: Calendar },
  { id: 'closed-account-report', name: 'Closed Account Report', icon: Archive },
  { id: 'repledge-report', name: 'Repledge Report', icon: RefreshCw },
  { id: 'auction-account', name: 'Auction Account Report', icon: Users },
  { id: 'account-summary-report', name: 'Accounts Summary Report', icon: Briefcase },
  { id: 'cash-assets-report', name: 'Cash Assets', icon: IndianRupee },
  { id: 'business-report', name: 'Business Report', icon: Activity },
];

const ReportsDashboard = () => {
  const [activeReport, setActiveReport] = useState(REPORTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for API data
  const [reportData, setReportData] = useState({ cards: [], columns: [], rows: [] });

  // Filter States
  const [filters, setFilters] = useState({
    fromDate: '', toDate: '', customerId: '', status: '', date: ''
  });

  const formatCurrency = (amt) => `₹${parseFloat(amt || 0).toLocaleString('en-IN')}`;

  const fetchReport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.customerId) params.append('customerId', filters.customerId);
      if (filters.status) params.append('status', filters.status);
      if (filters.date) params.append('date', filters.date);

      let endpoint = '';
      switch (activeReport.id) {
        case 'daily-summary-report': endpoint = '/api/reports/daily-summary'; break;
        case 'today-collection-report': endpoint = '/api/reports/today-collection'; break;
        case 'loan-report': endpoint = '/api/reports/loan-report'; break;
        case 'loan-outstanding-report': endpoint = '/api/reports/loan-outstanding'; break;
        case 'interest-pending-report': endpoint = '/api/reports/interest-pending'; break;
        case 'datewise-pending-list': endpoint = '/api/reports/datewise-pending'; break;
        case 'closed-account-report': endpoint = '/api/reports/closed-accounts'; break;
        case 'repledge-report': endpoint = '/api/reports/repledge-report'; break;
        case 'auction-account': endpoint = '/api/reports/auction-accounts'; break;
        case 'account-summary-report': endpoint = '/api/reports/account-summary'; break;
        case 'cash-assets-report': endpoint = '/api/reports/cash-assets'; break;
        case 'business-report': endpoint = '/api/reports/business-report'; break;
        default: return; // Not implemented yet
      }

      if (!endpoint) return;

      const res = await axios.get(`http://127.0.0.1:5000${endpoint}?${params.toString()}`);
      processData(activeReport.id, res.data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
      setReportData({ cards: [], columns: [], rows: [] });
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line
  }, [activeReport, filters]);

  const processData = (id, data) => {
    const result = { cards: [], columns: [], rows: [] };
    
    switch (id) {
      case 'daily-summary-report':
        result.cards = [
          { label: 'Total Loans Given', value: formatCurrency(data.totalLoansAmount) },
          { label: 'Total TopUps', value: formatCurrency(data.totalTopUpAmount) },
          { label: 'Total Repledges', value: formatCurrency(data.totalRepledgeAmount) },
          { label: 'Total Principal Collected', value: formatCurrency(data.totalPrincipalCollected) },
          { label: 'Total Interest Collected', value: formatCurrency(data.totalInterestCollected) }
        ];
        break;

      case 'today-collection-report':
        result.cards = [
          { label: 'Total Collections Today', value: formatCurrency(data.totalCollectionsToday), highlight: true },
          { label: 'Principal Collection', value: formatCurrency(data.principalCollectionToday) },
          { label: 'Interest Collection', value: formatCurrency(data.interestCollectionToday) },
          { label: 'Total Transactions', value: data.totalTransactionsToday }
        ];
        result.columns = ['PAYMENT ID', 'DATE', 'LOAN ID', 'CUSTOMER NAME', 'TYPE', 'AMOUNT', 'PRINCIPAL', 'INTEREST'];
        result.rows = data.payments.map(p => [
          p.paymentId, new Date(p.paymentDate).toLocaleDateString(), p.loanId, p.customerName || 'N/A',
          p.paymentType, formatCurrency(p.amountReceived), formatCurrency(p.principalAmount), formatCurrency(p.interestAmount)
        ]);
        break;

      case 'loan-report':
        result.cards = [
          { label: 'Total Loans', value: data.length },
          { label: 'Total Loan Amount', value: formatCurrency(data.reduce((s, d) => s + d.loanAmount, 0)) },
          { label: 'Active Loans', value: data.filter(d => ['Active', 'Overdue', 'TopUp', 'Repledged'].includes(d.status)).length },
          { label: 'Closed Loans', value: data.filter(d => d.status === 'Closed').length }
        ];
        result.columns = ['LOAN ID', 'CUSTOMER ID', 'NAME', 'DATE', 'AMOUNT', 'REMAINING', 'STATUS', 'CREATED'];
        result.rows = data.map(d => [
          d.loanId, d.customerId, d.customerName || 'N/A', new Date(d.loanDate).toLocaleDateString(),
          formatCurrency(d.loanAmount), formatCurrency(d.remainingLoanAmount), d.status, new Date(d.createdDate).toLocaleDateString()
        ]);
        break;

      case 'loan-outstanding-report':
        result.cards = [
          { label: 'Outstanding Loans', value: data.length },
          { label: 'Outstanding Amount', value: formatCurrency(data.reduce((s, d) => s + d.remainingLoanAmount, 0)) },
          { label: 'Active Loans', value: data.filter(d => ['Active', 'TopUp', 'Repledged'].includes(d.status)).length },
          { label: 'Overdue Loans', value: data.filter(d => d.status === 'Overdue').length }
        ];
        result.columns = ['LOAN ID', 'CUSTOMER ID', 'NAME', 'DATE', 'AMOUNT', 'REMAINING', 'STATUS', 'INTEREST', 'DAYS'];
        result.rows = data.map(d => [
          d.loanId, d.customerId, d.customerName || 'N/A', new Date(d.loanDate).toLocaleDateString(),
          formatCurrency(d.loanAmount), formatCurrency(d.remainingLoanAmount), d.status, `${d.interestRate}%`, d.remainingDays || 'N/A'
        ]);
        break;

      case 'interest-pending-report':
        result.cards = [
          { label: 'Loans With Pending Int', value: data.length },
          { label: 'Pending Interest Amt', value: formatCurrency(data.reduce((s, d) => s + d.remainingInterestAmount, 0)) },
          { label: 'Active Loans', value: data.filter(d => d.status !== 'Overdue').length },
          { label: 'Overdue Loans', value: data.filter(d => d.status === 'Overdue').length }
        ];
        result.columns = ['LOAN ID', 'CUSTOMER ID', 'NAME', 'DATE', 'AMOUNT', 'RATE', 'PAID INT', 'PENDING INT', 'STATUS'];
        result.rows = data.map(d => [
          d.loanId, d.customerId, d.customerName || 'N/A', new Date(d.loanDate).toLocaleDateString(),
          formatCurrency(d.loanAmount), `${d.interestRate}%`, formatCurrency(d.totalPaidInterestAmount),
          formatCurrency(d.remainingInterestAmount), d.status
        ]);
        break;

      case 'datewise-pending-list':
        result.cards = [
          { label: 'Pending Accounts', value: data.length },
          { label: 'Pending Principal', value: formatCurrency(data.reduce((s, d) => s + d.remainingLoanAmount, 0)) },
          { label: 'Pending Interest', value: formatCurrency(data.reduce((s, d) => s + d.remainingInterestAmount, 0)) },
          { label: 'Overdue Accounts', value: data.filter(d => d.status === 'Overdue').length }
        ];
        result.columns = ['LOAN ID', 'CUSTOMER ID', 'NAME', 'DATE', 'AMOUNT', 'PENDING PRINCIPAL', 'PENDING INTEREST', 'STATUS', 'PENDING DAYS'];
        result.rows = data.map(d => [
          d.loanId, d.customerId, d.customerName || 'N/A', new Date(d.loanDate).toLocaleDateString(),
          formatCurrency(d.loanAmount), formatCurrency(d.remainingLoanAmount), formatCurrency(d.remainingInterestAmount),
          d.status, `${d.pendingDays} Days`
        ]);
        break;

      case 'closed-account-report':
        result.cards = [
          { label: 'Closed Accounts', value: data.length },
          { label: 'Closed Amount', value: formatCurrency(data.reduce((s, d) => s + d.loanAmount, 0)) },
          { label: 'Settlement Amount', value: formatCurrency(data.reduce((s, d) => s + d.totalPaidAmount, 0)) },
          { label: 'Closed This Month', value: data.filter(d => new Date(d.closedDate).getMonth() === new Date().getMonth()).length }
        ];
        result.columns = ['LOAN ID', 'CUSTOMER ID', 'NAME', 'DATE', 'AMOUNT', 'SETTLEMENT', 'CLOSED DATE', 'STATUS'];
        result.rows = data.map(d => [
          d.loanId, d.customerId, d.customerName || 'N/A', new Date(d.loanDate).toLocaleDateString(),
          formatCurrency(d.loanAmount), formatCurrency(d.totalPaidAmount), new Date(d.closedDate).toLocaleDateString(), d.status
        ]);
        break;

      case 'repledge-report':
        result.cards = [
          { label: 'Total Repledges', value: data.length },
          { label: 'Repledged Amount', value: formatCurrency(data.reduce((s, d) => s + d.newLoanAmount, 0)) },
          { label: 'Repledges This Month', value: data.filter(d => new Date(d.repledgeDate).getMonth() === new Date().getMonth()).length },
          { label: 'Avg Repledge', value: formatCurrency(data.length ? data.reduce((s, d) => s + d.newLoanAmount, 0) / data.length : 0) }
        ];
        result.columns = ['REPLEDGE ID', 'LOAN ID', 'CUSTOMER', 'PREV STATUS', 'NEW STATUS', 'PREV AMT', 'NEW AMT', 'DATE'];
        result.rows = data.map(d => [
          d.repledgeId, d.loanId, d.customerName || d.customerId, d.previousStatus, d.newStatus,
          formatCurrency(d.previousLoanAmount), formatCurrency(d.newLoanAmount), new Date(d.repledgeDate).toLocaleDateString()
        ]);
        break;

      case 'auction-account':
        result.cards = [
          { label: 'Total Auction Accounts', value: data.length },
          { label: 'Auction Ready Accounts', value: data.filter(d => d.status === 'Auction Ready').length },
          { label: 'Auctioned Accounts', value: data.filter(d => d.status === 'Auctioned').length },
          { label: 'Total Auction Exposure', value: formatCurrency(data.reduce((s, d) => s + d.remainingLoanAmount, 0)), highlight: true }
        ];
        result.columns = ['LOAN ID', 'CUSTOMER ID', 'CUSTOMER NAME', 'LOAN DATE', 'LOAN AMOUNT', 'REMAINING AMOUNT', 'STATUS', 'PENDING DAYS'];
        result.rows = data.map(d => [
          d.loanId, d.customerId, d.customerName || 'N/A', new Date(d.loanDate).toLocaleDateString(),
          formatCurrency(d.loanAmount), formatCurrency(d.remainingLoanAmount), d.status, `${d.pendingDays} Days`
        ]);
        break;

      case 'account-summary-report':
        result.cards = [
          { label: 'Total Customers', value: data.totalCustomers },
          { label: 'Total Loans', value: data.totalLoans },
          { label: 'Outstanding Amount', value: formatCurrency(data.totalOutstandingAmount), highlight: true },
          { label: 'Total Collections', value: formatCurrency(data.totalPaymentsReceived) },
          { label: 'Interest Collections', value: formatCurrency(data.totalInterestCollected) },
          { label: 'Principal Collections', value: formatCurrency(data.totalPrincipalCollected) },
          { label: 'Total TopUps', value: formatCurrency(data.totalTopUpAmount) },
          { label: 'Repledges', value: data.totalRepledgeCount },
          { label: 'Closed Loans', value: data.closedLoanCount }
        ];
        break;

      case 'cash-assets-report':
        result.cards = [
          { label: 'Total Cash Inflow', value: formatCurrency(data.totalCashInflow), highlight: true },
          { label: 'Total Cash Outflow', value: formatCurrency(data.totalCashOutflow) },
          { label: 'Net Cash Position', value: formatCurrency(data.netCashPosition) },
          { label: 'Total Transactions', value: data.totalTransactions }
        ];
        result.columns = ['DATE', 'TYPE', 'REFERENCE', 'DESCRIPTION', 'AMOUNT', 'FLOW'];
        result.rows = data.transactions.map(t => [
          new Date(t.date).toLocaleDateString(), t.transactionType, t.referenceId, t.description,
          formatCurrency(t.amount), t.flowType
        ]);
        break;

      case 'business-report':
        const { metrics } = data;
        let healthState = 'Critical';
        let healthColor = 'bg-red-50 text-red-700 border-red-200';
        if (metrics.netCashPosition > 0) {
          healthState = 'Healthy';
          healthColor = 'bg-green-50 text-green-700 border-green-200';
        } else if (metrics.netCashPosition >= -50000) {
          healthState = 'Warning';
          healthColor = 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }

        result.sections = [
          {
            title: 'Customer Summary',
            cards: [
              { label: 'Total Customers', value: metrics.totalCustomers },
              { label: 'Active Customers', value: metrics.activeCustomers }
            ]
          },
          {
            title: 'Loan Summary',
            cards: [
              { label: 'Total Loans', value: metrics.totalLoans },
              { label: 'Total Loan Amount', value: formatCurrency(metrics.totalLoanAmount) },
              { label: 'Total Outstanding Amount', value: formatCurrency(metrics.totalOutstandingAmount) },
              { label: 'Closed Loans', value: metrics.closedLoans }
            ]
          },
          {
            title: 'Collection Summary',
            cards: [
              { label: 'Total Collections', value: formatCurrency(metrics.totalCollections) },
              { label: 'Principal Collections', value: formatCurrency(metrics.totalPrincipalCollections) },
              { label: 'Interest Collections', value: formatCurrency(metrics.totalInterestCollections) },
              { label: 'Total TopUps', value: formatCurrency(metrics.totalTopUpAmount) },
              { label: 'Total Repledges', value: metrics.totalRepledges }
            ]
          },
          {
            title: 'Business Summary',
            cards: [
              { label: 'Total Income', value: formatCurrency(metrics.totalIncome) },
              { label: 'Total Expenses', value: formatCurrency(metrics.totalExpenses) },
              { label: 'Net Profit / Cash Position', value: formatCurrency(metrics.netCashPosition), highlight: true }
            ]
          }
        ];
        result.healthCard = { state: healthState, colorClass: healthColor, value: formatCurrency(metrics.netCashPosition) };
        break;

      default:
        break;
    }
    
    setReportData(result);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{activeReport.name}</h2>
          <p className="text-sm text-gray-500 mt-1">View detailed metrics and generate exports for {activeReport.name.toLowerCase()}.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-bold text-red-700 hover:bg-red-100 shadow-sm transition-all">
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-6">
        <div className="w-64 shrink-0 flex flex-col gap-2 overflow-y-auto pr-2 pb-4 scrollbar-hide">
          {REPORTS.map((report) => (
            <button
              key={report.id}
              onClick={() => { setActiveReport(report); setFilters({ fromDate: '', toDate: '', customerId: '', status: '', date: '' }); setSearchQuery(''); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeReport.id === report.id
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <report.icon className={`w-4 h-4 ${activeReport.id === report.id ? 'text-white' : 'text-gray-400'}`} />
              {report.name}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-4 gap-6 pr-2">
          {reportData.healthCard && (
            <div className={`p-4 rounded-xl shadow-sm border flex items-center justify-between ${reportData.healthCard.colorClass}`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider mb-1 block">Business Health</span>
                <div className="text-xl font-bold">{reportData.healthCard.state}</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider mb-1 block">Net Cash Position</span>
                <div className="text-xl font-bold">{reportData.healthCard.value}</div>
              </div>
            </div>
          )}

          {reportData.sections && reportData.sections.length > 0 && (
            <div className="flex flex-col gap-6">
              {reportData.sections.map((sec, i) => (
                <div key={i}>
                  <h3 className="text-md font-bold text-gray-700 mb-3">{sec.title}</h3>
                  <div className={`grid gap-4 ${sec.cards.length > 4 ? 'grid-cols-5' : `grid-cols-${sec.cards.length}`}`}>
                    {sec.cards.map((card, idx) => (
                      <div key={idx} className={`p-4 rounded-xl shadow-sm border flex flex-col justify-center ${
                        card.highlight ? 'bg-gradient-to-br from-green-600 to-green-800 border-green-700 text-white' : 'bg-white border-gray-200'
                      }`}>
                        <span className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${card.highlight ? 'text-green-100' : 'text-gray-500'}`}>
                          {card.label}
                        </span>
                        <div className={`text-xl font-bold ${card.highlight ? 'text-white' : 'text-gray-900'}`}>
                          {card.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!reportData.sections && reportData.cards.length > 0 && (
            <div className={`grid gap-4 ${reportData.cards.length > 4 ? 'grid-cols-5' : `grid-cols-${reportData.cards.length}`}`}>
              {reportData.cards.map((card, idx) => (
                <div key={idx} className={`p-4 rounded-xl shadow-sm border flex flex-col justify-center ${
                  card.highlight ? 'bg-gradient-to-br from-green-600 to-green-800 border-green-700 text-white' : 'bg-white border-gray-200'
                }`}>
                  <span className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${card.highlight ? 'text-green-100' : 'text-gray-500'}`}>
                    {card.label}
                  </span>
                  <div className={`text-xl font-bold ${card.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col flex-1 min-h-[400px]">
            <div className="p-4 border-b border-gray-200 flex flex-col gap-4 bg-gray-50/50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search within report..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 shadow-sm">
                  <SlidersHorizontal className="w-4 h-4" /> Advanced Filter
                </button>
              </div>

              {/* Dynamic Filter Row */}
              <div className="flex gap-4 items-end bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                {(activeReport.id === 'daily-summary-report' || activeReport.id === 'today-collection-report') ? (
                  <div className="flex-1 max-w-xs">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Target Date</label>
                    <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                ) : activeReport.id === 'account-summary-report' || activeReport.id === 'cash-assets-report' || activeReport.id === 'business-report' ? (
                  <>
                    <div className="flex-1 max-w-xs">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
                      <input type="date" value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="flex-1 max-w-xs">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
                      <input type="date" value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 max-w-xs">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
                      <input type="date" value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="flex-1 max-w-xs">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
                      <input type="date" value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="flex-1 max-w-xs">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Customer ID</label>
                      <input type="text" placeholder="e.g. CUST000001" value={filters.customerId} onChange={e => setFilters({ ...filters, customerId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    {activeReport.id === 'loan-report' && (
                      <div className="flex-1 max-w-xs">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option value="">All Statuses</option>
                          <option value="Active">Active</option>
                          <option value="Closed">Closed</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                    )}
                    {activeReport.id === 'auction-account' && (
                      <div className="flex-1 max-w-xs">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Auction Status</label>
                        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option value="">All Auction Statuses</option>
                          <option value="Auction Ready">Auction Ready</option>
                          <option value="Auctioned">Auctioned</option>
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {reportData.columns && reportData.columns.length > 0 ? (
              <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-gray-100/50 sticky top-0 z-10 shadow-sm">
                    <tr>
                      {reportData.columns.map((col, idx) => (
                        <th key={idx} className="px-6 py-3 text-[11px] font-bold text-gray-500 tracking-wider uppercase border-b border-gray-200">
                          {col}
                        </th>
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
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Archive className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-600">No tabular data available</p>
                <p className="text-sm mt-1">This report currently provides aggregate summary metrics.</p>
              </div>
            )}

            <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 flex justify-between items-center rounded-b-xl">
              <span>Showing {reportData.rows?.length || 0} records</span>
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
