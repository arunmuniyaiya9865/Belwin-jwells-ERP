import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Save, RefreshCcw } from 'lucide-react';

const AddFollowup = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    loanNumber: '',
    dueAmount: '',
    dueDate: '',
    followupType: 'Due Reminder',
    nextCallDate: '',
    staffName: '',
    remarks: '',
    callStatus: 'Connected',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/followups', formData);
      if (response.data.success) {
        toast.success('Followup logged successfully!');
        setFormData({
          customerName: '',
          mobileNumber: '',
          loanNumber: '',
          dueAmount: '',
          dueDate: '',
          followupType: 'Due Reminder',
          nextCallDate: '',
          staffName: '',
          remarks: '',
          callStatus: 'Connected',
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving followup');
    }
  };

  const handleClear = () => {
    setFormData({
      customerName: '',
      mobileNumber: '',
      loanNumber: '',
      dueAmount: '',
      dueDate: '',
      followupType: 'Due Reminder',
      nextCallDate: '',
      staffName: '',
      remarks: '',
      callStatus: 'Connected',
    });
  };

  const inp = "w-full px-3 py-1.5 text-base bg-white border border-gray-300 shadow-sm rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-sm font-semibold text-gray-700 mb-0.5";

  return (
    <div className="flex flex-col">
      <div className="mb-3 shrink-0">
        <h2 className="text-2xl font-bold text-text-primary">Followup Call</h2>
      </div>
      
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex-1 flex flex-col">
        <div className="p-4 flex-1">
          <form id="add-followup-form" onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Call Details</h3>
              <div className="grid grid-cols-3 gap-6">
                {/* Customer Name */}
                <div>
                  <label className={lbl}>Customer Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className={inp}
                    placeholder="Enter customer name"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className={lbl}>Mobile Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    className={inp}
                    placeholder="Enter mobile number"
                  />
                </div>

                {/* Loan Number */}
                <div>
                  <label className={lbl}>Loan Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="loanNumber"
                    value={formData.loanNumber}
                    onChange={handleChange}
                    required
                    className={inp}
                    placeholder="Enter loan number"
                  />
                </div>

                {/* Due Amount */}
                <div>
                  <label className={lbl}>Due Amount <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="dueAmount"
                    value={formData.dueAmount}
                    onChange={handleChange}
                    required
                    className={inp}
                    placeholder="Enter due amount"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className={lbl}>Due Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                    className={inp}
                  />
                </div>

                {/* Followup Type */}
                <div>
                  <label className={lbl}>Followup Type <span className="text-red-500">*</span></label>
                  <select
                    name="followupType"
                    value={formData.followupType}
                    onChange={handleChange}
                    className={inp}
                  >
                    <option value="Due Reminder">Due Reminder</option>
                    <option value="Interest Reminder">Interest Reminder</option>
                    <option value="Overdue Reminder">Overdue Reminder</option>
                    <option value="Auction Warning">Auction Warning</option>
                    <option value="Repledge Reminder">Repledge Reminder</option>
                  </select>
                </div>

                {/* Next Call Date */}
                <div>
                  <label className={lbl}>Next Call Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="nextCallDate"
                    value={formData.nextCallDate}
                    onChange={handleChange}
                    required
                    className={inp}
                  />
                </div>

                {/* Staff Name */}
                <div>
                  <label className={lbl}>Staff Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="staffName"
                    value={formData.staffName}
                    onChange={handleChange}
                    required
                    className={inp}
                    placeholder="Enter staff name"
                  />
                </div>

                {/* Call Status */}
                <div>
                  <label className={lbl}>Call Status <span className="text-red-500">*</span></label>
                  <select
                    name="callStatus"
                    value={formData.callStatus}
                    onChange={handleChange}
                    className={inp}
                  >
                    <option value="Connected">Connected</option>
                    <option value="Not Reachable">Not Reachable</option>
                    <option value="Will Pay">Will Pay</option>
                    <option value="Call Back Later">Call Back Later</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Remarks / Customer Response */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Additional Info</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className={lbl}>Customer Response / Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows="3"
                    className={`${inp} resize-none`}
                    placeholder="Enter remarks..."
                  ></textarea>
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
            form="add-followup-form"
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

export default AddFollowup;
