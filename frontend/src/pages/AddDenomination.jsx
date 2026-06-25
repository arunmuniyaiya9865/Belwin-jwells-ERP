import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AddDenomination = () => {
  const [formData, setFormData] = useState({
    denominationId: '',
    entryDate: new Date().toISOString().split('T')[0],
    branchName: '',
    cashInHandTotal: '',
    notes500: '',
    notes200: '',
    notes100: '',
    notes50: '',
    notes20: '',
    notes10: '',
    coinsTotal: '',
    enteredBy: '',
    verifiedBy: '',
    verifiedTime: '',
    remarks: ''
  });

  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNextId();
  }, []);

  const fetchNextId = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/denominations/next-id');
      const data = await response.json();
      if (data.nextId) {
        setFormData(prev => ({ ...prev, denominationId: data.nextId }));
      }
    } catch (error) {
      console.error('Error fetching next Denomination ID:', error);
    }
  };

  // Auto-calculate Grand Total
  useEffect(() => {
    const total = 
      (Number(formData.notes500) || 0) * 500 +
      (Number(formData.notes200) || 0) * 200 +
      (Number(formData.notes100) || 0) * 100 +
      (Number(formData.notes50) || 0) * 50 +
      (Number(formData.notes20) || 0) * 20 +
      (Number(formData.notes10) || 0) * 10 +
      (Number(formData.coinsTotal) || 0);
    
    setGrandTotal(total);
  }, [
    formData.notes500, formData.notes200, formData.notes100, 
    formData.notes50, formData.notes20, formData.notes10, 
    formData.coinsTotal
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        grandTotal
      };

      const response = await fetch('http://localhost:5000/api/denominations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Denomination verified and saved successfully!');
        // Reset form but keep date
        setFormData({
          denominationId: '',
          entryDate: new Date().toISOString().split('T')[0],
          branchName: '',
          cashInHandTotal: '',
          notes500: '',
          notes200: '',
          notes100: '',
          notes50: '',
          notes20: '',
          notes10: '',
          coinsTotal: '',
          enteredBy: '',
          verifiedBy: '',
          verifiedTime: '',
          remarks: ''
        });
        fetchNextId();
      } else {
        toast.error(data.message || 'Failed to save denomination');
      }
    } catch (error) {
      console.error('Error saving denomination:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isMatching = grandTotal === (Number(formData.cashInHandTotal) || 0);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="mb-3 shrink-0">
        <h2 className="text-2xl font-bold text-text-primary">Add Denomination (Cash Closing)</h2>
        <p className="text-sm text-gray-500">For daily cash closing, counter verification, and audit matching.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex-1 overflow-auto">
          <form id="add-denomination-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Core Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Core Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Denomination ID <span className="text-red-500">*</span></label>
                  <input required type="text" name="denominationId" value={formData.denominationId} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entry Date <span className="text-red-500">*</span></label>
                  <input required type="date" name="entryDate" value={formData.entryDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name <span className="text-red-500">*</span></label>
                  <input required type="text" name="branchName" value={formData.branchName} onChange={handleChange} placeholder="Main Branch" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cash In Hand Total (System) <span className="text-red-500">*</span></label>
                  <input required type="number" name="cashInHandTotal" value={formData.cashInHandTotal} onChange={handleChange} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green font-bold text-blue-700 bg-blue-50" />
                </div>
              </div>
            </div>

            {/* Denomination Counts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Denomination Counts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <span className="w-16 font-semibold text-gray-700 text-right">₹500 ×</span>
                  <input type="number" min="0" name="notes500" value={formData.notes500} onChange={handleChange} placeholder="Count" className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 font-semibold text-gray-700 text-right">₹200 ×</span>
                  <input type="number" min="0" name="notes200" value={formData.notes200} onChange={handleChange} placeholder="Count" className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 font-semibold text-gray-700 text-right">₹100 ×</span>
                  <input type="number" min="0" name="notes100" value={formData.notes100} onChange={handleChange} placeholder="Count" className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 font-semibold text-gray-700 text-right">₹50 ×</span>
                  <input type="number" min="0" name="notes50" value={formData.notes50} onChange={handleChange} placeholder="Count" className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 font-semibold text-gray-700 text-right">₹20 ×</span>
                  <input type="number" min="0" name="notes20" value={formData.notes20} onChange={handleChange} placeholder="Count" className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 font-semibold text-gray-700 text-right">₹10 ×</span>
                  <input type="number" min="0" name="notes10" value={formData.notes10} onChange={handleChange} placeholder="Count" className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div className="flex items-center gap-3 md:col-span-2">
                  <span className="w-24 font-semibold text-gray-700 text-right">Coins Total ₹</span>
                  <input type="number" min="0" name="coinsTotal" value={formData.coinsTotal} onChange={handleChange} placeholder="Total Coin Amount" className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
              </div>
            </div>

            {/* Verification Result */}
            <div className={`p-5 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
              formData.cashInHandTotal 
                ? isMatching 
                  ? 'bg-green-50 border-green-500' 
                  : 'bg-red-50 border-red-500' 
                : 'bg-gray-50 border-gray-300'
            }`}>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Calculated Grand Total</p>
              <h2 className={`text-4xl font-bold ${
                formData.cashInHandTotal ? (isMatching ? 'text-green-700' : 'text-red-700') : 'text-gray-800'
              }`}>
                ₹{grandTotal.toLocaleString('en-IN')}
              </h2>
              {formData.cashInHandTotal && !isMatching && (
                <p className="mt-2 text-sm font-medium text-red-600">Mismatch: Short/Excess of ₹{Math.abs(grandTotal - Number(formData.cashInHandTotal)).toLocaleString('en-IN')}</p>
              )}
              {formData.cashInHandTotal && isMatching && (
                <p className="mt-2 text-sm font-medium text-green-600">Totals perfectly match!</p>
              )}
            </div>

            {/* Extra Fields Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Verification Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entered By</label>
                  <input type="text" name="enteredBy" value={formData.enteredBy} onChange={handleChange} placeholder="Staff Name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verified By</label>
                  <input type="text" name="verifiedBy" value={formData.verifiedBy} onChange={handleChange} placeholder="Manager Name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verified Time</label>
                  <input type="datetime-local" name="verifiedTime" value={formData.verifiedTime} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="2" placeholder="Note any discrepancies or auditing remarks..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green"></textarea>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg flex items-center justify-end gap-3">
          <button type="button" onClick={() => window.history.back()} className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all">
            Cancel
          </button>
          <button form="add-denomination-form" type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500/30 transition-all shadow-sm disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Denomination'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDenomination;
