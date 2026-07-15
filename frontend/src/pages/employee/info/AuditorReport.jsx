import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const AuditorReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    totalLoanAmount: '',
    totalCollection: '',
    totalInterestCollected: '',
    pendingAmount: '',
    closedAccounts: '',
    auctionAccounts: '',
    reportDate: new Date().toISOString().split('T')[0]
  });

  const fetchReports = async () => {
    try {
      const response = await fetch('/auditor-reports');
      const data = await response.json();
      if (response.ok) setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/auditor-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success('Auditor Report added!');
        setFormData({
          totalLoanAmount: '', totalCollection: '', totalInterestCollected: '',
          pendingAmount: '', closedAccounts: '', auctionAccounts: '',
          reportDate: new Date().toISOString().split('T')[0]
        });
        setShowAddForm(false);
        fetchReports();
      } else {
        toast.error('Failed to add report');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      const response = await fetch('/auditor-reports/${id}', { method: 'DELETE' });
      if (response.ok) {
        toast.success('Report deleted');
        fetchReports();
      }
    } catch (error) {
      toast.error('Error deleting report');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex flex-row items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-text-primary">Auditor Report</h2>
          <p className="text-sm text-gray-500">Record and review periodic auditor metrics.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-erp-green text-white font-semibold rounded-lg hover:bg-green-700 transition-all w-auto justify-center"
        >
          {showAddForm ? <><X className="w-4 h-4"/> Close Form</> : <><Plus className="w-4 h-4"/> Add Report</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">New Report Details</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Loan Amount *</label>
              <input required type="number" name="totalLoanAmount" value={formData.totalLoanAmount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Collection *</label>
              <input required type="number" name="totalCollection" value={formData.totalCollection} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Interest *</label>
              <input required type="number" name="totalInterestCollected" value={formData.totalInterestCollected} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pending Amount *</label>
              <input required type="number" name="pendingAmount" value={formData.pendingAmount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closed Accounts *</label>
              <input required type="number" name="closedAccounts" value={formData.closedAccounts} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auction Accounts *</label>
              <input required type="number" name="auctionAccounts" value={formData.auctionAccounts} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Date *</label>
              <input required type="date" name="reportDate" value={formData.reportDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div className="col-span-4 flex justify-end">
              <button disabled={loading} type="submit" className="px-6 py-1.5 text-[15px] bg-erp-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50 w-auto tracking-wide">
                {loading ? 'Saving...' : 'Save Report'}
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
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Loan Amt</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Collection</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Interest</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Closed Acc</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Auction Acc</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm font-medium text-gray-800">{new Date(r.reportDate).toLocaleDateString()}</td>
                  <td className="p-3 text-sm text-gray-600">₹{r.totalLoanAmount}</td>
                  <td className="p-3 text-sm text-green-600 font-semibold">₹{r.totalCollection}</td>
                  <td className="p-3 text-sm text-gray-600">₹{r.totalInterestCollected}</td>
                  <td className="p-3 text-sm text-red-600 font-medium">₹{r.pendingAmount}</td>
                  <td className="p-3 text-sm text-gray-600">{r.closedAccounts}</td>
                  <td className="p-3 text-sm text-gray-600">{r.auctionAccounts}</td>
                  <td className="p-3 text-sm text-right">
                    <button onClick={() => handleDelete(r._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-gray-500">No auditor reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditorReport;
