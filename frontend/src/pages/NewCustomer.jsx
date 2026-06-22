import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Upload, Save, RefreshCcw } from 'lucide-react';
import { saveCustomer } from '../utils/customerStore';

const emptyForm = {
  customerName: '', guardian: '', dob: '', age: '', gender: 'Male',
  mobileNumber: '', alternateNumber: '', aadhaarNo: '', doorNo: '',
  area: '', city: '', postalCode: '',
  permanentAddress: '', temporaryAddress: '',
  voterId: '', panNo: '', occupation: '', proof2Name: '', remarks: ''
};

const NewCustomer = () => {
  const [formData, setFormData] = useState({ ...emptyForm });
  const [files, setFiles] = useState({ photo: null, aadharFile: null, proof2File: null });

  const photoInputRef = useRef(null);
  const aadharInputRef = useRef(null);
  const proof2InputRef = useRef(null);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e, fileType) => e.target.files?.[0] && setFiles(prev => ({ ...prev, [fileType]: e.target.files[0] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = ['customerName', 'guardian', 'age', 'mobileNumber', 'doorNo', 'area'];
    if (required.some(f => !formData[f])) return toast.error('Please fill in all required fields');
    saveCustomer(formData);
    toast.success('Customer saved successfully!');
    handleClear();
  };

  const handleClear = () => {
    setFormData({ ...emptyForm });
    setFiles({ photo: null, aadharFile: null, proof2File: null });
    [photoInputRef, aadharInputRef, proof2InputRef].forEach(r => r.current && (r.current.value = ''));
  };

  const inp = "w-full px-3 py-1.5 text-base bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-sm font-semibold text-gray-700 mb-0.5";

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Title */}
      <div className="mb-3 shrink-0">
        <h2 className="text-2xl font-bold text-text-primary">Add New Customer</h2>
        <p className="text-xs text-text-secondary mt-0.5">Fields marked with <span className="text-red-500">*</span> are required.</p>
      </div>

      {/* Form card */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex-1 overflow-auto">
          <form id="new-customer-form" onSubmit={handleSubmit} className="grid grid-cols-4 gap-x-5 gap-y-3">

            {/* ── Row 1: Personal ── */}
            <div>
              <label className={lbl}>Customer Name <span className="text-red-500">*</span></label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Guardian <span className="text-red-500">*</span></label>
              <input type="text" name="guardian" value={formData.guardian} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={inp} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className={lbl}>Age <span className="text-red-500">*</span></label>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} className={inp} required />
              </div>
              <div className="flex-1">
                <label className={lbl}>Gender</label>
                <div className="flex items-center gap-3 mt-1.5">
                  <label className="flex items-center text-xs cursor-pointer">
                    <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleInputChange} className="w-3.5 h-3.5 text-green-600 focus:ring-green-500" />
                    <span className="ml-1 text-gray-700">Male</span>
                  </label>
                  <label className="flex items-center text-xs cursor-pointer">
                    <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleInputChange} className="w-3.5 h-3.5 text-green-600 focus:ring-green-500" />
                    <span className="ml-1 text-gray-700">Female</span>
                  </label>
                </div>
              </div>
            </div>

            {/* ── Row 2: Contact ── */}
            <div>
              <label className={lbl}>Mobile Number <span className="text-red-500">*</span></label>
              <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className={inp} required />
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

            {/* ── Row 3: Address fields ── */}
            <div>
              <label className={lbl}>Door No/Street <span className="text-red-500">*</span></label>
              <input type="text" name="doorNo" value={formData.doorNo} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Area <span className="text-red-500">*</span></label>
              <input type="text" name="area" value={formData.area} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Postal Code</label>
              <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className={inp} />
            </div>

            {/* ── Row 4: Address textareas ── */}
            <div className="col-span-2">
              <label className={lbl}>Permanent Address <span className="text-red-500">*</span></label>
              <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} rows="2" className={`${inp} resize-none`} />
            </div>
            <div className="col-span-2">
              <label className={lbl}>Temporary Address <span className="text-red-500">*</span></label>
              <textarea name="temporaryAddress" value={formData.temporaryAddress} onChange={handleInputChange} rows="2" className={`${inp} resize-none`} />
            </div>

            {/* ── Row 5: IDs ── */}
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

            {/* ── Uploads ── */}
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

          </form>
        </div>

        {/* ── Bottom Action Bar ── */}
        <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg flex items-center gap-3">
          <button form="new-customer-form" type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500/30 transition-all shadow-sm">
            <Save className="w-4 h-4" /> Save Customer
          </button>
          <button type="button" onClick={handleClear}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all">
            <RefreshCcw className="w-4 h-4" /> Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewCustomer;
