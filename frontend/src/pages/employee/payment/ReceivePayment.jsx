import React, { useState } from 'react';
import { Save, Printer, Banknote, User, FileText, IndianRupee, CheckCircle, AlertCircle } from 'lucide-react';
import { createPayment } from '../../../services/paymentService';
import { useLoanSearch } from '../../../hooks/useLoanSearch';
import LoanSearchBox from '../../../components/shared/LoanSearchBox';
import LoanSelectionList from '../../../components/shared/LoanSelectionList';
import toast from 'react-hot-toast';

const ReceivePayment = () => {
  const { searchLoans, loading: isSearching, results, searchType, clearSearch } = useLoanSearch();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [lastReceipt, setLastReceipt] = useState(null); // { paymentId, loanId, amount }

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

  const handleSearch = async (searchValue) => {
    setLastReceipt(null);
    setSelectedLoan(null);
    const data = await searchLoans(searchValue);
    if (data && data.count === 1) {
      handleSelectLoan(data.results[0].loan);
    }
  };

  const handleSelectLoan = (loanData) => {
      // For phone search, it might pass loan ID string from LoanSelectionList or the object itself
      let loanObj = typeof loanData === 'string' 
        ? results.find(r => r.loan.loanId === loanData)?.loan 
        : loanData;
      
      if (!loanObj) return;

      if (loanObj.status === 'Closed') {
        toast.error(`Loan ${loanObj.loanId} is already Closed. No further payments accepted.`);
        return;
      }
      setSelectedLoan(loanObj);
      setForm({ ...emptyForm });
      toast.success(`Loan data loaded: ${loanObj.loanId}`);
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
  };

  const inp = "w-full px-3 py-2 text-sm bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-xs font-semibold text-gray-600 mb-1";
  const card = "bg-white border border-gray-100 rounded-xl shadow-sm p-5";
  const sec = "text-sm font-bold text-green-700 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2";

  return (
    <div className="flex flex-col h-full w-full mx-auto">
      {/* Title */}
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Receive Payment</h2>
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

      {/* Search component */}
      {!selectedLoan && (
          <div className="mb-6">
              <LoanSearchBox onSearch={handleSearch} loading={isSearching} />
              {results.length > 1 && (
                  <LoanSelectionList results={results} onSelectLoan={handleSelectLoan} />
              )}
          </div>
      )}

      {selectedLoan && (
      <div className="flex gap-6 items-start">
        {/* Left Side: Search & Basic Details */}
        <div className="w-[35%] flex flex-col gap-6">
          <div className={card}>
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <h3 className="text-sm font-bold text-green-700 flex items-center gap-2"><User className="w-4 h-4" /> Loan Details</h3>
                <button onClick={() => { setSelectedLoan(null); clearSearch(); }} className="text-xs text-gray-500 hover:text-red-500 font-semibold bg-gray-100 px-2 py-1 rounded">Change Loan</button>
            </div>
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
                </div>
              </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="w-[65%] flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
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
                  <><span className="animate-spin">↻</span> Saving...</>
                ) : (
                  <><Save className="w-5 h-5" /> Save Payment</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
      )}
    </div>
  );
};

export default ReceivePayment;
