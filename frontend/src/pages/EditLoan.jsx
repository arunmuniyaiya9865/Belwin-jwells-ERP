import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, Save, Trash2 } from 'lucide-react';
import { getAllLoans, updateLoan, deleteLoan, searchLoans } from '../utils/loanStore';

const emptyForm = {
  loanNumber: '',
  customerId: '', customerName: '', mobileNumber: '', aadhaarNo: '', address: '',
  ornamentType: '', ornamentCount: '', grossWeight: '', netWeight: '', stoneWeight: '', purity: '22K', goldRate: '', goldValue: '',
  loanDate: '', loanAmount: '', interestRate: '', loanPeriod: '', dueDate: '', processingFee: '', loanOfficer: '',
  disbursementMode: 'Cash', transactionRefNo: '', remarks: '',
  status: 'Pending'
};

const EditLoan = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSearchResults(searchLoans(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan);
    setFormData({ ...emptyForm, ...loan });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!selectedLoan) return;
    
    updateLoan(formData);
    toast.success('Loan updated successfully!');
    setSelectedLoan(null);
    setFormData({ ...emptyForm });
  };

  const handleDelete = () => {
    if (!selectedLoan) return;
    if (window.confirm(`Are you sure you want to delete loan ${selectedLoan.loanNumber}?`)) {
      deleteLoan(selectedLoan.loanNumber);
      toast.success('Loan deleted successfully!');
      setSelectedLoan(null);
      setFormData({ ...emptyForm });
    }
  };

  const inp = "w-full px-3 py-1.5 text-base bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-sm font-semibold text-gray-700 mb-0.5";
  const sectionTitle = "text-lg font-bold text-green-700 mb-3 border-b pb-1 mt-4";

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Title */}
      <div className="mb-3 shrink-0">
        <h2 className="text-2xl font-bold text-text-primary">Edit / Delete Loan</h2>
        <p className="text-xs text-text-secondary mt-0.5">Search by Loan Number, Name, or Mobile to edit details.</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search loans..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full max-w-md mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {searchResults.map(loan => (
              <div
                key={loan.loanNumber}
                onClick={() => handleSelectLoan(loan)}
                className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b last:border-0"
              >
                <div className="font-semibold text-sm">{loan.loanNumber} - {loan.customerName}</div>
                <div className="text-xs text-gray-500">Mobile: {loan.mobileNumber} | Amount: ₹{loan.loanAmount}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form card */}
      <div className={`bg-white border border-gray-100 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden ${!selectedLoan && 'opacity-50 pointer-events-none'}`}>
        <div className="p-4 flex-1 overflow-auto">
          {!selectedLoan && (
            <div className="flex items-center justify-center h-full text-gray-400 font-medium">
              Please search and select a loan to edit
            </div>
          )}
          {selectedLoan && (
            <form id="edit-loan-form" onSubmit={handleUpdate} className="grid grid-cols-4 gap-x-5 gap-y-3">
              
              <div className="col-span-4 bg-green-50 p-3 rounded-lg border border-green-100 mb-2 flex justify-between items-center">
                <span className="font-bold text-green-800">Editing Loan: {formData.loanNumber}</span>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-green-800">Status:</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="px-3 py-1 text-sm border-gray-300 rounded-md focus:ring-green-500 font-medium">
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Closed">Closed</option>
                    <option value="Auction">Auction</option>
                    <option value="Repledged">Repledged</option>
                  </select>
                </div>
              </div>

              {/* ── Customer Information ── */}
              <div className="col-span-4"><h3 className={sectionTitle}>Customer Information</h3></div>
              <div>
                <label className={lbl}>Customer ID</label>
                <input type="text" name="customerId" value={formData.customerId} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Customer Name <span className="text-red-500">*</span></label>
                <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className={inp} required />
              </div>
              <div>
                <label className={lbl}>Mobile Number <span className="text-red-500">*</span></label>
                <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className={inp} required />
              </div>
              <div>
                <label className={lbl}>Aadhaar Number</label>
                <input type="text" name="aadhaarNo" value={formData.aadhaarNo} onChange={handleInputChange} className={inp} />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Address</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" className={`${inp} resize-none`} />
              </div>

              {/* ── Gold Information ── */}
              <div className="col-span-4"><h3 className={sectionTitle}>Gold Information</h3></div>
              <div>
                <label className={lbl}>Ornament Type <span className="text-red-500">*</span></label>
                <input type="text" name="ornamentType" value={formData.ornamentType} onChange={handleInputChange} className={inp} required />
              </div>
              <div>
                <label className={lbl}>Ornament Count</label>
                <input type="number" name="ornamentCount" value={formData.ornamentCount} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Gross Weight (g) <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" name="grossWeight" value={formData.grossWeight} onChange={handleInputChange} className={inp} required />
              </div>
              <div>
                <label className={lbl}>Net Weight (g)</label>
                <input type="number" step="0.01" name="netWeight" value={formData.netWeight} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Stone Weight (g)</label>
                <input type="number" step="0.01" name="stoneWeight" value={formData.stoneWeight} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Purity</label>
                <select name="purity" value={formData.purity} onChange={handleInputChange} className={inp}>
                  <option value="18K">18K</option>
                  <option value="22K">22K</option>
                  <option value="24K">24K</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Gold Rate (Today)</label>
                <input type="number" step="0.01" name="goldRate" value={formData.goldRate} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Gold Value</label>
                <input type="number" step="0.01" name="goldValue" value={formData.goldValue} onChange={handleInputChange} className={inp} />
              </div>

              {/* ── Loan Information ── */}
              <div className="col-span-4"><h3 className={sectionTitle}>Loan Information</h3></div>
              <div>
                <label className={lbl}>Loan Date</label>
                <input type="date" name="loanDate" value={formData.loanDate} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Loan Amount <span className="text-red-500">*</span></label>
                <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleInputChange} className={inp} required />
              </div>
              <div>
                <label className={lbl}>Interest Rate (%) <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" name="interestRate" value={formData.interestRate} onChange={handleInputChange} className={inp} required />
              </div>
              <div>
                <label className={lbl}>Loan Period (Months)</label>
                <input type="number" name="loanPeriod" value={formData.loanPeriod} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Processing Fee</label>
                <input type="number" name="processingFee" value={formData.processingFee} onChange={handleInputChange} className={inp} />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Loan Officer</label>
                <input type="text" name="loanOfficer" value={formData.loanOfficer} onChange={handleInputChange} className={inp} />
              </div>

              {/* ── Payment Information ── */}
              <div className="col-span-4"><h3 className={sectionTitle}>Payment Information</h3></div>
              <div>
                <label className={lbl}>Disbursement Mode</label>
                <select name="disbursementMode" value={formData.disbursementMode} onChange={handleInputChange} className={inp}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Transaction Reference No</label>
                <input type="text" name="transactionRefNo" value={formData.transactionRefNo} onChange={handleInputChange} className={inp} />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Remarks</label>
                <input type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} className={inp} />
              </div>

            </form>
          )}
        </div>

        {/* ── Bottom Action Bar ── */}
        <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg flex items-center justify-between">
          <div className="flex gap-3">
            <button form="edit-loan-form" type="submit" disabled={!selectedLoan}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm disabled:opacity-50">
              <Save className="w-4 h-4" /> Update Loan
            </button>
          </div>
          <button type="button" onClick={handleDelete} disabled={!selectedLoan}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-all disabled:opacity-50">
            <Trash2 className="w-4 h-4" /> Delete Loan
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLoan;
