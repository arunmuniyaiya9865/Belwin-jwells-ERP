import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const COMMON_CATEGORIES = [
  'Office Rent', 'EB / Current Bill', 'Staff Salary', 'Internet / Phone Bill',
  'Stationery', 'Travel Expense', 'Gold Testing / Hallmark Expense',
  'Repair / Maintenance', 'Marketing / Advertisement', 'Bank Charges',
  'Tea / Food / Office Expense', 'Miscellaneous Expense'
];

const EditExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedExpenseId, setSelectedExpenseId] = useState('');
  
  const [formData, setFormData] = useState({
    _id: '',
    expenseId: '',
    expenseDate: '',
    branchName: '',
    expenseCategory: '',
    expenseSubCategory: '',
    expenseAmount: '',
    paymentMode: '',
    paidToVendorName: '',
    description: '',
    billInvoiceNo: '',
    billReceiptUpload: '',
    approvedBy: '',
    enteredBy: '',
    gstIncluded: false,
    taxAmount: '',
    paymentReferenceNo: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/expenses');
      const data = await response.json();
      if (data.success) {
        setExpenses(data.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    }
  };

  const handleExpenseSelect = (e) => {
    const id = e.target.value;
    setSelectedExpenseId(id);
    if (id) {
      const expense = expenses.find(exp => exp._id === id);
      if (expense) {
        setFormData({
          ...expense,
          expenseDate: expense.expenseDate ? expense.expenseDate.split('T')[0] : ''
        });
      }
    } else {
      resetForm();
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
      _id: '', expenseId: '', expenseDate: '', branchName: '', expenseCategory: '',
      expenseSubCategory: '', expenseAmount: '', paymentMode: '', paidToVendorName: '',
      description: '', billInvoiceNo: '', billReceiptUpload: '', approvedBy: '',
      enteredBy: '', gstIncluded: false, taxAmount: '', paymentReferenceNo: ''
    });
    setSelectedExpenseId('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData._id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${formData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Expense updated successfully!');
        fetchExpenses(); // Refresh list
      } else {
        toast.error(data.message || 'Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('An error occurred while updating.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData._id) return;
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${formData._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Expense deleted successfully!');
        resetForm();
        fetchExpenses(); // Refresh list
      } else {
        toast.error(data.message || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('An error occurred while deleting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="mb-3 shrink-0 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Edit / Delete Expense</h2>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Expense to Edit</label>
          <select 
            value={selectedExpenseId} 
            onChange={handleExpenseSelect}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green bg-white"
          >
            <option value="">-- Select Expense (ID / Vendor) --</option>
            {expenses.map(exp => (
              <option key={exp._id} value={exp._id}>
                {exp.expenseId} - {exp.paidToVendorName} (₹{exp.expenseAmount}) - {exp.expenseDate ? exp.expenseDate.split('T')[0] : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 flex-1 overflow-auto">
        {selectedExpenseId ? (
          <form id="edit-expense-form" onSubmit={handleUpdate} className="space-y-8">
            {/* Basic Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense ID / Voucher No <span className="text-red-500">*</span></label>
                  <input required type="text" name="expenseId" value={formData.expenseId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date <span className="text-red-500">*</span></label>
                  <input required type="date" name="expenseDate" value={formData.expenseDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name <span className="text-red-500">*</span></label>
                  <input required type="text" name="branchName" value={formData.branchName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Category <span className="text-red-500">*</span></label>
                  <select required name="expenseCategory" value={formData.expenseCategory} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green bg-white">
                    <option value="">Select Category</option>
                    {COMMON_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Sub Category</label>
                  <input type="text" name="expenseSubCategory" value={formData.expenseSubCategory} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Amount <span className="text-red-500">*</span></label>
                  <input required type="number" name="expenseAmount" value={formData.expenseAmount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paid To / Vendor Name <span className="text-red-500">*</span></label>
                  <input required type="text" name="paidToVendorName" value={formData.paidToVendorName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill No / Invoice No</label>
                  <input type="text" name="billInvoiceNo" value={formData.billInvoiceNo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill Upload (URL/Path)</label>
                  <input type="text" name="billReceiptUpload" value={formData.billReceiptUpload} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference No</label>
                  <input type="text" name="paymentReferenceNo" value={formData.paymentReferenceNo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                  <input type="text" name="approvedBy" value={formData.approvedBy} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entered By</label>
                  <input type="text" name="enteredBy" value={formData.enteredBy} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
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
          <div className="flex items-center justify-center h-full text-gray-400">Select an expense above to edit</div>
        )}
        </div>

        {selectedExpenseId && (
          <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg flex items-center justify-between">
            <button type="button" onClick={handleDelete} disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-all">
              Delete Expense
            </button>
            <div className="flex items-center gap-3">
              <button type="button" onClick={resetForm} className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all">
                Cancel
              </button>
              <button form="edit-expense-form" type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500/30 transition-all shadow-sm disabled:opacity-50">
                {loading ? 'Updating...' : 'Update Expense'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditExpense;
