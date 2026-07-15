import { useState } from 'react';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import { Send } from 'lucide-react';

const SendGoldRequest = () => {
  const [formData, setFormData] = useState({
    requestNo: '',
    date: new Date().toISOString().split('T')[0],

    itemName: '',
    goldType: '',
    weight: '',
    purity: '',
    quantity: '',
    reason: '',
    requestedTo: 'Head Office',
    status: 'Pending',
    remarks: '',
    requestedBy: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/gold-requests', formData);
      if (response.data.success) {
        toast.success('Gold Request sent successfully!');
        setFormData({
          requestNo: '',
          date: new Date().toISOString().split('T')[0],

          itemName: '',
          goldType: '',
          weight: '',
          purity: '',
          quantity: '',
          reason: '',
          requestedTo: 'Head Office',
          status: 'Pending',
          remarks: '',
          requestedBy: '',
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving gold request');
    }
  };

  const inp = "w-full px-3 py-1.5 text-base bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-sm font-semibold text-gray-700 mb-0.5";

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3 shrink-0">
        <h2 className="text-2xl font-bold text-text-primary">Send Gold Request</h2>
      </div>
      
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex-1 overflow-y-auto">
          <form id="send-gold-form" onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Request Details</h3>
              <div className="grid grid-cols-3 gap-6">
                {/* Request No */}
                <div>
                  <label className={lbl}>Request No <span className="text-red-500">*</span></label>
                  <input type="text" name="requestNo" value={formData.requestNo} onChange={handleChange} required className={inp} placeholder="Enter request no" />
                </div>

                {/* Date */}
                <div>
                  <label className={lbl}>Date <span className="text-red-500">*</span></label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required className={inp} />
                </div>

                {/* Item Name */}
                <div>
                  <label className={lbl}>Item Name <span className="text-red-500">*</span></label>
                  <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} required className={inp} placeholder="e.g. Necklace, Bangle" />
                </div>

                {/* Gold Type */}
                <div>
                  <label className={lbl}>Gold Type <span className="text-red-500">*</span></label>
                  <input type="text" name="goldType" value={formData.goldType} onChange={handleChange} required className={inp} placeholder="e.g. 22K, 24K" />
                </div>

                {/* Weight */}
                <div>
                  <label className={lbl}>Weight (grams) <span className="text-red-500">*</span></label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} required className={inp} placeholder="Enter weight" />
                </div>

                {/* Purity */}
                <div>
                  <label className={lbl}>Purity <span className="text-red-500">*</span></label>
                  <input type="text" name="purity" value={formData.purity} onChange={handleChange} required className={inp} placeholder="e.g. 91.6%" />
                </div>

                {/* Quantity */}
                <div>
                  <label className={lbl}>Quantity <span className="text-red-500">*</span></label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required className={inp} placeholder="Enter quantity" />
                </div>

                {/* Requested To */}
                <div>
                  <label className={lbl}>Requested To <span className="text-red-500">*</span></label>
                  <select name="requestedTo" value={formData.requestedTo} onChange={handleChange} className={inp}>
                    <option value="Head Office">Head Office</option>
                    <option value="Main Branch">Main Branch</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className={lbl}>Status <span className="text-red-500">*</span></label>
                  <select name="status" value={formData.status} onChange={handleChange} className={inp}>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Sent / Received">Sent / Received</option>
                  </select>
                </div>

                {/* Requested By */}
                <div>
                  <label className={lbl}>Requested By <span className="text-red-500">*</span></label>
                  <input type="text" name="requestedBy" value={formData.requestedBy} onChange={handleChange} required className={inp} placeholder="Enter staff name" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Additional Info</h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Reason */}
                <div>
                  <label className={lbl}>Reason for Request <span className="text-red-500">*</span></label>
                  <textarea name="reason" value={formData.reason} onChange={handleChange} required rows="3" className={`${inp} resize-none`} placeholder="Enter reason..."></textarea>
                </div>
                {/* Remarks */}
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
          <button type="submit" form="send-gold-form" className="px-6 py-1.5 text-[15px] bg-erp-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50 w-auto tracking-wide">
            <Send className="w-4 h-4 mr-1.5" /> Send Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendGoldRequest;
