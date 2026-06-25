import React, { useState, useEffect } from 'react';
import { Search, Save, RefreshCcw, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
<<<<<<< HEAD
import axios from 'axios';
=======
import { getAllLoans } from '../utils/loanStore';
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
import toast from 'react-hot-toast';

const emptyTopUp = {
  requestedTopUpAmount: '', approvedTopUpAmount: '', topUpDate: '',
  newDueDate: '', newInterestRate: '', processingFee: '',
  approvalStatus: 'Pending', approvedBy: '', approvalDate: '', remarks: '',
  disbursementMode: 'Cash', transactionRef: ''
};

const TopUpLoan = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [form, setForm] = useState({ ...emptyTopUp });
  const [topUpHistory, setTopUpHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('form'); // form | reports

<<<<<<< HEAD
  const [allTopUps, setAllTopUps] = useState([]);

  useEffect(() => {
    if (activeTab === 'reports') {
      const fetchTopUps = async () => {
        try {
          const res = await axios.get('http://127.0.0.1:5000/api/topups');
          if (res.data && res.data.topups) setAllTopUps(res.data.topups);
        } catch (err) {
          console.error('Failed to fetch top-ups:', err);
        }
      };
      fetchTopUps();
    }
  }, [activeTab]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      console.log('Fetching loan:', searchQuery);
      const res = await axios.get(`http://127.0.0.1:5000/api/loans/${searchQuery.trim()}`);
      if (res.data) {
        console.log('Loan API response:', res.data);
        handleSelectLoan(res.data);
      } else {
        toast.error('Loan not found');
      }
    } catch (err) {
      console.error('Failed to fetch loan:', err);
      toast.error('Loan not found or error occurred');
    }
  };

  const fetchHistory = async (loanId) => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/topups/loan/${loanId}`);
      if (res.data && res.data.topups) {
        setTopUpHistory(res.data.topups);
      }
    } catch (err) {
      console.error('Failed to fetch top-up history:', err);
    }
  };
=======
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const q = searchQuery.toLowerCase();
      const results = getAllLoans().filter(l =>
        l.loanNumber?.toLowerCase().includes(q) ||
        l.customerName?.toLowerCase().includes(q) ||
        l.mobileNumber?.includes(q)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6

  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan);
    setSearchQuery('');
    setSearchResults([]);
    setForm({ ...emptyTopUp });
<<<<<<< HEAD
    setTopUpHistory([]);
    fetchHistory(loan.loanId);
  };

  const goldValue = selectedLoan?.articles?.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0) || 0;
  
  // Calculate eligible top-up: 70% of gold value minus current loan
  const eligibleTopUp = selectedLoan
    ? Math.max(0, (goldValue * 0.7) - parseFloat(selectedLoan.loanAmount || 0))
=======
    setTopUpHistory(loan.topUpHistory || []);
  };

  // Calculate eligible top-up: 70% of gold value minus current loan
  const eligibleTopUp = selectedLoan
    ? Math.max(0, (parseFloat(selectedLoan.goldValue || 0) * 0.7) - parseFloat(selectedLoan.loanAmount || 0))
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
    : 0;

  const newLoanAmount = selectedLoan
    ? parseFloat(selectedLoan.loanAmount || 0) + parseFloat(form.approvedTopUpAmount || 0)
    : 0;

  const inp  = "w-full px-3 py-1.5 text-sm bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl  = "block text-xs font-semibold text-gray-600 mb-0.5";
  const card = "bg-white border border-gray-100 rounded-xl shadow-sm p-5";
  const sec  = "text-sm font-bold text-green-700 border-b border-gray-100 pb-1.5 mb-3 flex items-center gap-2";

<<<<<<< HEAD
  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;
    if (!form.requestedTopUpAmount) return toast.error('Please enter the requested top-up amount');
    
    try {
      const payload = {
        loanId: selectedLoan.loanId,
        topupAmount: Number(form.requestedTopUpAmount),
        remarks: form.remarks,
        topupDate: form.topUpDate || new Date().toISOString().split('T')[0]
      };

      const res = await axios.post('http://127.0.0.1:5000/api/topups', payload);
      toast.success('Top-up request saved successfully!');
      
      // Refresh loan details from backend
      handleSearch();
      
      // Clear form
      setForm({ ...emptyTopUp });

    } catch (error) {
      console.error('Error saving top-up:', error);
      toast.error(error.response?.data?.error || 'Failed to save top-up request');
    }
  };

  const pending  = allTopUps.filter(t => t.status === 'Pending' || (!t.status)); // adjust based on actual logic, topup schema doesn't have status, defaults to applied
  const approved = allTopUps.filter(t => t.status === 'Approved');
  const rejected = allTopUps.filter(t => t.status === 'Rejected');
=======
  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedLoan) return;
    if (!form.requestedTopUpAmount) return toast.error('Please enter the requested top-up amount');
    const entry = {
      loanNumber: selectedLoan.loanNumber,
      requestedAmount: form.requestedTopUpAmount,
      approvedAmount: form.approvedTopUpAmount,
      topUpDate: form.topUpDate || new Date().toISOString().split('T')[0],
      approvalStatus: form.approvalStatus,
      approvedBy: form.approvedBy,
      remarks: form.remarks
    };
    const updated = { ...selectedLoan, topUpHistory: [...topUpHistory, entry] };
    setTopUpHistory(updated.topUpHistory);
    setSelectedLoan(updated);
    toast.success('Top-up request saved successfully!');
  };

  const allLoans = getAllLoans();
  const pending  = allLoans.filter(l => (l.topUpHistory || []).some(t => t.approvalStatus === 'Pending'));
  const approved = allLoans.filter(l => (l.topUpHistory || []).some(t => t.approvalStatus === 'Approved'));
  const rejected = allLoans.filter(l => (l.topUpHistory || []).some(t => t.approvalStatus === 'Rejected'));
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Title */}
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Top Up Loan</h2>
          <p className="text-xs text-text-secondary mt-0.5">Process additional loan amounts against existing pledged gold collateral.</p>
        </div>
        <div className="flex gap-2">
          {['form', 'reports'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === tab ? 'bg-green-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {tab === 'form' ? 'Top Up Form' : 'Reports'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'reports' ? (
        /* ── REPORTS TAB ── */
        <div className="grid grid-cols-2 gap-5 overflow-auto pb-4">
          {/* Top Up History */}
          <div className={`${card} col-span-2`}>
            <h3 className={sec}><FileText className="w-4 h-4" /> Top Up History</h3>
            {topUpHistory.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Select a loan and save a top-up to view history.</p>
            ) : (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 text-gray-500">
                  <th className="p-2 text-left">Loan No</th>
                  <th className="p-2 text-right">Requested</th>
                  <th className="p-2 text-right">Approved</th>
                  <th className="p-2 text-center">Status</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Approved By</th>
                </tr></thead>
                <tbody>{topUpHistory.map((t, i) => (
                  <tr key={i} className="border-t border-gray-50">
<<<<<<< HEAD
                    <td className="p-2 font-medium">{t.loanId}</td>
                    <td className="p-2 text-right">₹{parseFloat(t.topupAmount||0).toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right font-semibold text-green-700">₹{parseFloat(t.topupAmount||0).toLocaleString('en-IN')}</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700`}>Approved</span>
                    </td>
                    <td className="p-2">{new Date(t.topupDate).toLocaleDateString('en-IN')}</td>
                    <td className="p-2">{t.remarks||'—'}</td>
