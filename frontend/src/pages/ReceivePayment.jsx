<<<<<<< HEAD
import React, { useState } from 'react';
import { Search, Save, Printer, Banknote, User, FileText, IndianRupee, CheckCircle, AlertCircle } from 'lucide-react';
import { getLoanById } from '../services/loanService';
import { createPayment } from '../services/paymentService';
=======
import React, { useState, useEffect } from 'react';
import { Search, Save, Printer, Banknote, User, FileText, IndianRupee } from 'lucide-react';
import { getAllLoans } from '../utils/loanStore';
import { savePayment } from '../utils/paymentStore';
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
import toast from 'react-hot-toast';

const ReceivePayment = () => {
  const [searchQuery, setSearchQuery] = useState('');
<<<<<<< HEAD
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [lastReceipt, setLastReceipt] = useState(null); // { paymentId, loanId, amount }
=======
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6

  const emptyForm = {
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: 'Interest Payment',
    amountReceived: '',
    interestAmount: '',
    principalAmount: '',
    penaltyAmount: '',
    paymentMode: 'Cash',
    transactionRef: '',
    collectedBy: 'Admin',
    remarks: ''
  };

  const [form, setForm] = useState({ ...emptyForm });

<<<<<<< HEAD
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a Loan ID');
      return;
    }
    
    setIsSearching(true);
    setLastReceipt(null);
    try {
      const loan = await getLoanById(searchQuery.trim().toUpperCase());
      if (!loan) {
        toast.error('Loan not found');
        return;
      }
      // Guard: cannot receive payment for a closed loan
      if (loan.status === 'Closed') {
        toast.error(`Loan ${loan.loanId} is already Closed. No further payments accepted.`);
        setSelectedLoan(null);
        return;
      }
      setSelectedLoan(loan);
      setForm({ ...emptyForm });
      toast.success(`Loan data loaded: ${loan.loanId}`);

      // Logging for debugging — check browser console for full API response
      console.log('[ReceivePayment] Full loan response:', loan);
      console.log('[ReceivePayment] Financial field mapping:', {
        loanId:                  loan.loanId,
        customerId:              loan.customerId,
        name:                    loan.name,
        status:                  loan.status,
        loanDate:                loan.loanDate,
        loanAmount:              loan.loanAmount,
        remainingLoanAmount:     loan.remainingLoanAmount,
        interestRate:            loan.interestRate,
        remainingInterestAmount: loan.remainingInterestAmount,
        totalPaidInterestAmount: loan.totalPaidInterestAmount,
        totalNoOfDays:           loan.totalNoOfDays,
        remainingDays:           loan.remainingDays,
        fullSettlementAmount:    loan.fullSettlementAmount,
        documentCharge:          loan.documentCharge,
      });
    } catch (error) {
      const msg = error.response?.data?.message || 'Error fetching loan';
      console.error('[ReceivePayment] Loan search error:', error.response?.data || error.message);
      toast.error(msg);
      setSelectedLoan(null);
    } finally {
      setIsSearching(false);
    }
  };

  const doSave = async (printAfter = false) => {
    if (!selectedLoan) return toast.error('Please select a loan first.');
    const amount = parseFloat(form.amountReceived);
    if (!form.amountReceived || isNaN(amount) || amount <= 0) {
      return toast.error('Please enter a valid amount received.');
    }

    setIsSaving(true);
    try {
      const paymentData = {
        loanId: selectedLoan.loanId,
        customerId: selectedLoan.customerId,
        paymentType: form.paymentType,
        paymentAmount: amount,
        principalAmount: parseFloat(form.principalAmount) || 0,
        interestAmount: parseFloat(form.interestAmount) || 0,
        penaltyAmount: parseFloat(form.penaltyAmount) || 0,
        paymentDate: form.paymentDate,
        paymentMode: form.paymentMode,
        transactionRef: form.transactionRef,
        collectedBy: form.collectedBy,
        remarks: form.remarks
      };

      console.log('[ReceivePayment] Submitting payment:', paymentData);
      const response = await createPayment(paymentData);
      const receiptId = response.payment?.paymentId;
      const newStatus = response.loan?.status;

      console.log('[ReceivePayment] Payment saved:', { receiptId, newStatus });
      toast.success(`Payment saved! Receipt: ${receiptId}`);

      setLastReceipt({
        paymentId: receiptId,
        loanId: selectedLoan.loanId,
        amount: amount,
        newStatus
      });

      // Reset form but keep loan selected so more payments can be added
      setForm({ ...emptyForm });

      // Update remaining amount in selected loan display
      setSelectedLoan(prev => ({
        ...prev,
        remainingLoanAmount: response.loan?.remainingLoanAmount ?? prev.remainingLoanAmount,
        status: newStatus || prev.status
      }));

      if (printAfter) {
        setTimeout(() => window.print(), 500);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error saving payment';
      console.error('[ReceivePayment] Payment save error:', error.response?.data || error.message);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSave(false);
  };

  const handleSaveAndPrint = () => {
    doSave(true);
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

  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan);
    setSearchQuery('');
    setSearchResults([]);
    setForm({ ...emptyForm });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedLoan) return toast.error('Please select a loan first.');
    if (!form.amountReceived) return toast.error('Please enter the amount received.');

    const paymentData = {
      ...form,
      customerId: selectedLoan.customerId || selectedLoan.id,
      customerName: selectedLoan.customerName,
      loanNumber: selectedLoan.loanNumber,
      mobileNumber: selectedLoan.mobileNumber,
      timestamp: new Date().toISOString()
    };

    savePayment(paymentData);
    toast.success('Payment received successfully!');
    setSelectedLoan(null);
    setForm({ ...emptyForm });
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
  };

  const inp = "w-full px-3 py-2 text-sm bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-xs font-semibold text-gray-600 mb-1";
  const card = "bg-white border border-gray-100 rounded-xl shadow-sm p-5";
  const sec = "text-sm font-bold text-green-700 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2";

  return (
<<<<<<< HEAD
    <div className="flex flex-col h-full w-full mx-auto">
=======
    <div className="flex flex-col h-full max-w-5xl mx-auto">
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
      {/* Title */}
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Receive Payment</h2>
<<<<<<< HEAD
          <p className="text-sm text-text-secondary mt-1">Process and record incoming customer payments. Payments cannot be edited after saving.</p>
        </div>
      </div>

      {/* Success Banner */}
      {lastReceipt && (
        <div className="mb-4 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">Payment Recorded Successfully</p>
            <p className="text-xs text-green-700 mt-0.5">
              Receipt No: <span className="font-mono font-bold">{lastReceipt.paymentId}</span> &nbsp;|&nbsp;
              Loan: <span className="font-mono font-bold">{lastReceipt.loanId}</span> &nbsp;|&nbsp;
              Amount: <span className="font-bold">₹{lastReceipt.amount.toLocaleString('en-IN')}</span>
              {lastReceipt.newStatus === 'Closed' && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase">
                  Loan Closed ✓
                </span>
              )}
            </p>
            <p className="text-[10px] text-green-600 mt-1">
              <AlertCircle className="inline w-3 h-3 mr-1" />
              This payment is permanent and cannot be edited. Contact Admin for reversal.
            </p>
          </div>
        </div>
      )}

