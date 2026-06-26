import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Printer, Eye, Calendar, User, FileText, MapPin, BadgeDollarSign, X } from 'lucide-react';
import { getPaymentHistory, getAllPayments } from '../services/paymentService';
import toast, { Toaster } from 'react-hot-toast';

const PaymentHistory = () => {
  // --- Global Ledger State ---
  const [payments, setPayments] = useState([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [filters, setFilters] = useState({
    dateWise: '',
    customerWise: '',
    loanWise: '',
    employeeWise: ''
  });

  // --- Loan ID Search State ---
  const [searchLoanId, setSearchLoanId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loanSummary, setLoanSummary] = useState(null);     // { loan: {}, payments: [] }

  // Load all payments on mount
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoadingAll(true);
      try {
        const data = await getAllPayments();
        setPayments(data);
      } catch {
        // If API fails, show empty state gracefully
        setPayments([]);
      } finally {
        setIsLoadingAll(false);
      }
    };
    fetchAll();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // --- Loan search handler ---
  const handleSearchLoan = async () => {
    if (!searchLoanId.trim()) {
      toast.error('Please enter a Loan ID (e.g. LOAN000001)');
      return;
    }
    setIsSearching(true);
    setLoanSummary(null);
    try {
      const data = await getPaymentHistory(searchLoanId.trim().toUpperCase());
      setLoanSummary(data);
      toast.success(`Found ${data.payments.length} payment(s) for ${data.loan.loanId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Loan not found');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchLoanId('');
    setLoanSummary(null);
  };

  // Determine which payments to show in table
  // If loan search is active → show only those payments
  // Otherwise → show global filtered ledger
  const activePayments = loanSummary
    ? loanSummary.payments
    : payments.filter(p => {
        if (filters.dateWise && p.paymentDate?.slice(0, 10) !== filters.dateWise) return false;
        if (filters.customerWise && !p.customerId?.toLowerCase().includes(filters.customerWise.toLowerCase())) return false;
        if (filters.loanWise && !p.loanId?.toLowerCase().includes(filters.loanWise.toLowerCase())) return false;
        if (filters.employeeWise && !p.collectedBy?.toLowerCase().includes(filters.employeeWise.toLowerCase())) return false;
        return true;
      });

  const inp = "w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 transition-colors";

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-right" />

      {/* Title & Actions */}
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Payment History</h2>
          <p className="text-sm text-text-secondary mt-1">View all received customer payments. Payments are immutable after creation.</p>
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

      {/* ── Loan ID Search Section ── */}
      <div className="mb-4 bg-white border border-gray-200 rounded-xl shadow-sm p-4 shrink-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" /> Search by Loan ID
        </p>
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-sm">
            <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchLoanId}
              onChange={e => setSearchLoanId(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearchLoan(); }}
              placeholder="e.g. LOAN000001"
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono transition-colors"
            />
          </div>
          <button
            onClick={handleSearchLoan}
            disabled={isSearching}
            className="px-5 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition shadow-sm disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {loanSummary && (
            <button
              onClick={handleClearSearch}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Summary Cards (only when loan search is active) */}
        {loanSummary && (
          <div className="mt-4 grid grid-cols-6 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Loan ID</div>
              <div className="text-sm font-bold text-gray-800 font-mono">{loanSummary.loan.loanId}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center col-span-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer</div>
              <div className="text-sm font-bold text-gray-800 truncate">{loanSummary.loan.name}</div>
              <div className="text-xs text-gray-500">{loanSummary.loan.customerId}</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Loan Amount</div>
              <div className="text-sm font-bold text-emerald-800">₹{parseFloat(loanSummary.loan.loanAmount || 0).toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Remaining</div>
              <div className="text-sm font-bold text-amber-800">₹{parseFloat(loanSummary.loan.remainingLoanAmount || 0).toLocaleString('en-IN')}</div>
            </div>
            <div className={`border rounded-lg p-3 text-center ${loanSummary.loan.status === 'Closed' ? 'bg-blue-50 border-blue-200' : loanSummary.loan.status === 'Approved' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</div>
              <div className={`text-sm font-bold ${loanSummary.loan.status === 'Closed' ? 'text-blue-700' : loanSummary.loan.status === 'Approved' ? 'text-green-700' : 'text-yellow-700'}`}>
                {loanSummary.loan.status}
              </div>
              <div className="text-[10px] text-gray-500">{loanSummary.payments.length} payment(s)</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Table Panel ── */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">

        {/* Filters (only shown in global mode) */}
        {!loanSummary && (
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 grid grid-cols-5 gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="date" name="dateWise" value={filters.dateWise} onChange={handleFilterChange} className={inp} />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="text" name="customerWise" value={filters.customerWise} onChange={handleFilterChange} placeholder="Customer ID..." className={inp} />
            </div>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="text" name="loanWise" value={filters.loanWise} onChange={handleFilterChange} placeholder="Loan Number..." className={inp} />
            </div>
            <div className="relative">
              <BadgeDollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="text" name="employeeWise" value={filters.employeeWise} onChange={handleFilterChange} placeholder="Employee/Collected By..." className={inp} />
            </div>
          </div>
        )}

        {/* Mode indicator when loan search is active */}
        {loanSummary && (
          <div className="px-4 py-2 bg-green-50 border-b border-green-100 text-xs font-semibold text-green-700 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Showing payments for <span className="font-mono font-bold">{loanSummary.loan.loanId}</span>
            &mdash; {loanSummary.payments.length} record(s)
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">DATE & RECEIPT</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">CUSTOMER & LOAN</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider text-right">PAYMENT AMOUNT</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider text-right">SPLIT (INT / PRIN)</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">MODE</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoadingAll && !loanSummary ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-400">
                    Loading payment records...
                  </td>
                </tr>
              ) : activePayments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                    {loanSummary ? 'No payments have been made on this loan yet.' : 'No payment records found matching the criteria.'}
                  </td>
                </tr>
              ) : (
                activePayments.map((p, i) => (
                  <tr key={p.paymentId || p._id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '—'}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{p.paymentId || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800">{p.customerId}</div>
                      <div className="text-xs font-mono text-gray-500 mt-0.5">
                        Loan: <span className="font-semibold text-green-700">{p.loanId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-bold text-gray-900">₹{parseFloat(p.paymentAmount || 0).toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{p.paymentType}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-gray-600">
                        ₹{parseFloat(p.interestAmount || 0).toLocaleString('en-IN')} / ₹{parseFloat(p.principalAmount || 0).toLocaleString('en-IN')}
                      </div>
                      {p.penaltyAmount > 0 && (
                        <div className="text-[10px] text-red-500 mt-0.5">+₹{p.penaltyAmount} Penalty</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {p.paymentMode || 'Cash'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="View Receipt">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Reprint Receipt">
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 flex justify-between">
          <span>
            Showing <span className="font-bold text-gray-700">{activePayments.length}</span> records
            {loanSummary && <span className="ml-2 text-green-600 font-semibold">— filtered by {loanSummary.loan.loanId}</span>}
          </span>
          <span className="font-bold text-gray-700">
            Total: ₹{activePayments.reduce((acc, p) => acc + parseFloat(p.paymentAmount || 0), 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
