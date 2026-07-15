import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, X, FileText, FileDown } from 'lucide-react';
import { exportToExcel, exportToPDF } from "../../../utils/exportUtils";

const UpdateIncentive = () => {
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',

    targetAmount: '',
    achievedAmount: '',
    incentiveAmount: '',
    bonus: '',
    monthYear: ''
  });

  const fetchIncentives = async () => {
    try {
      const response = await fetch('/incentives');
      const data = await response.json();
      if (response.ok) setIncentives(data);
    } catch (error) {
      console.error('Error fetching incentives:', error);
    }
  };

  useEffect(() => {
    fetchIncentives();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/incentives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success('Incentive added successfully!');
        setFormData({
          employeeName: '', employeeId: '', targetAmount: '',
          achievedAmount: '', incentiveAmount: '', bonus: '', monthYear: ''
        });
        setShowAddForm(false);
        fetchIncentives();
      } else {
        toast.error('Failed to add incentive');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this incentive?')) return;
    try {
      const response = await fetch('/incentives/${id}', { method: 'DELETE' });
      if (response.ok) {
        toast.success('Incentive deleted');
        fetchIncentives();
      }
    } catch (error) {
      toast.error('Error deleting incentive');
    }
  };

  const handleExportExcel = () => {
    const headers = ['Employee Name', 'Employee ID', 'Month/Year', 'Target Amount', 'Achieved Amount', 'Incentive Amount', 'Bonus'];
    const mapper = i => [
      i.employeeName || '',
      i.employeeId || '',
      i.monthYear || '',
      i.targetAmount || 0,
      i.achievedAmount || 0,
      i.incentiveAmount || 0,
      i.bonus || 0
    ];
    exportToExcel(incentives, headers, mapper, `Incentives_Report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPDF = () => {
    const headers = ['Employee Name', 'Employee ID', 'Month/Year', 'Target Amount', 'Achieved Amount', 'Incentive Amount', 'Bonus'];
    const mapper = i => [
      i.employeeName || '',
      i.employeeId || '',
      i.monthYear || '',
      i.targetAmount || 0,
      i.achievedAmount || 0,
      i.incentiveAmount || 0,
      i.bonus || 0
    ];
    exportToPDF(incentives, headers, mapper, 'Incentives Report', `Incentives_Report_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex flex-row items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-text-primary">Update Incentive</h2>
          <p className="text-sm text-gray-500">Manage employee incentives and targets.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm">
            <FileText size={16} /> PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-erp-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm">
            <FileDown size={16} /> Excel
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all w-auto justify-center text-sm"
          >
            {showAddForm ? <><X className="w-4 h-4"/> Close Form</> : <><Plus className="w-4 h-4"/> Add Incentive</>}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">New Incentive Details</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name *</label>
              <input required type="text" name="employeeName" value={formData.employeeName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
              <input required type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month / Year *</label>
              <input required type="month" name="monthYear" value={formData.monthYear} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount *</label>
              <input required type="number" name="targetAmount" value={formData.targetAmount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Achieved Amount *</label>
              <input required type="number" name="achievedAmount" value={formData.achievedAmount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incentive Amount *</label>
              <input required type="number" name="incentiveAmount" value={formData.incentiveAmount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
              <input type="number" name="bonus" value={formData.bonus} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div className="col-span-4 flex justify-end">
              <button disabled={loading} type="submit" className="px-6 py-1.5 text-[15px] bg-erp-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50 w-auto tracking-wide">
                {loading ? 'Saving...' : 'Save Incentive'}
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
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>

                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Month/Year</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Target</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Achieved</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Incentive</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Bonus</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {incentives.map((i) => (
                <tr key={i._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm font-medium text-gray-800">
                    {i.employeeName} <br/><span className="text-xs text-gray-500">{i.employeeId}</span>
                  </td>

                  <td className="p-3 text-sm text-gray-600">{i.monthYear}</td>
                  <td className="p-3 text-sm text-gray-600">₹{i.targetAmount}</td>
                  <td className="p-3 text-sm text-blue-600 font-medium">₹{i.achievedAmount}</td>
                  <td className="p-3 text-sm text-green-600 font-semibold">₹{i.incentiveAmount}</td>
                  <td className="p-3 text-sm text-amber-600 font-medium">₹{i.bonus}</td>
                  <td className="p-3 text-sm text-right">
                    <button onClick={() => handleDelete(i._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {incentives.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">No incentives found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UpdateIncentive;
