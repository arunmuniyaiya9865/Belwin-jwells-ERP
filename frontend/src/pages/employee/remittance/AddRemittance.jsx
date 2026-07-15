import { useState } from 'react';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import { Save, RefreshCcw } from 'lucide-react';

const AddRemittance = () => {
  const [formData, setFormData] = useState({
    remittanceNo: '',
    date: new Date().toISOString().split('T')[0],
    remittanceType: 'Cash Transfer',
    amount: '',
    fromPerson: '',
    toPerson: '',
    paymentMode: 'Cash',
    referenceNo: '',
    remarks: '',
    enteredBy: '',
    status: 'Pending',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/remittances', formData);
      if (response.data.success) {
        toast.success('Remittance added successfully!');
        setFormData({
          remittanceNo: '',
          date: new Date().toISOString().split('T')[0],
          remittanceType: 'Cash Transfer',
          amount: '',
          fromPerson: '',
          toPerson: '',
          paymentMode: 'Cash',
          referenceNo: '',
          remarks: '',
          enteredBy: '',
          status: 'Pending',
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving remittance');
    }
  };

  const handleClear = () => {
    setFormData({
      remittanceNo: '',
      date: new Date().toISOString().split('T')[0],
      remittanceType: 'Cash Transfer',
      amount: '',
      fromPerson: '',
      toPerson: '',
      paymentMode: 'Cash',
      referenceNo: '',
      remarks: '',
      enteredBy: '',
      status: 'Pending',
    });
  };

  const inp = "w-full px-3 py-1.5 text-base bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-sm font-semibold text-gray-700 mb-0.5";

  return (
    <div className="flex flex-col">
      <div className="mb-3 shrink-0">
        <h2 className="text-2xl font-bold text-text-primary">Add New Remittance</h2>
      </div>
      
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex-1 flex flex-col">
        <div className="p-4 flex-1">
          <form id="add-remittance-form" onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Details</h3>
              <div className="grid grid-cols-3 gap-6">
                {/* Remittance No */}
                <div>
                  <label className={lbl}>Remittance No <span className="text-red-500">*</span></label>
                  <input type="text" name="remittanceNo" value={formData.remittanceNo} onChange={handleChange} required className={inp} placeholder="Enter remittance no" />
                </div>

                {/* Date */}
                <div>
                  <label className={lbl}>Date <span className="text-red-500">*</span></label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required className={inp} />
                </div>

                {/* Remittance Type */}
                <div>
                  <label className={lbl}>Remittance Type <span className="text-red-500">*</span></label>
                  <select name="remittanceType" value={formData.remittanceType} onChange={handleChange} className={inp}>
                    <option value="Cash Transfer">Cash Transfer</option>
                    <option value="Bank Deposit">Bank Deposit</option>
                    <option value="Head Office Transfer">Head Office Transfer</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className={lbl}>Amount <span className="text-red-500">*</span></label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className={inp} placeholder="Enter amount" />
                </div>

                {/* From */}
                <div>
                  <label className={lbl}>From Person <span className="text-red-500">*</span></label>
                  <input type="text" name="fromPerson" value={formData.fromPerson} onChange={handleChange} required className={inp} placeholder="Enter sender details" />
                </div>

                {/* To */}
                <div>
                  <label className={lbl}>To Person <span className="text-red-500">*</span></label>
                  <input type="text" name="toPerson" value={formData.toPerson} onChange={handleChange} required className={inp} placeholder="Enter receiver details" />
                </div>

                {/* Payment Mode */}
                <div>
                  <label className={lbl}>Payment Mode <span className="text-red-500">*</span></label>
                  <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className={inp}>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                {/* Reference No */}
                <div>
                  <label className={lbl}>Reference No</label>
                  <input type="text" name="referenceNo" value={formData.referenceNo} onChange={handleChange} className={inp} placeholder="Txn ID / Details" />
                </div>

                {/* Entered By */}
                <div>
                  <label className={lbl}>Entered By <span className="text-red-500">*</span></label>
                  <input type="text" name="enteredBy" value={formData.enteredBy} onChange={handleChange} required className={inp} placeholder="Enter staff name" />
                </div>

                {/* Status */}
                <div>
                  <label className={lbl}>Status <span className="text-red-500">*</span></label>
                  <select name="status" value={formData.status} onChange={handleChange} className={inp}>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Additional Info</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className={lbl}>Remarks</label>
                  <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="3" className={`${inp} resize-none`} placeholder="Enter remarks..."></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm"
          >
            <RefreshCcw className="w-4 h-4 mr-1.5" />
            Clear
          </button>
          <button
            form="add-remittance-form"
            type="submit"
            className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center shadow-sm"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRemittance;
