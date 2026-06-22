import React, { useState, useEffect } from 'react';
import { Search, Save, Printer, Banknote, User, FileText, IndianRupee } from 'lucide-react';
import { getAllLoans } from '../utils/loanStore';
import { savePayment } from '../utils/paymentStore';
import toast from 'react-hot-toast';

const ReceivePayment = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);

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
  };

  const inp = "w-full px-3 py-2 text-sm bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-xs font-semibold text-gray-600 mb-1";
  const card = "bg-white border border-gray-100 rounded-xl shadow-sm p-5";
  const sec = "text-sm font-bold text-green-700 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2";

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Title */}
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Receive Payment</h2>
          <p className="text-sm text-text-secondary mt-1">Process and record incoming customer payments.</p>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left Side: Search & Basic Details */}
        <div className="w-[35%] flex flex-col gap-6">
          
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
                  <input className={`${inp} bg-gray-50`} value={selectedLoan.customerId || selectedLoan.id || 'N/A'} readOnly />
                </div>
                <div>
                  <label className={lbl}>Customer Name</label>
                  <input className={`${inp} bg-gray-50 font-bold`} value={selectedLoan.customerName} readOnly />
                </div>
                <div>
                  <label className={lbl}>Loan Number</label>
                  <input className={`${inp} bg-emerald-50 text-emerald-800 font-bold`} value={selectedLoan.loanNumber} readOnly />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="w-[65%] flex flex-col gap-6">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            
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
              <button type="button" className="flex-1 py-3 bg-white text-green-700 font-bold rounded-xl border-2 border-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-2">
                <Printer className="w-5 h-5" /> Save & Print Receipt
              </button>
              <button type="submit" className="flex-[2] py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-900 transition-all shadow-lg flex items-center justify-center gap-2">
                <Save className="w-5 h-5" /> Save Payment Details
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceivePayment;
