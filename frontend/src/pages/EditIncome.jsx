import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const COMMON_CATEGORIES = [
  'Loan Interest Income', 'Processing Fee', 'Penalty Collection', 'Scheme Joining Fee',
  'Gold Testing Charges', 'Service Charges', 'Auction Profit',
  'Old Gold Profit', 'Miscellaneous Income'
];

const EditIncome = () => {
<<<<<<< HEAD
  const [searchId, setSearchId] = useState('');
=======
  const [incomes, setIncomes] = useState([]);
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
  const [selectedIncomeId, setSelectedIncomeId] = useState('');
  
  const [formData, setFormData] = useState({
    _id: '',
    incomeId: '',
    incomeDate: '',
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

<<<<<<< HEAD
  const handleSearch = async () => {
    if (!searchId) {
      toast.error('Please enter an Income ID');
      return;
    }
    
    setLoading(true);
    try {
      console.log(`[Search Flow] Request received for Income ID: ${searchId}`);
      const response = await fetch(`http://localhost:5000/api/incomes/${searchId}`);
      const data = await response.json();
      
      if (response.ok && data) {
        console.log('[Search Flow] Income found:', data);
        setFormData({
          ...data,
          incomeDate: data.incomeDate ? data.incomeDate.split('T')[0] : ''
        });
        setSelectedIncomeId(data.incomeId);
        toast.success('Income details loaded');
      } else {
        console.log('[Search Flow] Income not found');
        toast.error(data.message || 'Income not found');
        resetForm();
      }
    } catch (error) {
      console.error('Error fetching income:', error);
      toast.error('Failed to search income');
    } finally {
      setLoading(false);
=======
  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/incomes');
      const data = await response.json();
      if (data.success) {
        setIncomes(data.data);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
      toast.error('Failed to load incomes');
    }
  };

  const handleIncomeSelect = (e) => {
    const id = e.target.value;
    setSelectedIncomeId(id);
    if (id) {
      const income = incomes.find(inc => inc._id === id);
      if (income) {
        setFormData({
          ...income,
          incomeDate: income.incomeDate ? income.incomeDate.split('T')[0] : ''
        });
      }
    } else {
      resetForm();
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      _id: '', incomeId: '', incomeDate: '', branchName: '', incomeCategory: '',
      incomeSubCategory: '', amount: '', paymentMode: '', receivedFrom: '',
      description: '', receiptNo: '', referenceNoTransactionId: '', receivedBy: '',
      approvedBy: '', billReceiptUpload: '', gstIncluded: false, taxAmount: ''
    });
    setSelectedIncomeId('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData._id) return;
    
    setLoading(true);
    try {
<<<<<<< HEAD
      const response = await fetch(`http://localhost:5000/api/incomes/${formData.incomeId}`, {
=======
      const response = await fetch(`http://localhost:5000/api/incomes/${formData._id}`, {
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Income updated successfully!');
<<<<<<< HEAD
=======
        fetchIncomes(); // Refresh list
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
      } else {
        toast.error(data.message || 'Failed to update income');
      }
    } catch (error) {
      console.error('Error updating income:', error);
      toast.error('An error occurred while updating.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData._id) return;
    if (!window.confirm('Are you sure you want to delete this income?')) return;

    setLoading(true);
    try {
<<<<<<< HEAD
      const response = await fetch(`http://localhost:5000/api/incomes/${formData.incomeId}`, {
=======
      const response = await fetch(`http://localhost:5000/api/incomes/${formData._id}`, {
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Income deleted successfully!');
        resetForm();
<<<<<<< HEAD
        setSearchId('');
=======
        fetchIncomes(); // Refresh list
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
      } else {
        toast.error(data.message || 'Failed to delete income');
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      toast.error('An error occurred while deleting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="mb-3 shrink-0 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Edit / Delete Income</h2>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 shrink-0">
<<<<<<< HEAD
          <label className="block text-sm font-medium text-gray-700 mb-1">Enter Income ID to Edit</label>
          <div className="flex gap-4 md:w-1/2">
            <input 
              type="text" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
              placeholder="e.g. INC000001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green bg-white"
            />
            <button 
              type="button" 
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
            >
              Search
            </button>
          </div>
=======
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Income to Edit</label>
          <select 
            value={selectedIncomeId} 
            onChange={handleIncomeSelect}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green bg-white"
          >
            <option value="">-- Select Income (ID / From) --</option>
            {incomes.map(inc => (
              <option key={inc._id} value={inc._id}>
                {inc.incomeId} - {inc.receivedFrom} (₹{inc.amount}) - {inc.incomeDate ? inc.incomeDate.split('T')[0] : ''}
              </option>
            ))}
          </select>
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
        </div>

        <div className="p-4 flex-1 overflow-auto">
        {selectedIncomeId ? (
          <form id="edit-income-form" onSubmit={handleUpdate} className="space-y-8">
            {/* Basic Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Income ID / Voucher No <span className="text-red-500">*</span></label>
<<<<<<< HEAD
                  <input required type="text" name="incomeId" value={formData.incomeId} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green bg-gray-100" />
=======
                  <input required type="text" name="incomeId" value={formData.incomeId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Income Date <span className="text-red-500">*</span></label>
                  <input required type="date" name="incomeDate" value={formData.incomeDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name <span className="text-red-500">*</span></label>
                  <input required type="text" name="branchName" value={formData.branchName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
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
                  <input type="text" name="incomeSubCategory" value={formData.incomeSubCategory} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) <span className="text-red-500">*</span></label>
                  <input required type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
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
                  <input required type="text" name="receivedFrom" value={formData.receivedFrom} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description / Remarks</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green"></textarea>
                </div>
              </div>
            </div>

            {/* Extra Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Extra Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt No</label>
                  <input type="text" name="receiptNo" value={formData.receiptNo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference No / Transaction ID</label>
                  <input type="text" name="referenceNoTransactionId" value={formData.referenceNoTransactionId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill / Receipt Upload (URL/Path)</label>
                  <input type="text" name="billReceiptUpload" value={formData.billReceiptUpload} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
                  <input type="text" name="receivedBy" value={formData.receivedBy} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                  <input type="text" name="approvedBy" value={formData.approvedBy} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                
                <div className="flex flex-col gap-4 md:flex-row md:col-span-3 items-center mt-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="gstIncluded" name="gstIncluded" checked={formData.gstIncluded} onChange={handleChange} className="w-4 h-4 text-erp-green border-gray-300 rounded focus:ring-erp-green" />
                    <label htmlFor="gstIncluded" className="ml-2 block text-sm font-medium text-gray-700">GST Included (Yes/No)</label>
                  </div>
                  {formData.gstIncluded && (
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-700">Tax Amount</label>
                      <input type="number" name="taxAmount" value={formData.taxAmount} onChange={handleChange} className="w-32 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Select an income above to edit</div>
        )}
        </div>

        {selectedIncomeId && (
          <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg flex items-center justify-between">
            <button type="button" onClick={handleDelete} disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-all">
              Delete Income
            </button>
            <div className="flex items-center gap-3">
              <button type="button" onClick={resetForm} className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all">
                Cancel
              </button>
              <button form="edit-income-form" type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500/30 transition-all shadow-sm disabled:opacity-50">
                {loading ? 'Updating...' : 'Update Income'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditIncome;
