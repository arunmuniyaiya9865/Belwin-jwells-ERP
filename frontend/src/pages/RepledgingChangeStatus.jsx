import React, { useState, useEffect } from 'react';
import { Search, Save, RefreshCcw, History, FileText, ClipboardCheck, ChevronDown } from 'lucide-react';
import { getAllLoans, updateLoan } from '../utils/loanStore';
import toast from 'react-hot-toast';

const statusOptions = ['Pending', 'Active', 'Overdue', 'Repledged', 'Closed', 'Auction Ready', 'Auctioned'];

const statusColors = {
  Pending:      'bg-yellow-100 text-yellow-700 border-yellow-200',
  Active:       'bg-green-100 text-green-700 border-green-200',
  Overdue:      'bg-red-100 text-red-700 border-red-200',
  Repledged:    'bg-purple-100 text-purple-700 border-purple-200',
  Closed:       'bg-blue-100 text-blue-700 border-blue-200',
  'Auction Ready': 'bg-orange-100 text-orange-700 border-orange-200',
  Auctioned:    'bg-gray-200 text-gray-600 border-gray-300',
};

const emptyRepledge = {
  additionalLoanAmount: '', newInterestRate: '', newDueDate: '', repledgeDate: '',
  newStatus: 'Repledged', changedBy: '', remarks: '', approvalStatus: 'Pending',
  approvedBy: '', approvalDate: '', reasonForChange: ''
};

