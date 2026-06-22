import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Upload, Save, RefreshCcw } from 'lucide-react';
import { saveLoan } from '../utils/loanStore';

const emptyForm = {
  // Customer Info
  customerId: '', customerName: '', mobileNumber: '', aadhaarNo: '', address: '',
  // Gold Info
  ornamentType: '', ornamentCount: '', grossWeight: '', netWeight: '', stoneWeight: '', purity: '22K', goldRate: '', goldValue: '',
  // Loan Info
  loanDate: '', loanAmount: '', interestRate: '', loanPeriod: '', dueDate: '', processingFee: '', loanOfficer: '',
  // Payment Info
  disbursementMode: 'Cash', transactionRefNo: '', remarks: '',
  // Status
  status: 'Pending'
};

const ProvideLoan = () => {
  const [formData, setFormData] = useState({ ...emptyForm });
  const [files, setFiles] = useState({ customerPhoto: null, ornamentPhotos: null });

  const customerPhotoRef = useRef(null);
  const ornamentPhotosRef = useRef(null);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e, fileType) => e.target.files?.[0] && setFiles(prev => ({ ...prev, [fileType]: e.target.files[0] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = ['customerName', 'mobileNumber', 'ornamentType', 'grossWeight', 'loanAmount', 'interestRate'];
    if (required.some(f => !formData[f])) return toast.error('Please fill in all required fields');
    
    saveLoan(formData);
    toast.success('Loan created successfully!');
    handleClear();
  };

  const handleClear = () => {
    setFormData({ ...emptyForm });
    setFiles({ customerPhoto: null, ornamentPhotos: null });
    if (customerPhotoRef.current) customerPhotoRef.current.value = '';
    if (ornamentPhotosRef.current) ornamentPhotosRef.current.value = '';
  };

  const inp = "w-full px-3 py-1.5 text-base bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-sm font-semibold text-gray-700 mb-0.5";
  const sectionTitle = "text-lg font-bold text-green-700 mb-3 border-b pb-1 mt-4";

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Title */}
      <div className="mb-3 shrink-0">
        <h2 className="text-2xl font-bold text-text-primary">Provide Loan</h2>
        <p className="text-xs text-text-secondary mt-0.5">Fields marked with <span className="text-red-500">*</span> are required.</p>
      </div>

      {/* Form card */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex-1 overflow-auto">
          <form id="provide-loan-form" onSubmit={handleSubmit} className="grid grid-cols-4 gap-x-5 gap-y-3">

            {/* ── Customer Information ── */}
            <div className="col-span-4"><h3 className={sectionTitle}>Customer Information</h3></div>
            <div>
              <label className={lbl}>Customer ID</label>
              <input type="text" name="customerId" value={formData.customerId} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Customer Name <span className="text-red-500">*</span></label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Mobile Number <span className="text-red-500">*</span></label>
              <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Aadhaar Number</label>
              <input type="text" name="aadhaarNo" value={formData.aadhaarNo} onChange={handleInputChange} className={inp} />
            </div>
            <div className="col-span-2">
              <label className={lbl}>Address</label>
              <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" className={`${inp} resize-none`} />
            </div>
            <div className="col-span-2 pt-2">
              <label className={lbl}>Customer Photo</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => customerPhotoRef.current.click()}
                  className="flex items-center px-3 py-1.5 bg-white border border-gray-300 shadow-sm rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 shrink-0 transition-colors">
                  <Upload className="w-3 h-3 mr-1" /> Browse
                </button>
                <span className="text-xs text-gray-500 truncate">{files.customerPhoto ? files.customerPhoto.name : 'No file'}</span>
                <input type="file" ref={customerPhotoRef} onChange={e => handleFileChange(e, 'customerPhoto')} className="hidden" accept="image/*" />
              </div>
            </div>

            {/* ── Gold Information ── */}
            <div className="col-span-4"><h3 className={sectionTitle}>Gold Information</h3></div>
            <div>
              <label className={lbl}>Ornament Type <span className="text-red-500">*</span></label>
              <input type="text" name="ornamentType" placeholder="Chain, Ring, etc." value={formData.ornamentType} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Ornament Count</label>
              <input type="number" name="ornamentCount" value={formData.ornamentCount} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Gross Weight (g) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" name="grossWeight" value={formData.grossWeight} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Net Weight (g)</label>
              <input type="number" step="0.01" name="netWeight" value={formData.netWeight} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Stone Weight (g)</label>
              <input type="number" step="0.01" name="stoneWeight" value={formData.stoneWeight} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Purity</label>
              <select name="purity" value={formData.purity} onChange={handleInputChange} className={inp}>
                <option value="18K">18K</option>
                <option value="22K">22K</option>
                <option value="24K">24K</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Gold Rate (Today)</label>
              <input type="number" step="0.01" name="goldRate" value={formData.goldRate} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Gold Value</label>
              <input type="number" step="0.01" name="goldValue" value={formData.goldValue} onChange={handleInputChange} className={inp} />
            </div>
            <div className="col-span-4 pt-2">
              <label className={lbl}>Ornament Photos</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => ornamentPhotosRef.current.click()}
                  className="flex items-center px-3 py-1.5 bg-white border border-gray-300 shadow-sm rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 shrink-0 transition-colors">
                  <Upload className="w-3 h-3 mr-1" /> Browse
                </button>
                <span className="text-xs text-gray-500 truncate">{files.ornamentPhotos ? files.ornamentPhotos.name : 'No file'}</span>
                <input type="file" ref={ornamentPhotosRef} onChange={e => handleFileChange(e, 'ornamentPhotos')} className="hidden" accept="image/*" multiple />
              </div>
            </div>

            {/* ── Loan Information ── */}
            <div className="col-span-4"><h3 className={sectionTitle}>Loan Information</h3></div>
            <div>
              <label className={lbl}>Loan Date</label>
              <input type="date" name="loanDate" value={formData.loanDate} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Loan Amount <span className="text-red-500">*</span></label>
              <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Interest Rate (%) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" name="interestRate" value={formData.interestRate} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Loan Period (Months)</label>
              <input type="number" name="loanPeriod" value={formData.loanPeriod} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Due Date</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Processing Fee</label>
              <input type="number" name="processingFee" value={formData.processingFee} onChange={handleInputChange} className={inp} />
            </div>
            <div className="col-span-2">
              <label className={lbl}>Loan Officer</label>
              <input type="text" name="loanOfficer" value={formData.loanOfficer} onChange={handleInputChange} className={inp} />
            </div>

            {/* ── Payment Information ── */}
            <div className="col-span-4"><h3 className={sectionTitle}>Payment Information</h3></div>
            <div>
              <label className={lbl}>Disbursement Mode</label>
              <select name="disbursementMode" value={formData.disbursementMode} onChange={handleInputChange} className={inp}>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Transaction Reference No</label>
              <input type="text" name="transactionRefNo" value={formData.transactionRefNo} onChange={handleInputChange} className={inp} />
            </div>
            <div className="col-span-2">
              <label className={lbl}>Remarks</label>
              <input type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} className={inp} />
            </div>

          </form>
        </div>

        {/* ── Bottom Action Bar ── */}
        <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg flex items-center gap-3">
          <button form="provide-loan-form" type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500/30 transition-all shadow-sm">
            <Save className="w-4 h-4" /> Save Loan
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

export default ProvideLoan;
