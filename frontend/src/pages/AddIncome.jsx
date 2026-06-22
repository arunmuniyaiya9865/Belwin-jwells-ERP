import React, { useState } from 'react';
import toast from 'react-hot-toast';

const COMMON_CATEGORIES = [
  'Loan Interest Income', 'Processing Fee', 'Penalty Collection', 'Scheme Joining Fee',
  'Gold Testing Charges', 'Service Charges', 'Auction Profit',
  'Old Gold Profit', 'Miscellaneous Income'
];

const AddIncome = () => {
  const [formData, setFormData] = useState({
    incomeId: '',
    incomeDate: new Date().toISOString().split('T')[0],
    branchName: '',
    incomeCategory: '',
    incomeSubCategory: '',
    amount: '',
    paymentMode: '',
    receivedFrom: '',
    description: '',
    receiptNo: '',
    referenceNoTransactionId: '',
    receivedBy: '',
    approvedBy: '',
    billReceiptUpload: '',
    gstIncluded: false,
    taxAmount: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/incomes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Income added successfully!');
        // Reset form but keep date
        setFormData({
          incomeId: '',
          incomeDate: new Date().toISOString().split('T')[0],
          branchName: '',
          incomeCategory: '',
          incomeSubCategory: '',
          amount: '',
          paymentMode: '',
          receivedFrom: '',
          description: '',
          receiptNo: '',
          referenceNoTransactionId: '',
          receivedBy: '',
          approvedBy: '',
          billReceiptUpload: '',
          gstIncluded: false,
          taxAmount: ''
        });
      } else {
        toast.error(data.message || 'Failed to add income');
      }
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="mb-3 shrink-0">
        <h2 className="text-2xl font-bold text-text-primary">Add New Income</h2>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex-1 overflow-auto">
          <form id="add-income-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Income ID / Voucher No <span className="text-red-500">*</span></label>
                  <input required type="text" name="incomeId" value={formData.incomeId} onChange={handleChange} placeholder="e.g., INC-001" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Income Date <span className="text-red-500">*</span></label>
                  <input required type="date" name="incomeDate" value={formData.incomeDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name <span className="text-red-500">*</span></label>
                  <input required type="text" name="branchName" value={formData.branchName} onChange={handleChange} placeholder="Main Branch" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Income Category <span className="text-red-500">*</span></label>
                  <select required name="incomeCategory" value={formData.incomeCategory} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green bg-white">
                    <option value="">Select Category</option>
                    {COMMON_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Income Sub Category</label>
                  <input type="text" name="incomeSubCategory" value={formData.incomeSubCategory} onChange={handleChange} placeholder="Optional" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) <span className="text-red-500">*</span></label>
                  <input required type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode <span className="text-red-500">*</span></label>
                  <select required name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green bg-white">
                    <option value="">Select Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received From <span className="text-red-500">*</span></label>
                  <input required type="text" name="receivedFrom" value={formData.receivedFrom} onChange={handleChange} placeholder="Name/Company" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description / Remarks</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Any additional details..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green"></textarea>
                </div>
              </div>
            </div>

            {/* Extra Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Extra Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt No</label>
                  <input type="text" name="receiptNo" value={formData.receiptNo} onChange={handleChange} placeholder="Optional" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference No / Transaction ID</label>
                  <input type="text" name="referenceNoTransactionId" value={formData.referenceNoTransactionId} onChange={handleChange} placeholder="If Bank/UPI" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill / Receipt Upload (URL/Path)</label>
                  <input type="text" name="billReceiptUpload" value={formData.billReceiptUpload} onChange={handleChange} placeholder="Path to file" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
                  <input type="text" name="receivedBy" value={formData.receivedBy} onChange={handleChange} placeholder="Staff Name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                  <input type="text" name="approvedBy" value={formData.approvedBy} onChange={handleChange} placeholder="Manager Name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                
                <div className="flex flex-col gap-4 md:flex-row md:col-span-3 items-center mt-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="gstIncluded" name="gstIncluded" checked={formData.gstIncluded} onChange={handleChange} className="w-4 h-4 text-erp-green border-gray-300 rounded focus:ring-erp-green" />
                    <label htmlFor="gstIncluded" className="ml-2 block text-sm font-medium text-gray-700">GST Included (Yes/No)</label>
                  </div>
                  {formData.gstIncluded && (
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-700">Tax Amount</label>
                      <input type="number" name="taxAmount" value={formData.taxAmount} onChange={handleChange} placeholder="0.00" className="w-32 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg flex items-center justify-end gap-3">
          <button type="button" onClick={() => window.history.back()} className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all">
            Cancel
          </button>
          <button form="add-income-form" type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500/30 transition-all shadow-sm disabled:opacity-50">
            {loading ? 'Adding Income...' : 'Save Income'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddIncome;