const RepledgingChangeStatus = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [form, setForm] = useState({ ...emptyRepledge });
  const [statusHistory, setStatusHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('repledge'); // repledge | reports

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

  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan);
    setSearchQuery('');
    setSearchResults([]);
    setForm({ ...emptyRepledge });
    setStatusHistory(loan.statusHistory || []);
  };

  const inp  = "w-full px-3 py-1.5 text-sm bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl  = "block text-xs font-semibold text-gray-600 mb-0.5";
  const card = "bg-white border border-gray-100 rounded-xl shadow-sm p-5";
  const sec  = "text-sm font-bold text-green-700 border-b border-gray-100 pb-1.5 mb-3 flex items-center gap-2";

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedLoan) return;
    const historyEntry = {
      oldStatus: selectedLoan.status || 'Pending',
      newStatus: form.newStatus,
      changedBy: form.changedBy || 'Admin',
      changedDate: new Date().toISOString().split('T')[0],
      remarks: form.remarks
    };
    const updatedLoan = {
      ...selectedLoan,
      status: form.newStatus,
      statusHistory: [...statusHistory, historyEntry]
    };
    updateLoan(updatedLoan);
    setSelectedLoan(updatedLoan);
    setStatusHistory(updatedLoan.statusHistory);
    toast.success('Loan status updated successfully!');
  };

  const allLoans = getAllLoans();
  const overdueLoans = allLoans.filter(l => l.status === 'Overdue');
  const auctionLoans = allLoans.filter(l => l.status === 'Auction Ready' || l.status === 'Auctioned');
  const repledgedLoans = allLoans.filter(l => l.status === 'Repledged');

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Title */}
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Repledging &amp; Change Status</h2>
          <p className="text-xs text-text-secondary mt-0.5">Manage loan repledging and update loan status with full history tracking.</p>
        </div>
        <div className="flex gap-2">
          {['repledge', 'reports'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === tab ? 'bg-green-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {tab === 'repledge' ? 'Repledge / Status' : 'Reports'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'reports' ? (
        /* ── REPORTS TAB ── */
        <div className="grid grid-cols-2 gap-5 overflow-auto pb-4">
          {/* Repledge History */}
          <div className={card}>
            <h3 className={sec}><History className="w-4 h-4" /> Repledge History</h3>
            {repledgedLoans.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No repledged loans found.</p> : (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 text-gray-500"><th className="p-2 text-left">Loan No</th><th className="p-2 text-left">Customer</th><th className="p-2 text-right">Amount</th></tr></thead>
                <tbody>{repledgedLoans.map(l => (
                  <tr key={l.loanNumber} className="border-t border-gray-50"><td className="p-2 font-medium">{l.loanNumber}</td><td className="p-2">{l.customerName}</td><td className="p-2 text-right">₹{parseFloat(l.loanAmount||0).toLocaleString('en-IN')}</td></tr>
                ))}</tbody>
              </table>
            )}
          </div>
          {/* Status Change History */}
          <div className={card}>
            <h3 className={sec}><ClipboardCheck className="w-4 h-4" /> Status Change History</h3>
            {selectedLoan && statusHistory.length > 0 ? (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 text-gray-500"><th className="p-2 text-left">Old</th><th className="p-2 text-left">New</th><th className="p-2 text-left">By</th><th className="p-2 text-left">Date</th></tr></thead>
                <tbody>{statusHistory.map((h, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="p-2"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[h.oldStatus] || 'bg-gray-100 text-gray-600'}`}>{h.oldStatus}</span></td>
                    <td className="p-2"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[h.newStatus] || 'bg-gray-100 text-gray-600'}`}>{h.newStatus}</span></td>
                    <td className="p-2">{h.changedBy}</td><td className="p-2">{h.changedDate}</td>
                  </tr>
                ))}</tbody>
              </table>
            ) : <p className="text-xs text-gray-400 text-center py-4">Select a loan to see status history.</p>}
          </div>
          {/* Overdue Customers */}
          <div className={card}>
            <h3 className={sec}><FileText className="w-4 h-4 text-red-600" /> Overdue Customers</h3>
            {overdueLoans.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No overdue loans.</p> : (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 text-gray-500"><th className="p-2 text-left">Loan No</th><th className="p-2 text-left">Customer</th><th className="p-2 text-left">Due Date</th><th className="p-2 text-right">Amount</th></tr></thead>
                <tbody>{overdueLoans.map(l => (
                  <tr key={l.loanNumber} className="border-t border-gray-50"><td className="p-2 font-medium text-red-600">{l.loanNumber}</td><td className="p-2">{l.customerName}</td><td className="p-2">{l.dueDate||'N/A'}</td><td className="p-2 text-right">₹{parseFloat(l.loanAmount||0).toLocaleString('en-IN')}</td></tr>
                ))}</tbody>
              </table>
            )}
          </div>
          {/* Auction Eligible Loans */}
          <div className={card}>
            <h3 className={sec}><FileText className="w-4 h-4 text-orange-600" /> Auction Eligible Loans</h3>
            {auctionLoans.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No auction eligible loans.</p> : (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 text-gray-500"><th className="p-2 text-left">Loan No</th><th className="p-2 text-left">Customer</th><th className="p-2 text-left">Status</th><th className="p-2 text-right">Amount</th></tr></thead>
                <tbody>{auctionLoans.map(l => (
                  <tr key={l.loanNumber} className="border-t border-gray-50"><td className="p-2 font-medium text-orange-600">{l.loanNumber}</td><td className="p-2">{l.customerName}</td><td className="p-2"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[l.status]||''}`}>{l.status}</span></td><td className="p-2 text-right">₹{parseFloat(l.loanAmount||0).toLocaleString('en-IN')}</td></tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* ── REPLEDGE / STATUS TAB ── */
        <div className="flex gap-5 flex-1 overflow-hidden">
          {/* Left: Search + Form */}
          <div className="flex flex-col gap-4 w-[55%] overflow-auto pb-4">
            {/* Search */}
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
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[l.status] || 'bg-gray-100 text-gray-500'}`}>{l.status || 'Pending'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!selectedLoan ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                <p className="text-sm font-medium">Search and select a loan to manage repledging</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                {/* Repledging Details */}
                <div className={card}>
                  <h3 className={sec}><RefreshCcw className="w-4 h-4" /> Repledging Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Existing Loan Number</label>
                      <input className={`${inp} bg-gray-50`} value={selectedLoan.loanNumber} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>Customer Name</label>
                      <input className={`${inp} bg-gray-50`} value={selectedLoan.customerName} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>Current Loan Amount</label>
                      <input className={`${inp} bg-gray-50`} value={`₹${parseFloat(selectedLoan.loanAmount||0).toLocaleString('en-IN')}`} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>Outstanding Amount</label>
                      <input className={`${inp} bg-gray-50`} value={`₹${parseFloat(selectedLoan.loanAmount||0).toLocaleString('en-IN')}`} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>Additional Loan Amount</label>
                      <input type="number" className={inp} value={form.additionalLoanAmount} onChange={e => setForm(p=>({...p, additionalLoanAmount: e.target.value}))} />
                    </div>
                    <div>
                      <label className={lbl}>New Interest Rate (%)</label>
                      <input type="number" step="0.01" className={inp} value={form.newInterestRate} onChange={e => setForm(p=>({...p, newInterestRate: e.target.value}))} />
                    </div>
                    <div>
                      <label className={lbl}>New Due Date</label>
                      <input type="date" className={inp} value={form.newDueDate} onChange={e => setForm(p=>({...p, newDueDate: e.target.value}))} />
                    </div>
                    <div>
                      <label className={lbl}>Repledge Date</label>
                      <input type="date" className={inp} value={form.repledgeDate} onChange={e => setForm(p=>({...p, repledgeDate: e.target.value}))} />
                    </div>
                  </div>
                </div>

                {/* Loan Status Change */}
                <div className={card}>
                  <h3 className={sec}><ChevronDown className="w-4 h-4" /> Loan Status Change</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {statusOptions.map(s => (
                      <label key={s} onClick={() => setForm(p=>({...p, newStatus: s}))}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm font-medium ${form.newStatus === s ? statusColors[s] + ' ring-1 ring-offset-1 ring-green-400' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${form.newStatus === s ? 'border-current' : 'border-gray-300'}`}>
                          {form.newStatus === s && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                        </span>
                        {s}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Approval Details */}
                <div className={card}>
                  <h3 className={sec}><ClipboardCheck className="w-4 h-4" /> Approval &amp; Remarks</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Changed By</label>
                      <input type="text" className={inp} value={form.changedBy} onChange={e => setForm(p=>({...p, changedBy: e.target.value}))} placeholder="Officer Name" />
                    </div>
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
                      <label className={lbl}>Reason for Change</label>
                      <input type="text" className={inp} value={form.reasonForChange} onChange={e => setForm(p=>({...p, reasonForChange: e.target.value}))} />
                    </div>
                    <div>
                      <label className={lbl}>Remarks</label>
                      <input type="text" className={inp} value={form.remarks} onChange={e => setForm(p=>({...p, remarks: e.target.value}))} />
                    </div>
                  </div>
                </div>

                <button type="submit" className="flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </form>
            )}
          </div>

          {/* Right: Status History Panel */}
          <div className="flex flex-col gap-4 w-[45%] overflow-auto pb-4">
            <div className={`${card} flex-1`}>
              <h3 className={sec}><History className="w-4 h-4" /> Status History</h3>
              {!selectedLoan ? (
                <p className="text-sm text-gray-400 text-center py-8">Select a loan to view its status history.</p>
              ) : statusHistory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No status changes recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {statusHistory.map((h, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-3 bg-gray-50 text-sm">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusColors[h.oldStatus]||'bg-gray-100 text-gray-600'}`}>{h.oldStatus}</span>
                        <span className="text-gray-400">→</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusColors[h.newStatus]||'bg-gray-100 text-gray-600'}`}>{h.newStatus}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>By: <span className="font-medium text-gray-700">{h.changedBy}</span></span>
                        <span>{h.changedDate}</span>
                      </div>
                      {h.remarks && <p className="text-xs text-gray-500 mt-1 italic">"{h.remarks}"</p>}
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

export default RepledgingChangeStatus;
