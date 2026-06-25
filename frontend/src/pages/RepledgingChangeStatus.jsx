import React, { useState, useEffect } from 'react';
import { Search, Save, RefreshCcw, History, FileText, ClipboardCheck, ChevronDown } from 'lucide-react';
import { getLoanById } from '../services/loanService';
import { createRepledge, getRepledgesByLoan, getAllRepledges } from '../services/repledgeService';
import toast, { Toaster } from 'react-hot-toast';

const statusOptions = ['Pending', 'Active', 'Overdue', 'Repledged', 'Closed', 'Auction Ready', 'Auctioned'];

const statusColors = {
  Pending:        'bg-yellow-100 text-yellow-700 border-yellow-200',
  Active:         'bg-green-100 text-green-700 border-green-200',
  Overdue:        'bg-red-100 text-red-700 border-red-200',
  Repledged:      'bg-purple-100 text-purple-700 border-purple-200',
  Closed:         'bg-blue-100 text-blue-700 border-blue-200',
  'Auction Ready':'bg-orange-100 text-orange-700 border-orange-200',
  Auctioned:      'bg-gray-200 text-gray-600 border-gray-300',
};

const emptyRepledge = {
  additionalLoanAmount: '', newInterestRate: '', newDueDate: '', repledgeDate: '',
  newStatus: 'Repledged', changedBy: '', remarks: '', approvalStatus: 'Pending',
  approvedBy: '', approvalDate: '', reasonForChange: ''
};

