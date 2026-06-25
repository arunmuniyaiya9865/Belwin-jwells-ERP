import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Printer, Download, FileText, Search, FilterX, Eye, ExternalLink } from 'lucide-react';

const ExpenseReport = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    totalExpenseAmount: 0,
    cashExpenses: 0,
    bankOnlineExpenses: 0
  });

  // Filter States
  const [datePreset, setDatePreset] = useState('All Time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [expenseIdFilter, setExpenseIdFilter] = useState(''); // Added per requirements

  // Dropdown options derived from data
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetchExpenses();
  }, [startDate, endDate, categoryFilter, paymentModeFilter, expenseIdFilter]); // removed employee, vendor, branch to strictly follow the requirement of backend filters, though we could pass them if we expanded the backend

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('fromDate', startDate);
      if (endDate) queryParams.append('toDate', endDate);
      if (expenseIdFilter) queryParams.append('expenseId', expenseIdFilter);
      if (categoryFilter) queryParams.append('expenseCategory', categoryFilter);
      if (paymentModeFilter) queryParams.append('paymentMode', paymentModeFilter);

      const response = await fetch(`http://localhost:5000/api/expenses/report?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setExpenses(data.data);
        setSummary(data.summary);
        
        // Extract unique values for dropdowns ONLY if they are empty so they don't reset on filter
        if (categories.length === 0) {
          setCategories([...new Set(data.data.map(e => e.expenseCategory).filter(Boolean))]);
          setPaymentModes([...new Set(data.data.map(e => e.paymentMode).filter(Boolean))]);
        }
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  // Helper for date presets
  const applyDatePreset = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = '';
    let end = '';

    if (preset === 'Today') {
      start = today.toISOString().split('T')[0];
      end = start;
    } else if (preset === 'Yesterday') {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      start = yest.toISOString().split('T')[0];
      end = start;
    } else if (preset === 'This Week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      start = startOfWeek.toISOString().split('T')[0];
      end = new Date().toISOString().split('T')[0];
    } else if (preset === 'This Month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      start = startOfMonth.toISOString().split('T')[0];
      end = new Date().toISOString().split('T')[0];
    }

    setStartDate(start);
    setEndDate(end);
  };

  // Summary Calculations - Moved to Backend

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Expense ID', 'Branch', 'Category', 'Sub Category', 'Vendor', 'Amount', 'Mode', 'Entered By', 'Approved By', 'Status'];
    const rows = expenses.map(exp => [
      exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString() : '',
      exp.expenseId || '',
      exp.branchName || '',
      exp.expenseCategory || '',
      exp.expenseSubCategory || '',
      exp.paidToVendorName || '',
      exp.expenseAmount || 0,
      exp.paymentMode || '',
      exp.enteredBy || '',
      exp.approvedBy || '',
      'Paid' // Placeholder status
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setDatePreset('All Time');
    setStartDate('');
    setEndDate('');
    setCategoryFilter('');
    setPaymentModeFilter('');
    setExpenseIdFilter('');
  };

  if (loading) return <div className="p-6 text-center text-gray-600">Loading comprehensive expense report...</div>;

  return (
    <div className="flex flex-col space-y-4" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center shrink-0 print:hidden">
        <h1 className="text-2xl font-bold text-text-primary">Expense Report Overview</h1>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition">
            <Printer size={18} /> Print PDF
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-erp-green text-white rounded-md hover:bg-green-700 transition">
            <FileText size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Expenses (Count)</p>
          <p className="text-2xl font-bold text-gray-800">{summary.totalExpenses}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Expense Amount</p>
          <p className="text-2xl font-bold text-gray-800">₹{summary.totalExpenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Cash Expenses</p>
          <p className="text-2xl font-bold text-gray-800">₹{summary.cashExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Bank / Online Expenses</p>
          <p className="text-2xl font-bold text-gray-800">₹{summary.bankOnlineExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 print:hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><FilterX size={20} className="text-gray-500" /> Advanced Filters</h3>
          <button onClick={clearFilters} className="text-sm text-red-500 hover:underline">Clear All Filters</button>
        </div>

        {/* Date Presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['All Time', 'Today', 'Yesterday', 'This Week', 'This Month'].map(preset => (
            <button 
              key={preset}
              onClick={() => applyDatePreset(preset)}
              className={`px-3 py-1 text-sm rounded-full border transition ${datePreset === preset ? 'bg-erp-green text-white border-erp-green' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2 flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => {setStartDate(e.target.value); setDatePreset('Custom');}} className="w-full text-sm px-3 py-2 border rounded-md" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input type="date" value={endDate} onChange={e => {setEndDate(e.target.value); setDatePreset('Custom');}} className="w-full text-sm px-3 py-2 border rounded-md" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Expense ID</label>
            <input type="text" value={expenseIdFilter} onChange={e => setExpenseIdFilter(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-md" placeholder="e.g. EXP000001" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-md bg-white">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Payment Mode</label>
            <select value={paymentModeFilter} onChange={e => setPaymentModeFilter(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-md bg-white">
              <option value="">All Modes</option>
              {paymentModes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden print:border-none print:shadow-none">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center print:bg-white print:border-b-2 print:border-black print:px-0">
          <h2 className="text-lg font-bold text-gray-800">Filtered Expenses</h2>
          <span className="text-gray-600 font-medium text-sm">Showing {expenses.length} records</span>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse text-sm print:text-xs">
            <thead>
              <tr className="bg-white border-b-2 border-gray-200 text-gray-700 print:border-black">
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Expense ID</th>
                <th className="px-4 py-3 font-semibold">Branch</th>
                <th className="px-4 py-3 font-semibold">Category / Sub</th>
                <th className="px-4 py-3 font-semibold">Vendor Name</th>
                <th className="px-4 py-3 font-semibold">Mode</th>
                <th className="px-4 py-3 font-semibold">By</th>
                <th className="px-4 py-3 font-semibold text-right">Amount (₹)</th>
                <th className="px-4 py-3 font-semibold text-center print:hidden">Attachment</th>
                <th className="px-4 py-3 font-semibold text-center print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.length > 0 ? (
                expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{exp.expenseId}</td>
                    <td className="px-4 py-3 text-gray-600">{exp.branchName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{exp.expenseCategory}</span>
                        {exp.expenseSubCategory && <span className="text-xs text-gray-500">{exp.expenseSubCategory}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{exp.paidToVendorName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        exp.paymentMode === 'Cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {exp.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-gray-800">{exp.enteredBy || '-'}</span>
                        {exp.approvedBy && <span className="text-xs text-gray-500">Appr: {exp.approvedBy}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 text-right">
                      {exp.expenseAmount ? exp.expenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </td>
                    <td className="px-4 py-3 text-center print:hidden">
                      {exp.expenseImage ? (
                        <a href={exp.expenseImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-xs font-medium bg-blue-50 px-2 py-1 rounded">
                          <ExternalLink size={14} /> View Bill
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center print:hidden">
                      <NavLink to="/edit-expense" className="text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 text-xs font-medium">
                        <Eye size={14} /> View
                      </NavLink>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    <Search className="mx-auto text-gray-300 mb-2" size={32} />
                    No expenses match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
            {expenses.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200 print:border-black">
                <tr>
                  <td colSpan="7" className="px-4 py-4 text-right font-bold text-gray-800 uppercase tracking-wider">Filtered Total:</td>
                  <td className="px-4 py-4 text-right font-bold text-erp-green text-lg print:text-black">
                    ₹{summary.totalExpenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan="2" className="print:hidden"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

    </div>
  );
};

export default ExpenseReport;
