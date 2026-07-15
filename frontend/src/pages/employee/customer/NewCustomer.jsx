import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload, Save, RefreshCcw } from 'lucide-react';
import { createCustomer } from '../../../services/customerService';
import { calculateAge } from '../../../utils/calculateAge';

const emptyForm = {
  customerName: '', guardian: '', dob: '', age: '',
  mobileNumber: '', alternateNumber: '', email: '', aadhaarNo: '', doorNo: '',
  area: '', city: '', district: '', state: '',
  permanentAddress: '', temporaryAddress: '',
  voterId: '', occupation: '', remarks: '', proof2Name: '', proof2Number: ''
};

const NewCustomer = () => {
  const [formData, setFormData] = useState({ ...emptyForm });
  const [files, setFiles] = useState({ photo: null, aadharFile: null, proof2File: null });
  const [isSameAddress, setIsSameAddress] = useState(false);

  useEffect(() => {
    const parts = [formData.doorNo, formData.area, formData.city, formData.district, formData.state].filter(p => p && p.trim() !== '');
    if (parts.length > 0) {
      const newAddress = parts.join(', ');
      setFormData(prev => ({
        ...prev,
        permanentAddress: newAddress,
        ...(isSameAddress ? { temporaryAddress: newAddress } : {})
      }));
    }
  }, [formData.doorNo, formData.area, formData.city, formData.district, formData.state, isSameAddress]);

  const photoInputRef = useRef(null);
  const aadharInputRef = useRef(null);
  const proof2InputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dob') {
        const { age, error } = calculateAge(value);
        if (error) toast.error(error);
        
        setFormData(prev => ({ 
            ...prev, 
            dob: value,
            age: error ? '' : age 
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleFileChange = (e, fileType) => e.target.files?.[0] && setFiles(prev => ({ ...prev, [fileType]: e.target.files[0] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['customerName', 'guardian', 'age', 'mobileNumber', 'doorNo', 'area', 'permanentAddress', 'temporaryAddress'];
    if (required.some(f => !formData[f])) return toast.error('Please fill in all required fields');
    
    if (formData.dob) {
        const { age: finalAge, error } = calculateAge(formData.dob);
        if (error) return toast.error(error);
        formData.age = finalAge; // ensure accurate age before save
    }
    try {
      const payload = {
        customerName: formData.customerName,
        guardianName: formData.guardian,
        dateOfBirth: formData.dob || undefined,
        age: Number(formData.age),
        mobileNumber: formData.mobileNumber,
        alternateNumber: formData.alternateNumber,
        email: formData.email,
        aadhaarNumber: formData.aadhaarNo,
        doorStreet: formData.doorNo,
        area: formData.area,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        permanentAddress: formData.permanentAddress,
        temporaryAddress: formData.temporaryAddress,
        voterId: formData.voterId,
        occupation: formData.occupation,
        remarks: formData.remarks,
        proof2Name: formData.proof2Name,
        proof2Number: formData.proof2Number,
      };

      const filePayload = {
        photo: files.photo,
        aadhaarDoc: files.aadharFile,
        proof2Doc: files.proof2File
      };

      await createCustomer(payload, filePayload);
      toast.success('Customer profile created successfully! Sent for approval.');
      handleClear();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create customer');
    }
  };

  const handleClear = () => {
    setFormData({ ...emptyForm });
    setFiles({ photo: null, aadharFile: null, proof2File: null });
    setIsSameAddress(false);
    [photoInputRef, aadharInputRef, proof2InputRef].forEach(r => r.current && (r.current.value = ''));
  };

  const inp = "w-full px-3 py-1.5 text-base bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-sm font-semibold text-gray-700 mb-0.5";

  return (
    <div className="flex flex-col">
      {/* Title */}
      <div className="mb-3 shrink-0">
        <h2 className="text-2xl font-bold text-text-primary">Add New Customer</h2>
        <p className="text-xs text-text-secondary mt-0.5">Fields marked with <span className="text-red-500">*</span> are required.</p>
      </div>

      {/* Form card */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex-1 flex flex-col">
        <div className="p-4 flex-1">
          <form id="new-customer-form" onSubmit={handleSubmit} className="grid grid-cols-3 gap-x-5 gap-y-4">

            {/* ── Row 1 ── */}
            <div>
              <label className={lbl}>Customer Name <span className="text-red-500">*</span></label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Guardian <span className="text-red-500">*</span></label>
              <input type="text" name="guardian" value={formData.guardian} onChange={handleInputChange} className={inp} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Age <span className="text-red-500">*</span></label>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} className={`${inp} bg-gray-50`} required min="1" max="120" readOnly />
              </div>
            </div>

            {/* ── Row 2 ── */}
            <div>
              <label className={lbl}>Mobile Number <span className="text-red-500">*</span></label>
              <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Alternate Number</label>
              <input type="tel" name="alternateNumber" value={formData.alternateNumber} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Aadhaar No</label>
              <input type="text" name="aadhaarNo" value={formData.aadhaarNo} onChange={handleInputChange} className={inp} />
            </div>

            {/* ── Row 3 ── */}
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
              <label className={lbl}>District</label>
              <input type="text" name="district" value={formData.district} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>State</label>
              <input type="text" name="state" value={formData.state} onChange={handleInputChange} className={inp} />
            </div>

            {/* ── Row 4 ── */}
            <div>
              <label className={lbl}>Permanent Address <span className="text-red-500">*</span></label>
              <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} rows="2" className={`${inp} resize-none`} required />
            </div>
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <label className="block text-sm font-semibold text-gray-700">Temporary Address <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="sameAsPermanent" 
                    className="cursor-pointer"
                    checked={isSameAddress}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsSameAddress(checked);
                      if (checked) {
                        setFormData(prev => ({ ...prev, temporaryAddress: prev.permanentAddress }));
                      }
                    }} 
                  />
                  <label htmlFor="sameAsPermanent" className="text-xs text-gray-500 cursor-pointer font-medium hover:text-gray-700">Same as Permanent</label>
                </div>
              </div>
              <textarea name="temporaryAddress" value={formData.temporaryAddress} onChange={handleInputChange} rows="2" className={`${inp} resize-none`} required />
            </div>

            {/* ── Row 5 ── */}
            <div>
              <label className={lbl}>Voter ID</label>
              <input type="text" name="voterId" value={formData.voterId} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Occupation</label>
              <input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Remarks</label>
              <input type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} className={inp} />
            </div>

            {/* ── Uploads ── */}
            <div className="col-span-3 grid grid-cols-3 gap-5 pt-4">
              {[
                { label: 'Photo', key: 'photo', ref: photoInputRef, accept: 'image/*' },
                { label: 'Aadhar Document', key: 'aadharFile', ref: aadharInputRef, accept: '' },
                { label: 'Proof 2 Document', key: 'proof2File', ref: proof2InputRef, accept: '' }
              ].map(({ label, key, ref, accept }) => (
                <div key={key}>
                  <label className={lbl}>{label}</label>
                  <div className="flex items-center gap-2">
                    {key === 'proof2File' && (
                      <div className="flex gap-2">
                        <input type="text" name="proof2Name" value={formData.proof2Name} onChange={handleInputChange}
                          placeholder="Proof name (e.g. PAN)" className="w-24 px-2 py-1.5 text-xs bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors shrink-0 outline-none" />
                        <input type="text" name="proof2Number" value={formData.proof2Number} onChange={handleInputChange}
                          placeholder="ID Number" className="w-28 px-2 py-1.5 text-xs bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors shrink-0 outline-none" />
                      </div>
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
