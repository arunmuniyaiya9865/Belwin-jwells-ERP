import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const Schemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    schemeId: '',
    schemeName: '',
    interestPercent: '',
    amountRs: '',
    gramRate: '',
    minimumGram: '',
    maturePeriodMonths: '',
    interestRepaymentMonths: '',
    documentCharges: '',
    type: 'Variable',
    penaltyPercent: '',
    status: 'Active'
  });

  const fetchSchemes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/schemes');
      const data = await response.json();
      if (response.ok) {
        setSchemes(data);
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Scheme added successfully!');
        setFormData({
          schemeId: '', schemeName: '', interestPercent: '', amountRs: '',
          gramRate: '', minimumGram: '', maturePeriodMonths: '', 
          interestRepaymentMonths: '', documentCharges: '', type: 'Variable', 
          penaltyPercent: '', status: 'Active'
        });
        setShowAddForm(false);
        fetchSchemes();
      } else {
        toast.error(data.message || 'Failed to add scheme');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/schemes/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Scheme deleted');
        fetchSchemes();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting scheme');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex flex-row items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-text-primary">Schemes</h2>
          <p className="text-sm text-gray-500">Manage all schemes and their details.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-erp-green text-white font-semibold rounded-lg hover:bg-green-700 transition-all w-auto justify-center"
        >
          {showAddForm ? <><X className="w-4 h-4"/> Close Form</> : <><Plus className="w-4 h-4"/> Add Scheme</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">New Scheme Details</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID *</label>
              <input required type="text" name="schemeId" value={formData.schemeId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" placeholder="e.g. S10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Name *</label>
              <input required type="text" name="schemeName" value={formData.schemeName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" placeholder="e.g. BW S5(916)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest % *</label>
              <input required type="number" step="any" name="interestPercent" value={formData.interestPercent} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Rs *</label>
              <input required type="number" step="any" name="amountRs" value={formData.amountRs} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gram Rate *</label>
              <input required type="number" step="any" name="gramRate" value={formData.gramRate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Gram *</label>
              <input required type="number" step="any" name="minimumGram" value={formData.minimumGram} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mature Period (Months) *</label>
              <input required type="number" name="maturePeriodMonths" value={formData.maturePeriodMonths} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Repayment (Months) *</label>
              <input required type="number" name="interestRepaymentMonths" value={formData.interestRepaymentMonths} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Charges *</label>
              <input required type="number" step="any" name="documentCharges" value={formData.documentCharges} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <input required type="text" name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" placeholder="e.g. Variable" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Penalty % *</label>
              <input required type="number" step="any" name="penaltyPercent" value={formData.penaltyPercent} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div className="col-span-4 flex justify-end">
              <button disabled={loading} type="submit" className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all">
                {loading ? 'Saving...' : 'Save Scheme'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 text-gray-600">
              <tr>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider">ID</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider">Scheme Name</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider">Interest %</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider">Amount Rs</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider">Gram Rate</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider">Mimim Gram</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider">Mature Period (Months)</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider">Interest Repayment (Months)</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider">Document Charges</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider">Type</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider">Penalty %</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schemes.map((s) => (
                <tr key={s._id} className="bg-white hover:bg-gray-50 border-b border-gray-100 transition-colors text-gray-800">
                  <td className="p-3 text-sm font-medium">{s.schemeId}</td>
                  <td className="p-3 text-sm">{s.schemeName}</td>
                  <td className="p-3 text-sm">{s.interestPercent}</td>
                  <td className="p-3 text-sm">{s.amountRs != null ? Number(s.amountRs).toFixed(3) : ''}</td>
                  <td className="p-3 text-sm">{s.gramRate}</td>
                  <td className="p-3 text-sm">{s.minimumGram}</td>
                  <td className="p-3 text-sm">{s.maturePeriodMonths}</td>
                  <td className="p-3 text-sm">{s.interestRepaymentMonths}</td>
                  <td className="p-3 text-sm">{s.documentCharges}</td>
                  <td className="p-3 text-sm">{s.type}</td>
                  <td className="p-3 text-sm">{s.penaltyPercent}</td>
                  <td className="p-3 text-sm text-right">
                    <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {schemes.length === 0 && (
                <tr>
                  <td colSpan="12" className="p-6 text-center text-gray-500">No schemes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Schemes;