const RepledgingChangeStatus = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [form, setForm] = useState({ ...emptyRepledge });
  const [statusHistory, setStatusHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('repledge');

  // Reports tab state
  const [allRepledges, setAllRepledges] = useState([]);

  // Load all repledges for the Reports tab
  useEffect(() => {
    if (activeTab === 'reports') {
      getAllRepledges().then(setAllRepledges).catch(() => setAllRepledges([]));
    }
  }, [activeTab]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a Loan ID (e.g. LOAN000001)');
      return;
    }
    setIsSearching(true);
    try {
      const loan = await getLoanById(searchQuery.trim().toUpperCase());
      if (!loan) {
        toast.error('Loan not found');
        return;
      }
      setSelectedLoan(loan);
      setForm({ ...emptyRepledge });

      // Fetch existing repledge/status history for this loan
      const history = await getRepledgesByLoan(loan.loanId);
      setStatusHistory(history);
      toast.success(`Loan ${loan.loanId} loaded`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching loan');
      setSelectedLoan(null);
      setStatusHistory([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;

    if (selectedLoan.status === 'Closed') {
      toast.error('Cannot change status of a Closed loan');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        loanId: selectedLoan.loanId,
        newStatus: form.newStatus,
        additionalLoanAmount: form.additionalLoanAmount,
        newInterestRate: form.newInterestRate,
        newDueDate: form.newDueDate,
        repledgeDate: form.repledgeDate,
        changedBy: form.changedBy,
        approvalStatus: form.approvalStatus,
        approvedBy: form.approvedBy,
        approvalDate: form.approvalDate,
        reasonForChange: form.reasonForChange,
        remarks: form.remarks
      };

      const result = await createRepledge(payload);

      // Update local state
      setSelectedLoan(result.loan);
      setStatusHistory(prev => [result.repledge, ...prev]);
      setForm({ ...emptyRepledge });
      toast.success(`Status changed to ${form.newStatus}! (${result.repledge.repledgeId})`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  const inp  = "w-full px-3 py-1.5 text-sm bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl  = "block text-xs font-semibold text-gray-600 mb-0.5";
  const card = "bg-white border border-gray-100 rounded-xl shadow-sm p-5";
  const sec  = "text-sm font-bold text-green-700 border-b border-gray-100 pb-1.5 mb-3 flex items-center gap-2";

  // Group repledges by status for reports tab
  const repledgedHistory = allRepledges.filter(r => r.newStatus === 'Repledged');
  const overdueHistory   = allRepledges.filter(r => r.newStatus === 'Overdue');
  const auctionHistory   = allRepledges.filter(r => r.newStatus === 'Auction Ready' || r.newStatus === 'Auctioned');

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      <Toaster position="top-right" />
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
            <h3 className={sec}><History className="w-4 h-4" /> Repledge History ({repledgedHistory.length})</h3>
            {repledgedHistory.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No repledged loans found.</p> : (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 text-gray-500"><th className="p-2 text-left">Rep ID</th><th className="p-2 text-left">Loan</th><th className="p-2 text-left">Customer</th><th className="p-2 text-right">Amount</th></tr></thead>
                <tbody>{repledgedHistory.map(r => (
                  <tr key={r.repledgeId} className="border-t border-gray-50">
                    <td className="p-2 font-mono text-green-700">{r.repledgeId}</td>
                    <td className="p-2 font-medium">{r.loanId}</td>
                    <td className="p-2">{r.customerName}</td>
                    <td className="p-2 text-right">₹{parseFloat(r.oldLoanAmount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>

          {/* Status Change History */}
          <div className={card}>
            <h3 className={sec}><ClipboardCheck className="w-4 h-4" /> All Status Changes ({allRepledges.length})</h3>
            {allRepledges.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No status changes recorded yet.</p> : (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 text-gray-500"><th className="p-2 text-left">Loan</th><th className="p-2 text-left">Old</th><th className="p-2 text-left">New</th><th className="p-2 text-left">By</th></tr></thead>
                <tbody>{allRepledges.map((r, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="p-2 font-medium">{r.loanId}</td>
                    <td className="p-2"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[r.oldStatus] || 'bg-gray-100 text-gray-600'}`}>{r.oldStatus}</span></td>
                    <td className="p-2"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[r.newStatus] || 'bg-gray-100 text-gray-600'}`}>{r.newStatus}</span></td>
                    <td className="p-2">{r.changedBy || '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>

          {/* Overdue */}
          <div className={card}>
            <h3 className={sec}><FileText className="w-4 h-4 text-red-600" /> Overdue Status Changes ({overdueHistory.length})</h3>
            {overdueHistory.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No overdue loans.</p> : (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 text-gray-500"><th className="p-2 text-left">Loan</th><th className="p-2 text-left">Customer</th><th className="p-2 text-left">Date</th><th className="p-2 text-right">Amount</th></tr></thead>
                <tbody>{overdueHistory.map(r => (
                  <tr key={r.repledgeId} className="border-t border-gray-50">
                    <td className="p-2 font-medium text-red-600">{r.loanId}</td>
                    <td className="p-2">{r.customerName}</td>
                    <td className="p-2">{r.repledgeDate ? new Date(r.repledgeDate).toLocaleDateString() : '—'}</td>
                    <td className="p-2 text-right">₹{parseFloat(r.oldLoanAmount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>

          {/* Auction */}
          <div className={card}>
            <h3 className={sec}><FileText className="w-4 h-4 text-orange-600" /> Auction Eligible ({auctionHistory.length})</h3>
            {auctionHistory.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No auction eligible loans.</p> : (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 text-gray-500"><th className="p-2 text-left">Loan</th><th className="p-2 text-left">Customer</th><th className="p-2 text-left">Status</th><th className="p-2 text-right">Amount</th></tr></thead>
                <tbody>{auctionHistory.map(r => (
                  <tr key={r.repledgeId} className="border-t border-gray-50">
                    <td className="p-2 font-medium text-orange-600">{r.loanId}</td>
                    <td className="p-2">{r.customerName}</td>
                    <td className="p-2"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[r.newStatus] || ''}`}>{r.newStatus}</span></td>
                    <td className="p-2 text-right">₹{parseFloat(r.oldLoanAmount || 0).toLocaleString('en-IN')}</td>
                  </tr>
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
            {/* Search by Loan ID */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                  placeholder="Enter Loan ID (e.g. LOAN000001)..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-green-500 font-mono"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-5 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition shadow-sm disabled:opacity-50"
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </div>

            {!selectedLoan ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white/50 min-h-[200px]">
                <p className="text-sm font-medium">Enter a Loan ID and search to manage repledging</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                {/* Repledging Details */}
                <div className={card}>
                  <h3 className={sec}><RefreshCcw className="w-4 h-4" /> Repledging Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Existing Loan ID</label>
                      <input className={`${inp} bg-gray-50 font-mono font-bold text-green-700`} value={selectedLoan.loanId} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>Customer Name</label>
                      <input className={`${inp} bg-gray-50`} value={selectedLoan.name || '—'} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>Current Loan Amount</label>
                      <input className={`${inp} bg-gray-50`} value={`₹${parseFloat(selectedLoan.loanAmount || 0).toLocaleString('en-IN')}`} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>Remaining Amount</label>
                      <input className={`${inp} bg-gray-50 text-red-600 font-semibold`} value={`₹${parseFloat(selectedLoan.remainingLoanAmount || 0).toLocaleString('en-IN')}`} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>Additional Loan Amount</label>
                      <input type="number" className={inp} value={form.additionalLoanAmount} onChange={e => setForm(p => ({ ...p, additionalLoanAmount: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>New Interest Rate (%)</label>
                      <input type="number" step="0.01" className={inp} value={form.newInterestRate} onChange={e => setForm(p => ({ ...p, newInterestRate: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>New Due Date</label>
                      <input type="date" className={inp} value={form.newDueDate} onChange={e => setForm(p => ({ ...p, newDueDate: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>Repledge Date</label>
                      <input type="date" className={inp} value={form.repledgeDate} onChange={e => setForm(p => ({ ...p, repledgeDate: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* Loan Status Change */}
                <div className={card}>
                  <h3 className={sec}><ChevronDown className="w-4 h-4" /> Loan Status Change
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[selectedLoan.status] || 'bg-gray-100 text-gray-600'}`}>
                      Current: {selectedLoan.status}
                    </span>
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {statusOptions.map(s => (
                      <label key={s} onClick={() => setForm(p => ({ ...p, newStatus: s }))}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm font-medium ${form.newStatus === s ? (statusColors[s] || 'bg-gray-100') + ' ring-1 ring-offset-1 ring-green-400' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${form.newStatus === s ? 'border-current' : 'border-gray-300'}`}>
                          {form.newStatus === s && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                        </span>
                        {s}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Approval & Remarks */}
                <div className={card}>
                  <h3 className={sec}><ClipboardCheck className="w-4 h-4" /> Approval &amp; Remarks</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Changed By</label>
                      <input type="text" className={inp} value={form.changedBy} onChange={e => setForm(p => ({ ...p, changedBy: e.target.value }))} placeholder="Officer Name" />
                    </div>
                    <div>
                      <label className={lbl}>Approval Status</label>
                      <select className={inp} value={form.approvalStatus} onChange={e => setForm(p => ({ ...p, approvalStatus: e.target.value }))}>
                        <option>Pending</option><option>Approved</option><option>Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Approved By</label>
                      <input type="text" className={inp} value={form.approvedBy} onChange={e => setForm(p => ({ ...p, approvedBy: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>Approval Date</label>
                      <input type="date" className={inp} value={form.approvalDate} onChange={e => setForm(p => ({ ...p, approvalDate: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>Reason for Change</label>
                      <input type="text" className={inp} value={form.reasonForChange} onChange={e => setForm(p => ({ ...p, reasonForChange: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>Remarks</label>
                      <input type="text" className={inp} value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving || selectedLoan.status === 'Closed'}
                  className="flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : selectedLoan.status === 'Closed' ? 'Loan is Closed' : 'Save Changes'}
                </button>
              </form>
            )}
          </div>

          {/* Right: Status History Panel */}
          <div className="flex flex-col gap-4 w-[45%] overflow-auto pb-4">
            <div className={`${card} flex-1`}>
              <h3 className={sec}><History className="w-4 h-4" /> Status History
                {statusHistory.length > 0 && <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{statusHistory.length} records</span>}
              </h3>
              {!selectedLoan ? (
                <p className="text-sm text-gray-400 text-center py-8">Select a loan to view its status history.</p>
              ) : statusHistory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No status changes recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {statusHistory.map((h, i) => (
                    <div key={h.repledgeId || i} className="border border-gray-100 rounded-lg p-3 bg-gray-50 text-sm">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusColors[h.oldStatus] || 'bg-gray-100 text-gray-600'}`}>{h.oldStatus}</span>
                        <span className="text-gray-400">→</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusColors[h.newStatus] || 'bg-gray-100 text-gray-600'}`}>{h.newStatus}</span>
                        <span className="ml-auto font-mono text-[10px] text-gray-400">{h.repledgeId}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>By: <span className="font-medium text-gray-700">{h.changedBy || '—'}</span></span>
                        <span>{h.repledgeDate ? new Date(h.repledgeDate).toLocaleDateString() : '—'}</span>
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
