import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Printer, Eye, Calendar, User, FileText, MapPin, BadgeDollarSign } from 'lucide-react';
import { getAllPayments } from '../utils/paymentStore';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    dateWise: '',
    customerWise: '',
    loanWise: '',
    branchWise: '',
    employeeWise: ''
  });

  useEffect(() => {
    // Basic filter logic
    let data = getAllPayments();
    
    if (filters.dateWise) {
      data = data.filter(p => p.paymentDate === filters.dateWise);
    }
    if (filters.customerWise) {
      data = data.filter(p => p.customerName?.toLowerCase().includes(filters.customerWise.toLowerCase()));
    }
    if (filters.loanWise) {
      data = data.filter(p => p.loanNumber?.toLowerCase().includes(filters.loanWise.toLowerCase()));
    }
    if (filters.employeeWise) {
      data = data.filter(p => p.collectedBy?.toLowerCase().includes(filters.employeeWise.toLowerCase()));
    }

    setPayments(data);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const inp = "w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 transition-colors";

  return (
    <div className="flex flex-col h-full">
      {/* Title & Actions */}
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Payment History</h2>
          <p className="text-sm text-text-secondary mt-1">View and manage all received customer payments.</p>
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

      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 grid grid-cols-5 gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="date" name="dateWise" value={filters.dateWise} onChange={handleFilterChange} className={inp} />
          </div>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" name="customerWise" value={filters.customerWise} onChange={handleFilterChange} placeholder="Customer Name..." className={inp} />
          </div>
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" name="loanWise" value={filters.loanWise} onChange={handleFilterChange} placeholder="Loan Number..." className={inp} />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <select name="branchWise" value={filters.branchWise} onChange={handleFilterChange} className={inp}>
              <option value="">All Branches</option>
              <option value="Main">Main Branch</option>
            </select>
          </div>
          <div className="relative">
            <BadgeDollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" name="employeeWise" value={filters.employeeWise} onChange={handleFilterChange} placeholder="Employee/Collected By..." className={inp} />
          </div>
        </div>

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
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                    No payment records found matching the criteria.
                  </td>
                </tr>
              ) : (
                payments.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800">{p.paymentDate}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{p.receiptNo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800">{p.customerName}</div>
                      <div className="text-xs font-mono text-gray-500 mt-0.5">Loan: <span className="font-semibold text-green-700">{p.loanNumber}</span> | Ph: {p.mobileNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-bold text-gray-900">₹{parseFloat(p.amountReceived||0).toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{p.paymentType}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-gray-600">₹{parseFloat(p.interestAmount||0).toLocaleString('en-IN')} / ₹{parseFloat(p.principalAmount||0).toLocaleString('en-IN')}</div>
                      {p.penaltyAmount > 0 && <div className="text-[10px] text-red-500 mt-0.5">+₹{p.penaltyAmount} Penalty</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {p.paymentMode}
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
          <span>Showing {payments.length} records</span>
          <span className="font-bold text-gray-700">Total Displayed: ₹{payments.reduce((acc, p) => acc + parseFloat(p.amountReceived||0), 0).toLocaleString('en-IN')}</span>
        </div>

      </div>
    </div>
  );
};

export default PaymentHistory;
