import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Printer, Download, FileText, Search, FilterX, Eye } from 'lucide-react';

const IncomeReport = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [datePreset, setDatePreset] = useState('All Time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Dropdown options derived from data
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/incomes');
      const data = await response.json();
      if (data.success) {
        setIncomes(data.data);
        
        // Extract unique values for dropdowns
        setBranches([...new Set(data.data.map(i => i.branchName).filter(Boolean))]);
        setCategories([...new Set(data.data.map(i => i.incomeCategory).filter(Boolean))]);
        setPaymentModes([...new Set(data.data.map(i => i.paymentMode).filter(Boolean))]);
        setSources([...new Set(data.data.map(i => i.receivedFrom).filter(Boolean))]);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
      toast.error('Failed to load incomes');
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

  // Filter Logic
  const filteredIncomes = useMemo(() => {
    return incomes.filter(inc => {
      const incDate = new Date(inc.incomeDate).setHours(0, 0, 0, 0);
      
      let passDate = true;
      if (startDate && endDate) {
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        passDate = incDate >= start && incDate <= end;
      } else if (startDate) {
        passDate = incDate >= new Date(startDate).setHours(0, 0, 0, 0);
      } else if (endDate) {
        passDate = incDate <= new Date(endDate).setHours(23, 59, 59, 999);
      }

      const passBranch = branchFilter ? inc.branchName === branchFilter : true;
      const passCategory = categoryFilter ? inc.incomeCategory === categoryFilter : true;
      const passPaymentMode = paymentModeFilter ? inc.paymentMode === paymentModeFilter : true;
      const passSource = sourceFilter ? (inc.receivedFrom || '').toLowerCase().includes(sourceFilter.toLowerCase()) : true;

      return passDate && passBranch && passCategory && passPaymentMode && passSource;
    });
  }, [incomes, startDate, endDate, branchFilter, categoryFilter, paymentModeFilter, sourceFilter]);

  // Summary Calculations
  const summary = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    let total = 0;
    let todayTotal = 0;
    let monthTotal = 0;
    let cashTotal = 0;
    let bankUpiTotal = 0;
    
    const branchTotals = {};
    const categoryTotals = {};

    filteredIncomes.forEach(inc => {
      const amt = inc.amount || 0;
      total += amt;

      const incDateObj = new Date(inc.incomeDate);
      const incDate = incDateObj.setHours(0, 0, 0, 0);

      if (incDate === today) todayTotal += amt;
      if (incDateObj.getMonth() === thisMonth && incDateObj.getFullYear() === thisYear) {
        monthTotal += amt;
      }

      if (inc.paymentMode === 'Cash') cashTotal += amt;
      if (['Bank Transfer', 'UPI', 'Card', 'Cheque'].includes(inc.paymentMode)) bankUpiTotal += amt;

      if (inc.branchName) {
        branchTotals[inc.branchName] = (branchTotals[inc.branchName] || 0) + amt;
      }
      if (inc.incomeCategory) {
        categoryTotals[inc.incomeCategory] = (categoryTotals[inc.incomeCategory] || 0) + amt;
      }
    });

    const topBranch = Object.keys(branchTotals).sort((a,b) => branchTotals[b] - branchTotals[a])[0];
    const topCategory = Object.keys(categoryTotals).sort((a,b) => categoryTotals[b] - categoryTotals[a])[0];

    return { total, todayTotal, monthTotal, cashTotal, bankUpiTotal, topBranch, topCategory, branchTotals, categoryTotals };
  }, [filteredIncomes]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Income ID', 'Branch', 'Category', 'Sub Category', 'Received From', 'Amount', 'Mode', 'Received By', 'Approved By'];
    const rows = filteredIncomes.map(inc => [
      inc.incomeDate ? new Date(inc.incomeDate).toLocaleDateString() : '',
      inc.incomeId || '',
      inc.branchName || '',
      inc.incomeCategory || '',
      inc.incomeSubCategory || '',
      inc.receivedFrom || '',
      inc.amount || 0,
      inc.paymentMode || '',
      inc.receivedBy || '',
      inc.approvedBy || ''
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Income_Report_${new Date().toISOString().split('T')[0]}.csv`);
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
    setBranchFilter('');
    setCategoryFilter('');
    setPaymentModeFilter('');
    setSourceFilter('');
  };

  if (loading) return <div className="p-6 text-center text-gray-600">Loading comprehensive income report...</div>;

  return (
    <div className="flex flex-col space-y-4" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center shrink-0 print:hidden">
        <h1 className="text-2xl font-bold text-text-primary">Income Report Overview</h1>
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
          <p className="text-sm text-gray-500 font-medium">Today's Income</p>
          <p className="text-2xl font-bold text-gray-800">₹{summary.todayTotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">This Month's Income</p>
          <p className="text-2xl font-bold text-gray-800">₹{summary.monthTotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Cash Income (Filtered)</p>
          <p className="text-2xl font-bold text-gray-800">₹{summary.cashTotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Bank/UPI Income (Filtered)</p>
          <p className="text-2xl font-bold text-gray-800">₹{summary.bankUpiTotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 md:col-span-2 lg:col-span-2">
          <p className="text-sm text-gray-500 font-medium">Top Income Category</p>
          <p className="text-xl font-semibold text-gray-800 truncate">
            {summary.topCategory ? `${summary.topCategory} (₹${summary.categoryTotals[summary.topCategory].toLocaleString('en-IN')})` : 'N/A'}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 md:col-span-2 lg:col-span-2">
          <p className="text-sm text-gray-500 font-medium">Top Earning Branch</p>
          <p className="text-xl font-semibold text-gray-800 truncate">
            {summary.topBranch ? `${summary.topBranch} (₹${summary.branchTotals[summary.topBranch].toLocaleString('en-IN')})` : 'N/A'}
          </p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
            <label className="block text-xs text-gray-500 mb-1">Branch</label>
            <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-md bg-white">
              <option value="">All Branches</option>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
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
          <h2 className="text-lg font-bold text-gray-800">Filtered Incomes</h2>
          <span className="text-gray-600 font-medium text-sm">Showing {filteredIncomes.length} records</span>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse text-sm print:text-xs">
            <thead>
              <tr className="bg-white border-b-2 border-gray-200 text-gray-700 print:border-black">
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Income ID</th>
                <th className="px-4 py-3 font-semibold">Branch</th>
                <th className="px-4 py-3 font-semibold">Category / Sub</th>
                <th className="px-4 py-3 font-semibold">Received From</th>
                <th className="px-4 py-3 font-semibold">Mode</th>
                <th className="px-4 py-3 font-semibold text-right">Amount (₹)</th>
                <th className="px-4 py-3 font-semibold text-center print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredIncomes.length > 0 ? (
                filteredIncomes.map((inc) => (
                  <tr key={inc._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {inc.incomeDate ? new Date(inc.incomeDate).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{inc.incomeId}</td>
                    <td className="px-4 py-3 text-gray-600">{inc.branchName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{inc.incomeCategory}</span>
                        {inc.incomeSubCategory && <span className="text-xs text-gray-500">{inc.incomeSubCategory}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{inc.receivedFrom}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        inc.paymentMode === 'Cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {inc.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 text-right">
                      {inc.amount ? inc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </td>
                    <td className="px-4 py-3 text-center print:hidden">
                      <NavLink to="/edit-income" className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 text-xs font-medium">
                        <Eye size={14} /> View
                      </NavLink>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <Search className="mx-auto text-gray-300 mb-2" size={32} />
                    No incomes match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredIncomes.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200 print:border-black">
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-right font-bold text-gray-800 uppercase tracking-wider">Filtered Total:</td>
                  <td className="px-4 py-4 text-right font-bold text-erp-green text-lg print:text-black">
                    ₹{summary.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="print:hidden"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

    </div>
  );
};

export default IncomeReport;
