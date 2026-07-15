import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, X, Upload } from 'lucide-react';

const License = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    licenseName: '',
    licenseNumber: '',
    issueDate: '',
    expiryDate: '',
    status: 'Active'
  });
  const [file, setFile] = useState(null);

  const fetchLicenses = async () => {
    try {
      const response = await fetch('/licenses');
      const data = await response.json();
      if (response.ok) setLicenses(data);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    submitData.append('licenseName', formData.licenseName);
    submitData.append('licenseNumber', formData.licenseNumber);
    submitData.append('issueDate', formData.issueDate);
    submitData.append('expiryDate', formData.expiryDate);
    submitData.append('status', formData.status);
    if (file) {
      submitData.append('documentUpload', file);
    }

    try {
      const response = await fetch('/licenses', {
        method: 'POST',
        body: submitData,
      });
      if (response.ok) {
        toast.success('License added successfully!');
        setFormData({
          licenseName: '', licenseNumber: '', issueDate: '', expiryDate: '', status: 'Active'
        });
        setFile(null);
        setShowAddForm(false);
        fetchLicenses();
      } else {
        toast.error('Failed to add license');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this license?')) return;
    try {
      const response = await fetch('/licenses/${id}', { method: 'DELETE' });
      if (response.ok) {
        toast.success('License deleted');
        fetchLicenses();
      }
    } catch (error) {
      toast.error('Error deleting license');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex flex-row items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-text-primary">Licenses</h2>
          <p className="text-sm text-gray-500">Track company and employee licenses.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-erp-green text-white font-semibold rounded-lg hover:bg-green-700 transition-all w-auto justify-center"
        >
          {showAddForm ? <><X className="w-4 h-4"/> Close Form</> : <><Plus className="w-4 h-4"/> Add License</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">New License Details</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Name *</label>
              <input required type="text" name="licenseName" value={formData.licenseName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
              <input required type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green">
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Renewed">Renewed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
              <input required type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
              <input required type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Upload</label>
              <label className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50 focus-within:ring-1 focus-within:ring-erp-green transition-colors">
                <span className="flex items-center gap-2 text-sm text-gray-600 truncate">
                  <Upload className="w-4 h-4 shrink-0" /> <span className="truncate">{file ? file.name : 'Choose File'}</span>
                </span>
                <input type="file" name="documentUpload" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            <div className="col-span-3 flex justify-end">
              <button disabled={loading} type="submit" className="px-6 py-1.5 text-[15px] bg-erp-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50 w-auto tracking-wide">
                {loading ? 'Saving...' : 'Save License'}
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
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">License Info</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue Date</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry Date</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Document</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {licenses.map((l) => (
                <tr key={l._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm font-medium text-gray-800">
                    {l.licenseName} <br/><span className="text-xs text-gray-500">{l.licenseNumber}</span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{new Date(l.issueDate).toLocaleDateString()}</td>
                  <td className="p-3 text-sm text-red-600 font-medium">{new Date(l.expiryDate).toLocaleDateString()}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      l.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      l.status === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {l.documentUpload ? (
                      <a href={`http://localhost:5000/${l.documentUpload}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">View Doc</a>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-sm text-right">
                    <button onClick={() => handleDelete(l._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {licenses.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">No licenses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default License;