=======
                    <td className="p-2 font-medium">{t.loanNumber}</td>
                    <td className="p-2 text-right">₹{parseFloat(t.requestedAmount||0).toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right font-semibold text-green-700">₹{parseFloat(t.approvedAmount||0).toLocaleString('en-IN')}</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.approvalStatus==='Approved'?'bg-green-100 text-green-700':t.approvalStatus==='Rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{t.approvalStatus}</span>
                    </td>
                    <td className="p-2">{t.topUpDate}</td>
                    <td className="p-2">{t.approvedBy||'—'}</td>
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>

          {/* Top Up Pending */}
          <div className={card}>
            <h3 className={`${sec} text-yellow-700`}><Clock className="w-4 h-4 text-yellow-600" /> Top Up Pending</h3>
            {pending.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No pending top-ups.</p> : (
<<<<<<< HEAD
              pending.map(t => <div key={t.topupId} className="text-sm py-2 border-b last:border-0 flex justify-between"><span className="font-medium">{t.loanId}</span><span className="text-gray-500">{t.customerName}</span></div>)
=======
              pending.map(l => <div key={l.loanNumber} className="text-sm py-2 border-b last:border-0 flex justify-between"><span className="font-medium">{l.loanNumber}</span><span className="text-gray-500">{l.customerName}</span></div>)
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
            )}
          </div>

          {/* Top Up Approved */}
          <div className={card}>
            <h3 className={`${sec} text-green-700`}><CheckCircle2 className="w-4 h-4 text-green-600" /> Top Up Approved</h3>
            {approved.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No approved top-ups.</p> : (
<<<<<<< HEAD
              approved.map(t => <div key={t.topupId} className="text-sm py-2 border-b last:border-0 flex justify-between"><span className="font-medium">{t.loanId}</span><span className="text-gray-500">{t.customerName}</span></div>)
=======
              approved.map(l => <div key={l.loanNumber} className="text-sm py-2 border-b last:border-0 flex justify-between"><span className="font-medium">{l.loanNumber}</span><span className="text-gray-500">{l.customerName}</span></div>)
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
            )}
          </div>

          {/* Top Up Rejected */}
          <div className={`${card} col-span-2`}>
            <h3 className={`${sec} text-red-700`}><XCircle className="w-4 h-4 text-red-600" /> Top Up Rejected</h3>
            {rejected.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No rejected top-ups.</p> : (
<<<<<<< HEAD
              rejected.map(t => <div key={t.topupId} className="text-sm py-2 border-b last:border-0 flex justify-between"><span className="font-medium">{t.loanId}</span><span className="text-gray-500">{t.customerName}</span></div>)
=======
              rejected.map(l => <div key={l.loanNumber} className="text-sm py-2 border-b last:border-0 flex justify-between"><span className="font-medium">{l.loanNumber}</span><span className="text-gray-500">{l.customerName}</span></div>)
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
            )}
          </div>
        </div>
      ) : (
        /* ── FORM TAB ── */
        <div className="flex gap-5 flex-1 overflow-hidden">
          {/* Left: Main form */}
          <div className="flex flex-col gap-4 w-[60%] overflow-auto pb-4">
            {/* Search */}
<<<<<<< HEAD
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter Loan Number (e.g., LOAN000005)..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-green-500" />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              <button onClick={handleSearch} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm text-sm font-semibold hover:bg-green-700">
                Search
              </button>
=======
            <div className="relative">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Loan Number, Customer Name or Mobile..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-green-500" />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map(l => (
                    <div key={l.loanNumber} onClick={() => handleSelectLoan(l)}
                      className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b last:border-0 text-sm">
                      <span className="font-bold text-gray-800">{l.loanNumber}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-gray-600">{l.customerName}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-xs text-gray-400">₹{parseFloat(l.loanAmount||0).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
            </div>

            {!selectedLoan ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                <p className="text-sm font-medium">Search and select a loan to process top-up</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="flex flex-col gap-4">

                {/* Customer Details */}
                <div className={card}>
                  <h3 className={sec}><FileText className="w-4 h-4" /> Customer &amp; Loan Details</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
<<<<<<< HEAD
                      ['Customer ID', selectedLoan.customerId || '—'],
                      ['Customer Name', selectedLoan.name],
                      ['Mobile Number', selectedLoan.mobileNo || selectedLoan.mobileNumber],
                      ['Aadhaar Number', selectedLoan.customerObjectId?.aadhaarNumber || selectedLoan.aadhaarNo || '—'],
                      ['Loan Number', selectedLoan.loanId],
                      ['Loan Date', selectedLoan.loanDate ? new Date(selectedLoan.loanDate).toLocaleDateString() : '—'],
                      ['Current Loan Amount', `₹${parseFloat(selectedLoan.loanAmount||0).toLocaleString('en-IN')}`],
                      ['Remaining Loan Amount', `₹${parseFloat(selectedLoan.remainingLoanAmount||0).toLocaleString('en-IN')}`],
=======
                      ['Customer ID', selectedLoan.customerId || selectedLoan.id || '—'],
                      ['Customer Name', selectedLoan.customerName],
                      ['Mobile Number', selectedLoan.mobileNumber],
                      ['Aadhaar Number', selectedLoan.aadhaarNo || '—'],
                      ['Loan Number', selectedLoan.loanNumber],
                      ['Loan Date', selectedLoan.loanDate || '—'],
                      ['Current Loan Amount', `₹${parseFloat(selectedLoan.loanAmount||0).toLocaleString('en-IN')}`],
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
                      ['Interest Rate', `${selectedLoan.interestRate || 0}%`],
                      ['Due Date', selectedLoan.dueDate || '—'],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <label className={lbl}>{label}</label>
                        <input className={`${inp} bg-gray-50`} value={val} readOnly />
                      </div>
                    ))}
                    <div>
                      <label className={lbl}>Loan Status</label>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${selectedLoan.status === 'Approved' || selectedLoan.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                        {selectedLoan.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gold Details */}
                <div className={card}>
                  <h3 className={sec}><span className="text-amber-500">⬡</span> Gold Details</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[
<<<<<<< HEAD
                      ['Ornament Type', selectedLoan.articles?.map(a => a.details).join(', ') || selectedLoan.ornamentType || '—'],
                      ['Total Gold Weight', `${selectedLoan.totalWt || selectedLoan.grossWeight || 0}g`],
                      ['Purity', selectedLoan.articles?.[0]?.purity || selectedLoan.purity || '22K'],
                      ['Current Gold Value', `₹${goldValue.toLocaleString('en-IN')}`],
=======
                      ['Ornament Type', selectedLoan.ornamentType || '—'],
                      ['Total Gold Weight', `${selectedLoan.grossWeight || 0}g`],
                      ['Purity', selectedLoan.purity || '22K'],
                      ['Current Gold Value', `₹${parseFloat(selectedLoan.goldValue||0).toLocaleString('en-IN')}`],
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
                    ].map(([label, val]) => (
                      <div key={label}>
                        <label className={lbl}>{label}</label>
                        <input className={`${inp} bg-gray-50`} value={val} readOnly />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Up Details */}
                <div className={card}>
                  <h3 className={sec}><RefreshCcw className="w-4 h-4" /> Top Up Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
<<<<<<< HEAD
                      <label className={lbl}>Current Loan Amount</label>
                      <input className={`${inp} bg-gray-50`} value={`₹${parseFloat(selectedLoan.loanAmount||0).toLocaleString('en-IN')}`} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>Remaining Loan Amount</label>
                      <input className={`${inp} bg-gray-50`} value={`₹${parseFloat(selectedLoan.remainingLoanAmount||0).toLocaleString('en-IN')}`} readOnly />
                    </div>
                    <div>
=======
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
                      <label className={lbl}>Eligible Top Up Amount</label>
                      <input className={`${inp} bg-emerald-50 text-emerald-700 font-bold`} value={`₹${eligibleTopUp.toLocaleString('en-IN')}`} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>Requested Top Up Amount <span className="text-red-500">*</span></label>
                      <input type="number" className={inp} value={form.requestedTopUpAmount} onChange={e => setForm(p=>({...p, requestedTopUpAmount: e.target.value}))} required />
                    </div>
                    <div>
                      <label className={lbl}>Approved Top Up Amount</label>
                      <input type="number" className={inp} value={form.approvedTopUpAmount} onChange={e => setForm(p=>({...p, approvedTopUpAmount: e.target.value}))} />
                    </div>
                    <div>
                      <label className={lbl}>Top Up Date</label>
                      <input type="date" className={inp} value={form.topUpDate} onChange={e => setForm(p=>({...p, topUpDate: e.target.value}))} />
                    </div>
                    <div>
                      <label className={lbl}>New Loan Amount</label>
                      <input className={`${inp} bg-blue-50 text-blue-700 font-bold`} value={`₹${newLoanAmount.toLocaleString('en-IN')}`} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>New Due Date</label>
                      <input type="date" className={inp} value={form.newDueDate} onChange={e => setForm(p=>({...p, newDueDate: e.target.value}))} />
                    </div>
                    <div>
                      <label className={lbl}>New Interest Rate (%)</label>
                      <input type="number" step="0.01" className={inp} value={form.newInterestRate} onChange={e => setForm(p=>({...p, newInterestRate: e.target.value}))} />
                    </div>
                    <div>
                      <label className={lbl}>Processing Fee</label>
                      <input type="number" className={inp} value={form.processingFee} onChange={e => setForm(p=>({...p, processingFee: e.target.value}))} />
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className={card}>
                  <h3 className={sec}><span>💳</span> Payment Details</h3>
                  <div className="flex gap-3 mb-3">
                    {['Cash', 'UPI', 'Bank Transfer'].map(mode => (
                      <label key={mode} onClick={() => setForm(p=>({...p, disbursementMode: mode}))}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border cursor-pointer text-sm font-semibold transition-all ${form.disbursementMode === mode ? 'bg-green-600 text-white border-green-600 shadow' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {mode}
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className={lbl}>Transaction Reference Number</label>
                    <input type="text" className={inp} value={form.transactionRef} onChange={e => setForm(p=>({...p, transactionRef: e.target.value}))} />
                  </div>
                </div>

                {/* Approval Details */}
                <div className={card}>
                  <h3 className={sec}><CheckCircle2 className="w-4 h-4" /> Approval Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Approval Status</label>
                      <select className={inp} value={form.approvalStatus} onChange={e => setForm(p=>({...p, approvalStatus: e.target.value}))}>
                        <option>Pending</option><option>Approved</option><option>Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Approved By</label>
                      <input type="text" className={inp} value={form.approvedBy} onChange={e => setForm(p=>({...p, approvedBy: e.target.value}))} />
                    </div>
                    <div>
                      <label className={lbl}>Approval Date</label>
                      <input type="date" className={inp} value={form.approvalDate} onChange={e => setForm(p=>({...p, approvalDate: e.target.value}))} />
                    </div>
                    <div>
                      <label className={lbl}>Remarks</label>
                      <input type="text" className={inp} value={form.remarks} onChange={e => setForm(p=>({...p, remarks: e.target.value}))} />
                    </div>
                  </div>
                </div>

                <button type="submit" className="flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm">
                  <Save className="w-4 h-4" /> Submit Top Up Request
                </button>
              </form>
            )}
          </div>

          {/* Right: Top Up History Panel */}
          <div className="flex flex-col gap-4 w-[40%] overflow-auto pb-4">
            <div className={`${card} flex-1`}>
              <h3 className={sec}><FileText className="w-4 h-4" /> Top Up History</h3>
              {!selectedLoan ? (
                <p className="text-sm text-gray-400 text-center py-8">Select a loan to view its top-up history.</p>
              ) : topUpHistory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No top-up requests recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {topUpHistory.map((t, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-1">
<<<<<<< HEAD
                        <span className="text-sm font-bold text-gray-800">+₹{parseFloat(t.topupAmount||0).toLocaleString('en-IN')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700`}>Approved</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <span>Requested: ₹{parseFloat(t.topupAmount||0).toLocaleString('en-IN')}</span>
                        <span className="mx-2">|</span>
                        <span>{new Date(t.topupDate).toLocaleDateString('en-IN')}</span>
=======
                        <span className="text-sm font-bold text-gray-800">+₹{parseFloat(t.approvedAmount||0).toLocaleString('en-IN')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.approvalStatus==='Approved'?'bg-green-100 text-green-700':t.approvalStatus==='Rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{t.approvalStatus}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <span>Requested: ₹{parseFloat(t.requestedAmount||0).toLocaleString('en-IN')}</span>
                        <span className="mx-2">|</span>
                        <span>{t.topUpDate}</span>
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
                      </div>
                      {t.remarks && <p className="text-xs text-gray-400 mt-1 italic">"{t.remarks}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopUpLoan;