=======
          <p className="text-sm text-text-secondary mt-1">Process and record incoming customer payments.</p>
        </div>
      </div>

>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
      <div className="flex gap-6 items-start">
        {/* Left Side: Search & Basic Details */}
        <div className="w-[35%] flex flex-col gap-6">
          
<<<<<<< HEAD
          <div className="relative flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="Search Loan ID (e.g. LOAN000001)..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-green-500 font-medium"
            />
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSearching ? '...' : 'Search'}
            </button>
          </div>

          <div className={card}>
            <h3 className={sec}><User className="w-4 h-4" /> Loan Details</h3>
            {!selectedLoan ? (
              <div className="text-center py-8 text-sm text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
                Search a Loan ID above to begin
=======
          <div className="relative">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Loan No, Name or Mobile..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-green-500 font-medium" />
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {searchResults.map(l => (
                  <div key={l.loanNumber} onClick={() => handleSelectLoan(l)}
                    className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b last:border-0 text-sm">
                    <div className="font-bold text-gray-800">{l.customerName} <span className="text-gray-400 font-normal">({l.mobileNumber})</span></div>
                    <div className="text-green-700 font-semibold mt-1">Loan: {l.loanNumber}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={card}>
            <h3 className={sec}><User className="w-4 h-4" /> Basic Details</h3>
            {!selectedLoan ? (
              <div className="text-center py-8 text-sm text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
                Select a loan to view details
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Receipt No</label>
                  <input className={`${inp} bg-gray-50 font-mono text-gray-500`} value="Auto Generated on Save" readOnly />
                </div>
                <div>
                  <label className={lbl}>Payment Date</label>
                  <input type="date" className={inp} value={form.paymentDate} onChange={e => setForm(p => ({ ...p, paymentDate: e.target.value }))} />
                </div>
                <div>
                  <label className={lbl}>Customer ID</label>
<<<<<<< HEAD
                  <input className={`${inp} bg-gray-50`} value={selectedLoan.customerId || 'N/A'} readOnly />
                </div>
                <div>
                  <label className={lbl}>Customer Name</label>
                  <input className={`${inp} bg-gray-50 font-bold`} value={selectedLoan.name || 'N/A'} readOnly />
                </div>
                <div>
                  <label className={lbl}>Loan Number</label>
                  <input className={`${inp} bg-emerald-50 text-emerald-800 font-bold`} value={selectedLoan.loanId} readOnly />
                </div>
                <div>
                  <label className={lbl}>Loan Date</label>
                  <input className={`${inp} bg-gray-50`} value={selectedLoan.loanDate ? new Date(selectedLoan.loanDate).toLocaleDateString('en-IN') : 'N/A'} readOnly />
                </div>
                <div>
                  <label className={lbl}>Status</label>
                  <input className={`${inp} bg-gray-50 font-bold ${
                    selectedLoan.status === 'Approved' || selectedLoan.status === 'Active' ? 'text-green-600' :
                    selectedLoan.status === 'Overdue' ? 'text-red-600' : 'text-gray-700'
                  }`} value={selectedLoan.status} readOnly />
                </div>
                <div>
                  <label className={lbl}>Interest Rate</label>
                  <input className={`${inp} bg-gray-50`} value={`${selectedLoan.interestRate ?? 0}% per month`} readOnly />
                </div>

                {/* ── Financial Summary Grid ─────────────────────── */}
                <div className="mt-2 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Financial Summary
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
                    <div className="px-3 py-2.5">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Total Loan</span>
                      <span className="text-sm font-bold text-gray-800">₹{(selectedLoan.loanAmount ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="px-3 py-2.5">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Remaining Principal</span>
                      <span className="text-sm font-bold text-red-600">₹{(selectedLoan.remainingLoanAmount ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="px-3 py-2.5">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Interest Paid</span>
                      <span className="text-sm font-bold text-green-700">₹{(selectedLoan.totalPaidInterestAmount ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="px-3 py-2.5">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Remaining Interest</span>
                      <span className="text-sm font-bold text-amber-600">₹{(selectedLoan.remainingInterestAmount ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="px-3 py-2.5">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Loan Period</span>
                      <span className="text-sm font-bold text-gray-700">{selectedLoan.totalNoOfDays ?? 0} days</span>
                    </div>
                    <div className="px-3 py-2.5">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Remaining Days</span>
                      <span className={`text-sm font-bold ${(selectedLoan.remainingDays ?? 0) < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                        {selectedLoan.remainingDays ?? 0} days
                      </span>
                    </div>
                    <div className="col-span-2 px-3 py-2.5 bg-emerald-50">
                      <span className="block text-[10px] text-emerald-700 font-bold uppercase tracking-wide">Full Settlement Amount</span>
                      <span className="text-base font-extrabold text-emerald-800">₹{(selectedLoan.fullSettlementAmount ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
=======
                  <input className={`${inp} bg-gray-50`} value={selectedLoan.customerId || selectedLoan.id || 'N/A'} readOnly />
                </div>
                <div>
                  <label className={lbl}>Customer Name</label>
                  <input className={`${inp} bg-gray-50 font-bold`} value={selectedLoan.customerName} readOnly />
                </div>
                <div>
                  <label className={lbl}>Loan Number</label>
                  <input className={`${inp} bg-emerald-50 text-emerald-800 font-bold`} value={selectedLoan.loanNumber} readOnly />
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="w-[65%] flex flex-col gap-6">
<<<<<<< HEAD
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
=======
          <form onSubmit={handleSave} className="flex flex-col gap-6">
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
            
            {/* Payment Details */}
            <div className={card}>
              <h3 className={sec}><IndianRupee className="w-4 h-4" /> Payment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={lbl}>Payment Type</label>
                  <select className={inp} value={form.paymentType} onChange={e => setForm(p => ({ ...p, paymentType: e.target.value }))}>
                    <option>Interest Payment</option>
                    <option>Principal Payment</option>
                    <option>Part Payment</option>
                    <option>Full Settlement</option>
                    <option>Penalty Payment</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Amount Received <span className="text-red-500">*</span></label>
<<<<<<< HEAD
                  <input
                    type="number"
                    className={`${inp} text-lg font-bold text-green-700`}
                    required
                    min="1"
                    step="0.01"
                    value={form.amountReceived}
                    onChange={e => setForm(p => ({ ...p, amountReceived: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={lbl}>Interest Amount</label>
                  <input type="number" min="0" step="0.01" className={inp} value={form.interestAmount} onChange={e => setForm(p => ({ ...p, interestAmount: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label className={lbl}>Principal Amount</label>
                  <input type="number" min="0" step="0.01" className={inp} value={form.principalAmount} onChange={e => setForm(p => ({ ...p, principalAmount: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label className={lbl}>Penalty Amount</label>
                  <input type="number" min="0" step="0.01" className={inp} value={form.penaltyAmount} onChange={e => setForm(p => ({ ...p, penaltyAmount: e.target.value }))} placeholder="0.00" />
=======
                  <input type="number" className={`${inp} text-lg font-bold text-green-700`} required value={form.amountReceived} onChange={e => setForm(p => ({ ...p, amountReceived: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label className={lbl}>Interest Amount</label>
                  <input type="number" className={inp} value={form.interestAmount} onChange={e => setForm(p => ({ ...p, interestAmount: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label className={lbl}>Principal Amount</label>
                  <input type="number" className={inp} value={form.principalAmount} onChange={e => setForm(p => ({ ...p, principalAmount: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label className={lbl}>Penalty Amount</label>
                  <input type="number" className={inp} value={form.penaltyAmount} onChange={e => setForm(p => ({ ...p, penaltyAmount: e.target.value }))} placeholder="0.00" />
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
                </div>
              </div>
            </div>

            {/* Payment Mode */}
            <div className={card}>
              <h3 className={sec}><Banknote className="w-4 h-4" /> Payment Mode</h3>
              <div className="grid grid-cols-3 gap-3">
                {['Cash', 'UPI', 'Bank Transfer', 'Debit Card', 'Credit Card', 'Cheque'].map(mode => (
                  <label key={mode} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border cursor-pointer text-sm font-semibold transition-all ${form.paymentMode === mode ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                    <input type="radio" name="paymentMode" className="hidden" checked={form.paymentMode === mode} onChange={() => setForm(p => ({ ...p, paymentMode: mode }))} />
                    {mode}
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className={card}>
              <h3 className={sec}><FileText className="w-4 h-4" /> Additional Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Transaction Reference No</label>
                  <input type="text" className={inp} value={form.transactionRef} onChange={e => setForm(p => ({ ...p, transactionRef: e.target.value }))} placeholder="Txn ID / Cheque No" />
                </div>
                <div>
                  <label className={lbl}>Collected By</label>
                  <input type="text" className={inp} value={form.collectedBy} onChange={e => setForm(p => ({ ...p, collectedBy: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Remarks</label>
                  <input type="text" className={inp} value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} placeholder="Any notes regarding this payment..." />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
<<<<<<< HEAD
              <button
                type="button"
                disabled={isSaving || !selectedLoan}
                onClick={handleSaveAndPrint}
                className="flex-1 py-3 bg-white text-green-700 font-bold rounded-xl border-2 border-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-5 h-5" /> Save &amp; Print Receipt
              </button>
              <button
                type="submit"
                disabled={isSaving || !selectedLoan}
                className="flex-[2] py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-900 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <><span className="animate-spin">⟳</span> Saving...</>
                ) : (
                  <><Save className="w-5 h-5" /> Save Payment</>
                )}
=======
              <button type="button" className="flex-1 py-3 bg-white text-green-700 font-bold rounded-xl border-2 border-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-2">
                <Printer className="w-5 h-5" /> Save & Print Receipt
              </button>
              <button type="submit" className="flex-[2] py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-900 transition-all shadow-lg flex items-center justify-center gap-2">
                <Save className="w-5 h-5" /> Save Payment Details
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceivePayment;
