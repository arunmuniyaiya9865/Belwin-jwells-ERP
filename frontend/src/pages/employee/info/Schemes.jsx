import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, X, ArrowLeft, Landmark, Car, ScrollText, Users, Search } from 'lucide-react';
import PersonalLoanManager from '../../../components/schemes/PersonalLoanManager';
import ChitFundManager from '../../../components/schemes/ChitFundManager';
import TwoWheelerLoanManager from '../../../components/schemes/TwoWheelerLoanManager';
import { getCustomerById } from '../../../services/customerService';
import { createGoldScheme, getGoldSchemes } from '../../../services/schemeService';

const schemeCategories = [
  { id: 'Bellwin Gold Loan', name: 'Bellwin Gold Loan', icon: Landmark, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { id: 'Bellwin Personal Loan', name: 'Bellwin Personal Loan', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'Bellwin Chit Fund', name: 'Bellwin Chit Fund', icon: ScrollText, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { id: 'Bellwin Two Wheeler Loan', name: 'Bellwin Two Wheeler Loan', icon: Car, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
];

const Schemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    schemeName: '',
    interestPercent: '',
    amountRs: '',
    gramRate: '',
    minimumGram: '',
    maturePeriodMonths: '',
    interestRepaymentMonths: '',
    documentCharges: '',
    type: 'Variable',
    penaltyPercent: '',
    status: 'Active'
  });

  const [customerInfo, setCustomerInfo] = useState('');

  const fetchSchemes = async () => {
    try {
      const data = await getGoldSchemes();
      setSchemes(data);
    } catch (error) {
      console.error('Error fetching schemes:', error);
    }
  };

  const handleCustomerBlur = async () => {
    if (!formData.customerId) return;
    try {
      setCustomerInfo('Loading...');
      const res = await getCustomerById(formData.customerId);
      if (res.success && res.data) {
        setCustomerInfo(`${res.data.customerName} - ${res.data.mobileNumber} (${res.data.branch || 'Head Office'})`);
      } else {
        setCustomerInfo('Customer Not Found');
      }
    } catch (e) {
      setCustomerInfo('Customer Not Found');
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setShowAddForm(true); // Auto open form as requested
    setFormData(prev => ({ ...prev, type: categoryName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isGold = selectedCategory === 'Bellwin Gold Loan';
      
      const payload = isGold ? {
        ...formData,
        amount: formData.amountRs ? Number(formData.amountRs) : null,
        maturePeriod: formData.maturePeriodMonths ? Number(formData.maturePeriodMonths) : null,
        interestRepaymentMonths: formData.interestRepaymentMonths ? Number(formData.interestRepaymentMonths) : null,
        interestPercent: formData.interestPercent ? Number(formData.interestPercent) : null,
        gramRate: formData.gramRate ? Number(formData.gramRate) : null,
        minimumGram: formData.minimumGram ? Number(formData.minimumGram) : null,
        documentCharges: formData.documentCharges ? Number(formData.documentCharges) : null,
        penaltyPercent: formData.penaltyPercent ? Number(formData.penaltyPercent) : null,
      } : formData;

      if (isGold) {
        await createGoldScheme(payload);
        toast.success(`${selectedCategory} added successfully!`);
        setFormData({
          customerId: '', schemeName: '', interestPercent: '', amountRs: '',
          gramRate: '', minimumGram: '', maturePeriodMonths: '',
          interestRepaymentMonths: '', documentCharges: '', type: selectedCategory,
          penaltyPercent: '', status: 'Active'
        });
        setCustomerInfo('');
        setShowAddForm(false);
        fetchSchemes();
      } else {
        toast.error('Only Gold Schemes are supported in this demo.');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) return;
    try {
      const isGold = selectedCategory === 'Bellwin Gold Loan';
      const endpoint = isGold ? '/gold-schemes/${id}' : '/schemes/${id}';
      const response = await fetch(endpoint, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Scheme deleted');
        fetchSchemes();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting scheme');
    }
  };

  const filteredSchemes = selectedCategory
    ? schemes.filter(s => s.type === selectedCategory)
    : schemes;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex flex-row items-center justify-between gap-4">
        <div className="text-left flex items-center gap-4">
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              {selectedCategory ? selectedCategory : 'Select Scheme Category'}
            </h2>
            <p className="text-sm text-gray-500">
              {selectedCategory ? `Manage schemes under ${selectedCategory}` : 'Choose a scheme category to view or add details.'}
            </p>
          </div>
        </div>

        {selectedCategory && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-erp-green text-white font-semibold rounded-lg hover:bg-green-700 transition-all w-auto justify-center shadow-sm"
          >
            {showAddForm ? <><X className="w-4 h-4" /> Close Form</> : <><Plus className="w-4 h-4" /> Add {selectedCategory}</>}
          </button>
        )}
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-2 gap-6 mt-4">
          {schemeCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => handleCategorySelect(cat.name)}
                className={`flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer border-2 transition-all transform hover:scale-[1.02] hover:shadow-md ${cat.bg} ${cat.border}`}
              >
                <Icon className={`w-16 h-16 mb-4 ${cat.color}`} />
                <h3 className={`text-2xl font-bold ${cat.color}`}>{cat.name}</h3>
                <p className="text-gray-500 mt-2 text-sm">Click to manage schemes and open form</p>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {selectedCategory === 'Bellwin Personal Loan' && <PersonalLoanManager showAddForm={showAddForm} setShowAddForm={setShowAddForm} />}
          {selectedCategory === 'Bellwin Chit Fund' && <ChitFundManager showAddForm={showAddForm} setShowAddForm={setShowAddForm} />}
          {selectedCategory === 'Bellwin Two Wheeler Loan' && <TwoWheelerLoanManager showAddForm={showAddForm} setShowAddForm={setShowAddForm} />}

          {selectedCategory === 'Bellwin Gold Loan' && (
            <>
              {showAddForm && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6 animate-fade-in">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">New {selectedCategory} Details</h3>
                  
                  <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-5">
                    {/* Row 1 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID *</label>
                      <input required type="text" name="customerId" value={formData.customerId} onBlur={handleCustomerBlur} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" placeholder="e.g. CUST0001" />
                      {customerInfo && <span className="text-[10px] text-green-600 font-bold block mt-1">{customerInfo}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scheme ID</label>
                      <input type="text" readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed" placeholder="Auto-generated" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Name *</label>
                      <input required type="text" name="schemeName" value={formData.schemeName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" placeholder="e.g. Express Gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interest % *</label>
                      <input required type="number" step="any" name="interestPercent" value={formData.interestPercent} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
                    </div>
                    
                    {/* Row 2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount Rs *</label>
                      <input required type="number" step="any" name="amountRs" value={formData.amountRs} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gram Rate *</label>
                      <input required type="number" step="any" name="gramRate" value={formData.gramRate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Gram *</label>
                      <input required type="number" step="any" name="minimumGram" value={formData.minimumGram} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mature Period (Months) *</label>
                      <input required type="number" name="maturePeriodMonths" value={formData.maturePeriodMonths} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
                    </div>
                    
                    {/* Row 3 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interest Repayment (Months)</label>
                      <input type="number" name="interestRepaymentMonths" value={formData.interestRepaymentMonths} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Document Charges *</label>
                      <input required type="number" step="any" name="documentCharges" value={formData.documentCharges} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Penalty % *</label>
                      <input required type="number" step="any" name="penaltyPercent" value={formData.penaltyPercent} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
                    </div>
                    <div></div> {/* Empty column filler for grid spacing */}
                    
                    {/* Row 4 */}
                    <div className="col-span-4 mt-2">
                      <button disabled={loading} type="submit" className="px-6 py-3 w-full bg-erp-green text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-sm">
                        {loading ? 'Saving...' : 'Submit / Save'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto h-full p-4">
                  <h3 className="font-bold text-gray-700 mb-4">Existing {selectedCategory}s</h3>
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-gray-50 border-y border-gray-200 text-gray-600">
                      <tr>
                        <th className="p-3 text-xs font-bold uppercase tracking-wider">Scheme ID</th>
                        <th className="p-3 text-xs font-bold uppercase tracking-wider">Customer ID</th>
                        <th className="p-3 text-xs font-bold uppercase tracking-wider">Scheme Name</th>
                        <th className="p-3 text-xs font-bold uppercase tracking-wider">Amount</th>
                        <th className="p-3 text-xs font-bold uppercase tracking-wider">Interest %</th>
                        <th className="p-3 text-xs font-bold uppercase tracking-wider">Status</th>
                        <th className="p-3 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredSchemes.map((s) => (
                        <tr key={s._id} className="bg-white hover:bg-gray-50 transition-colors text-gray-800">
                          <td className="p-3 text-sm font-semibold">{s.schemeId}</td>
                          <td className="p-3 text-sm font-medium text-erp-green">{s.customerId}</td>
                          <td className="p-3 text-sm font-medium">{s.schemeName}</td>
                          <td className="p-3 text-sm font-medium">₹{(s.amount != null ? Number(s.amount) : Number(s.amountRs) || 0).toFixed(2)}</td>
                          <td className="p-3 text-sm">{s.interestPercent}%</td>
                          <td className="p-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {s.status || 'Active'}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-right">
                            <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 rounded-md">Delete</button>
                          </td>
                        </tr>
                      ))}
                      {filteredSchemes.length === 0 && (
                        <tr>
                          <td colSpan="9" className="p-8 text-center text-gray-500">No {selectedCategory}s found. Use the form above to add one.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Schemes;