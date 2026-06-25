import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Send } from 'lucide-react';

const SendGoldRequest = () => {
  const [formData, setFormData] = useState({
    requestNo: '',
    date: new Date().toISOString().split('T')[0],
    branchName: '',
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
      const response = await axios.post('http://localhost:5000/api/gold-requests', formData);
      if (response.data.success) {
        toast.success('Gold Request sent successfully!');
        setFormData({
          requestNo: '',
          date: new Date().toISOString().split('T')[0],
          branchName: '',
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

  const inp = "w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-black";
  const lbl = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="h-full w-full flex flex-col p-4 md:p-8">
      <h2 className="text-2xl font-bold text-black mb-6">Send Gold Request</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Request No */}
          <div>
            <label className={lbl}>Request No</label>
            <input type="text" name="requestNo" value={formData.requestNo} onChange={handleChange} required className={inp} placeholder="Enter request no" />
          </div>

          {/* Date */}
          <div>
            <label className={lbl}>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required className={inp} />
          </div>

          {/* Branch Name */}
          <div>
            <label className={lbl}>Branch Name</label>
            <input type="text" name="branchName" value={formData.branchName} onChange={handleChange} required className={inp} placeholder="Enter branch name" />
          </div>

          {/* Item Name */}
          <div>
            <label className={lbl}>Item Name</label>
            <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} required className={inp} placeholder="e.g. Necklace, Bangle" />
          </div>

          {/* Gold Type */}
          <div>
            <label className={lbl}>Gold Type</label>
            <input type="text" name="goldType" value={formData.goldType} onChange={handleChange} required className={inp} placeholder="e.g. 22K, 24K" />
          </div>

          {/* Weight */}
          <div>
            <label className={lbl}>Weight (grams)</label>
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} required className={inp} placeholder="Enter weight" />
          </div>

          {/* Purity */}
          <div>
            <label className={lbl}>Purity</label>
            <input type="text" name="purity" value={formData.purity} onChange={handleChange} required className={inp} placeholder="e.g. 91.6%" />
          </div>

          {/* Quantity */}
          <div>
            <label className={lbl}>Quantity</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required className={inp} placeholder="Enter quantity" />
          </div>

          {/* Requested To */}
          <div>
            <label className={lbl}>Requested To</label>
            <select name="requestedTo" value={formData.requestedTo} onChange={handleChange} className={inp}>
              <option value="Head Office">Head Office</option>
              <option value="Main Branch">Main Branch</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={lbl}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className={inp}>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Sent / Received">Sent / Received</option>
            </select>
          </div>

          {/* Requested By */}
          <div>
            <label className={lbl}>Requested By</label>
            <input type="text" name="requestedBy" value={formData.requestedBy} onChange={handleChange} required className={inp} placeholder="Enter staff name" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reason */}
            <div>
              <label className={lbl}>Reason for Request</label>
              <textarea name="reason" value={formData.reason} onChange={handleChange} required rows="3" className={`${inp} resize-none`} placeholder="Enter reason..."></textarea>
            </div>
            {/* Remarks */}
            <div>
              <label className={lbl}>Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="3" className={`${inp} resize-none`} placeholder="Enter remarks..."></textarea>
            </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-300">
          <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
            <Send className="w-5 h-5" /> Send Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendGoldRequest;
