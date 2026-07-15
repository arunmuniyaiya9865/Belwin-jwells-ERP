import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const WeightMachine = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    machineId: '',
    machineName: '',
    serialNumber: '',
    lastCalibrationDate: '',
    nextCalibrationDate: '',
    status: 'Active',
    remarks: ''
  });

  const fetchMachines = async () => {
    try {
      const response = await fetch('/weight-machines');
      const data = await response.json();
      if (response.ok) setMachines(data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/weight-machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success('Machine added successfully!');
        setFormData({
          machineId: '', machineName: '', serialNumber: '',
          lastCalibrationDate: '', nextCalibrationDate: '',
          status: 'Active', remarks: ''
        });
        setShowAddForm(false);
        fetchMachines();
      } else {
        toast.error('Failed to add machine');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this machine record?')) return;
    try {
      const response = await fetch('/weight-machines/${id}', { method: 'DELETE' });
      if (response.ok) {
        toast.success('Machine deleted');
        fetchMachines();
      }
    } catch (error) {
      toast.error('Error deleting machine');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex flex-row items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-text-primary">Weight Machine Calibration</h2>
          <p className="text-sm text-gray-500">Track and manage weight machines and their calibration schedules.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-erp-green text-white font-semibold rounded-lg hover:bg-green-700 transition-all w-auto justify-center"
        >
          {showAddForm ? <><X className="w-4 h-4"/> Close Form</> : <><Plus className="w-4 h-4"/> Add Machine</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">New Machine Details</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Machine ID *</label>
              <input required type="text" name="machineId" value={formData.machineId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Machine Name *</label>
              <input required type="text" name="machineName" value={formData.machineName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
              <input required type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Calibration Date *</label>
              <input required type="date" name="lastCalibrationDate" value={formData.lastCalibrationDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Calibration Date *</label>
              <input required type="date" name="nextCalibrationDate" value={formData.nextCalibrationDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input type="text" name="remarks" value={formData.remarks} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div className="col-span-3 flex justify-end">
              <button disabled={loading} type="submit" className="px-6 py-1.5 text-[15px] bg-erp-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50 w-auto tracking-wide">
                {loading ? 'Saving...' : 'Save Machine'}
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
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Machine</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Serial No</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Calib.</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Next Calib.</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Remarks</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {machines.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm font-medium text-gray-800">
                    {m.machineName} <br/><span className="text-xs text-gray-500">{m.machineId}</span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{m.serialNumber}</td>
                  <td className="p-3 text-sm text-gray-600">{new Date(m.lastCalibrationDate).toLocaleDateString()}</td>
                  <td className="p-3 text-sm font-medium text-blue-600">{new Date(m.nextCalibrationDate).toLocaleDateString()}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      m.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      m.status === 'Inactive' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-500 truncate max-w-[150px]">{m.remarks || '-'}</td>
                  <td className="p-3 text-sm text-right">
                    <button onClick={() => handleDelete(m._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {machines.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">No machines found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeightMachine;
