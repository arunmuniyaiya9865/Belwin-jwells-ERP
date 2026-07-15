import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const AdvanceDetails = () => {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    advanceAmount: '',
    advanceDate: new Date().toISOString().split('T')[0],
    purpose: '',
    balanceAmount: '',
    status: 'Pending',
    remarks: ''
  });

  const fetchAdvances = async () => {
    try {
      const response = await fetch('/advance-details');
      const data = await response.json();
      if (response.ok) setAdvances(data);
    } catch (error) {
      console.error('Error fetching advances:', error);
    }
  };

  useEffect(() => {
    fetchAdvances();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/advance-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success('Advance added successfully!');
        setFormData({
          customerName: '', mobileNumber: '', advanceAmount: '',
          advanceDate: new Date().toISOString().split('T')[0], purpose: '',
          balanceAmount: '', status: 'Pending', remarks: ''
        });
        setShowAddForm(false);
        fetchAdvances();
      } else {
        toast.error('Failed to add advance');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this advance record?')) return;
    try {
      const response = await fetch('/advance-details/${id}', { method: 'DELETE' });
      if (response.ok) {
        toast.success('Advance deleted');
        fetchAdvances();
      }
    } catch (error) {
      toast.error('Error deleting advance');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex flex-row items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-text-primary">Advance Details</h2>
          <p className="text-sm text-gray-500">Manage customer advances and balances.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-erp-green text-white font-semibold rounded-lg hover:bg-green-700 transition-all w-auto justify-center"
        >
          {showAddForm ? <><X className="w-4 h-4"/> Close Form</> : <><Plus className="w-4 h-4"/> Add Advance</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">New Advance</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input required type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
              <input required type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advance Amount *</label>
              <input required type="number" name="advanceAmount" value={formData.advanceAmount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Balance Amount *</label>
              <input required type="number" name="balanceAmount" value={formData.balanceAmount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advance Date *</label>
              <input required type="date" name="advanceDate" value={formData.advanceDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
              <input required type="text" name="purpose" value={formData.purpose} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green">
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-span-4 flex justify-end">
              <button disabled={loading} type="submit" className="px-6 py-1.5 text-[15px] bg-erp-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50 w-auto tracking-wide">
                {loading ? 'Saving...' : 'Save Advance'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
              <tr>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Advance</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Purpose</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {advances.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm font-medium text-gray-800">
                    {a.customerName} <br/><span className="text-xs text-gray-500">{a.mobileNumber}</span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{new Date(a.advanceDate).toLocaleDateString()}</td>
                  <td className="p-3 text-sm text-green-600 font-semibold">₹{a.advanceAmount}</td>
                  <td className="p-3 text-sm text-red-600 font-medium">₹{a.balanceAmount}</td>
                  <td className="p-3 text-sm text-gray-600">{a.purpose}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      a.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                      a.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-right">
                    <button onClick={() => handleDelete(a._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {advances.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">No advances found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvanceDetails;
