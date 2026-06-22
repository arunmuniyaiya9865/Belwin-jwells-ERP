import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Upload, Search, Pencil, Trash2, RefreshCcw } from 'lucide-react';
import { searchCustomers, updateCustomer, deleteCustomer } from '../utils/customerStore';

const EditDeleteCustomer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [formData, setFormData] = useState(null);
  const [files, setFiles] = useState({ photo: null, aadharFile: null, proof2File: null });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const photoInputRef = useRef(null);
  const aadharInputRef = useRef(null);
  const proof2InputRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return toast.error('Enter an ID or mobile number');
    const results = searchCustomers(searchQuery);
    setSearchResults(results);
    if (results.length === 0) toast.error('No customers found');
    setFormData(null);
  };

  const handleSelectCustomer = (customer) => {
    setFormData({ ...customer });
    setFiles({ photo: null, aadharFile: null, proof2File: null });
    setSearchResults([]);
    setSearchQuery(customer.customerName);
    [photoInputRef, aadharInputRef, proof2InputRef].forEach(r => r.current && (r.current.value = ''));
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e, key) => e.target.files?.[0] && setFiles(prev => ({ ...prev, [key]: e.target.files[0] }));

  const handleUpdate = () => {
    if (!formData) return;
    updateCustomer(formData);
    toast.success(`"${formData.customerName}" updated successfully!`);
  };

  const handleDeleteConfirm = () => {
    deleteCustomer(formData.id);
    toast.success(`"${formData.customerName}" deleted!`);
    setFormData(null);
    setSearchQuery('');
    setShowDeleteConfirm(false);
  };

  const handleClearSearch = () => {
    setFormData(null);
    setSearchQuery('');
    setSearchResults([]);
    setFiles({ photo: null, aadharFile: null, proof2File: null });
  };

  const inp = "w-full px-3 py-1.5 text-base bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-sm font-semibold text-gray-700 mb-0.5";

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Title */}
      <div className="mb-3 shrink-0">
        <h2 className="text-2xl font-bold text-text-primary">Edit / Delete Customer</h2>
        <p className="text-xs text-text-secondary mt-0.5">Search for a customer to edit or delete their details.</p>
      </div>

      {/* Search Bar */}
      <div className="mb-3 shrink-0 relative">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSearchResults([]); }}
              placeholder="Search by ID or mobile number..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
            {/* Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                {searchResults.map(c => (
                  <button key={c.id} type="button" onClick={() => handleSelectCustomer(c)}
                    className="w-full text-left px-4 py-2.5 hover:bg-green-50 border-b border-gray-100 last:border-0 transition-colors flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-gray-800 text-sm">{c.customerName}</span>
                      <span className="text-gray-400 text-xs ml-2">· {c.mobileNumber}</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{c.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1.5">
            <Search className="w-4 h-4" /> Search
          </button>
          {formData && (
            <button type="button" onClick={handleClearSearch}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5">
              <RefreshCcw className="w-4 h-4" /> Clear
            </button>
          )}
        </form>
      </div>

      {/* Empty State */}
      {!formData && (
        <div className="flex-1 bg-white border border-gray-100 rounded-lg shadow-sm flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-600 mb-1">Search for a Customer</h3>
          <p className="text-sm text-gray-400 max-w-xs">Type a customer ID or mobile number above and click Search to load their details.</p>
        </div>
      )}

      {/* Form */}
      {formData && (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
          {/* Customer badge */}
          <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex items-center gap-3 shrink-0">
            <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">ID: {formData.id}</span>
            <span className="text-xs text-gray-400">Editing customer record</span>
          </div>

          {/* Scrollable form area */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-4 gap-x-5 gap-y-3">

              {/* Row 1 */}
              <div>
                <label className={lbl}>Customer Name <span className="text-red-500">*</span></label>
                <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Guardian <span className="text-red-500">*</span></label>
                <input type="text" name="guardian" value={formData.guardian} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={inp} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={lbl}>Age <span className="text-red-500">*</span></label>
                  <input type="number" name="age" value={formData.age} onChange={handleInputChange} className={inp} />
                </div>
                <div className="flex-1">
                  <label className={lbl}>Gender</label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <label className="flex items-center text-xs cursor-pointer">
                      <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleInputChange} className="w-3.5 h-3.5 text-green-600" />
                      <span className="ml-1 text-gray-700">Male</span>
                    </label>
                    <label className="flex items-center text-xs cursor-pointer">
                      <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleInputChange} className="w-3.5 h-3.5 text-green-600" />
                      <span className="ml-1 text-gray-700">Female</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div>
                <label className={lbl}>Mobile Number <span className="text-red-500">*</span></label>
                <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Alternate Number</label>
                <input type="tel" name="alternateNumber" value={formData.alternateNumber} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Aadhaar No</label>
                <input type="text" name="aadhaarNo" value={formData.aadhaarNo} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>PAN No</label>
                <input type="text" name="panNo" value={formData.panNo} onChange={handleInputChange} className={inp} />
              </div>

              {/* Row 3 */}
              <div>
                <label className={lbl}>Door No/Street <span className="text-red-500">*</span></label>
                <input type="text" name="doorNo" value={formData.doorNo} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Area <span className="text-red-500">*</span></label>
                <input type="text" name="area" value={formData.area} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Postal Code</label>
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className={inp} />
              </div>

              {/* Row 4: Addresses */}
              <div className="col-span-2">
                <label className={lbl}>Permanent Address <span className="text-red-500">*</span></label>
                <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} rows="2" className={`${inp} resize-none`} />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Temporary Address <span className="text-red-500">*</span></label>
                <textarea name="temporaryAddress" value={formData.temporaryAddress || ''} onChange={handleInputChange} rows="2" className={`${inp} resize-none`} />
              </div>

              {/* Row 5 */}
              <div>
                <label className={lbl}>Voter ID</label>
                <input type="text" name="voterId" value={formData.voterId} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Occupation</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} className={inp} />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Remarks</label>
                <input type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} className={inp} />
              </div>

              {/* Uploads */}
              <div className="col-span-4 grid grid-cols-3 gap-5 pt-2">
                {[
                  { label: 'Photo', key: 'photo', ref: photoInputRef, accept: 'image/*' },
                  { label: 'Aadhar Document', key: 'aadharFile', ref: aadharInputRef, accept: '' },
                  { label: 'Proof 2 Document', key: 'proof2File', ref: proof2InputRef, accept: '' }
                ].map(({ label, key, ref, accept }) => (
                  <div key={key}>
                    <label className={lbl}>{label}</label>
                  <div className="flex items-center gap-2">
                    {key === 'proof2File' && (
                      <input type="text" name="proof2Name" value={formData.proof2Name} onChange={handleInputChange}
                        placeholder="Proof name" className="w-28 px-2 py-1.5 text-xs bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors shrink-0 outline-none" />
                    )}
                    <button type="button" onClick={() => ref.current.click()}
                      className="flex items-center px-3 py-1.5 bg-white border border-gray-300 shadow-sm rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 shrink-0 transition-colors">
                      <Upload className="w-3 h-3 mr-1" /> Browse
                    </button>
                    <span className="text-xs text-gray-500 truncate">{files[key] ? files[key].name : 'No file'}</span>
                    <input type="file" ref={ref} onChange={e => handleFileChange(e, key)} className="hidden" accept={accept} />
                  </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom Action Bar ── */}
          <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg flex items-center gap-3">
            <button onClick={handleUpdate}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500/30 transition-all shadow-sm">
              <Pencil className="w-4 h-4" /> Update Customer
            </button>
            <button onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-5 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-all">
              <Trash2 className="w-4 h-4" /> Delete Customer
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-800 text-center mb-1">Delete Customer?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete <strong>{formData?.customerName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-500 text-white font-semibold text-sm rounded-lg hover:bg-red-600 transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditDeleteCustomer;
