<<<<<<< HEAD
import { useState } from 'react';
import { Save, RefreshCcw, XCircle, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { getCustomerById } from '../services/customerService';
import { createLoan } from '../services/loanService';

const ProvideLoan = () => {
  const [activeTab, setActiveTab] = useState('Receipt');
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Search state
  const [searchCustomerId, setSearchCustomerId] = useState('');
  const [dbCustomerId, setDbCustomerId] = useState('');
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobileNo: '',
    fatherHusbandName: '',
    address: '',
    loanDate: new Date().toISOString().slice(0, 10),
    loanAmount: '',
    remainingLoanAmount: '',
    status: 'Pending',
    totalNoOfDays: '',
    interestRate: '',
    additionalInterestRate: '',
    totalPaidInterestAmount: '',
    totalInterestPaidDays: '',
    remainingDays: '',
    remainingInterestAmount: '',
    documentCharge: '',
    fullSettlementAmount: '',
    enterDays: '',
    receiptDate: new Date().toISOString().slice(0, 10),
    receiptAmount: '',
    penalty: false
  });

  const [articles, setArticles] = useState([
    { category: '', details: '', qty: '', totWt: '', stoneWt: '', nettWt: '', purity: '', gramRate: '', total: '' },
    { category: '', details: '', qty: '', totWt: '', stoneWt: '', nettWt: '', purity: '', gramRate: '', total: '' }
  ]);
  const [totalWt, setTotalWt] = useState('');

  // Repledge State
  const [repledge, setRepledge] = useState({
    bankOrganisationName: 'IIFL',
    loanNo: '',
    date: new Date().toISOString().slice(0, 10),
    interestRate: '',
    repledgeAmount: '',
    documentCharge: '',
    matureDate: '',
    accountHolderName: 'DINESH KUMAR',
    anotherAglAccount: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRepledgeChange = (e) => {
    const { name, value } = e.target;
    setRepledge(prev => ({ ...prev, [name]: value }));
  };

  const handleArticleChange = (index, field, value) => {
    const newArticles = [...articles];
    const article = { ...newArticles[index], [field]: value };

    if (field === 'totWt' || field === 'stoneWt') {
      const tot = parseFloat(article.totWt) || 0;
      const stone = parseFloat(article.stoneWt) || 0;
      if (tot > 0) {
        article.nettWt = (tot - stone).toFixed(2);
      }
    }

    const nett = parseFloat(article.nettWt) || 0;
    const rate = parseFloat(article.gramRate) || 0;
    if (nett > 0 && rate > 0) {
      article.total = (nett * rate).toFixed(2);
    } else {
      article.total = '';
    }

    newArticles[index] = article;
    setArticles(newArticles);

    const sumTotal = newArticles.reduce((sum, art) => sum + (parseFloat(art.total) || 0), 0);
    const sumWt = newArticles.reduce((sum, art) => sum + (parseFloat(art.totWt) || 0), 0);
    
    setFormData(prev => ({ ...prev, loanAmount: sumTotal > 0 ? sumTotal.toFixed(2) : '' }));
    setTotalWt(sumWt > 0 ? sumWt.toFixed(2) : '');
  };

  const handleSearchCustomer = async () => {
    if (!searchCustomerId) {
      toast.error('Please enter a Customer ID to search.');
      return;
    }
    setIsCustomerLoading(true);
    try {
      // Backend getCustomerById supports querying by custom `customerId` or `_id` 
      // Need to adjust if the backend only supports `_id`. The route is usually flexible.
      const res = await getCustomerById(searchCustomerId);
      const customer = res?.data;

      if (!customer) {
        toast.error('Customer not found');
        return;
      }
      
      const isApproved = customer.approvalStatus === 'Approved' || customer.status === 'Approved';
      if (!isApproved) {
        toast.error(`Customer is not approved. Current status: ${customer.approvalStatus || customer.status}`);
        return;
      }

      setDbCustomerId(customer._id);
      setFormData(prev => ({
        ...prev,
        name: customer.customerName || '',
        mobileNo: customer.mobileNumber || '',
        fatherHusbandName: customer.guardianName || '',
        address: `${customer.doorStreet || ''} ${customer.city || ''}`.trim()
      }));
      toast.success('Customer found and details populated.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching customer. Check ID format.');
    } finally {
      setIsCustomerLoading(false);
    }
  };

  const handleSaveLoan = async () => {
    if (!dbCustomerId) {
      toast.error('Please search and select a valid Customer first.');
      return;
    }
    if (!formData.name || !formData.loanAmount) {
      toast.error('Name and Loan Amount are required.');
      return;
    }

    try {
      const payload = {
        customerId: dbCustomerId,
        name: formData.name,
        mobileNo: formData.mobileNo,
        fatherHusbandName: formData.fatherHusbandName,
        address: formData.address,
        loanDate: formData.loanDate,
        loanAmount: parseFloat(formData.loanAmount) || 0,
        remainingLoanAmount: parseFloat(formData.remainingLoanAmount) || 0,
        status: formData.status,
        totalNoOfDays: parseInt(formData.totalNoOfDays) || 0,
        interestRate: parseFloat(formData.interestRate) || 0,
        additionalInterestRate: parseFloat(formData.additionalInterestRate) || 0,
        totalPaidInterestAmount: parseFloat(formData.totalPaidInterestAmount) || 0,
        totalInterestPaidDays: parseInt(formData.totalInterestPaidDays) || 0,
        remainingDays: parseInt(formData.remainingDays) || 0,
        remainingInterestAmount: parseFloat(formData.remainingInterestAmount) || 0,
        documentCharge: parseFloat(formData.documentCharge) || 0,
        fullSettlementAmount: parseFloat(formData.fullSettlementAmount) || 0,
        receiptEntry: {
          enterDays: parseInt(formData.enterDays) || 0,
          receiptDate: formData.receiptDate,
          receiptAmount: parseFloat(formData.receiptAmount) || 0,
          penalty: formData.penalty
        },
        articles: articles.filter(a => a.category),
        totalWt: parseFloat(totalWt) || 0,
        repledgeDetails: activeTab === 'Repledge' ? {
          ...repledge,
          interestRate: parseFloat(repledge.interestRate) || 0,
          repledgeAmount: parseFloat(repledge.repledgeAmount) || 0,
          documentCharge: parseFloat(repledge.documentCharge) || 0
        } : undefined
      };

      const result = await createLoan(payload);
      toast.success(`Loan Created Successfully! ID: ${result._id}`);
      
      // Optionally reset form here
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving loan');
    }
  };

  const handleClear = () => {
    setSearchCustomerId('');
    setDbCustomerId('');
    setFormData({
      name: '', mobileNo: '', fatherHusbandName: '', address: '', loanDate: new Date().toISOString().slice(0, 10),
      loanAmount: '', remainingLoanAmount: '', status: 'Pending', totalNoOfDays: '', interestRate: '',
      additionalInterestRate: '', totalPaidInterestAmount: '', totalInterestPaidDays: '', remainingDays: '',
      remainingInterestAmount: '', documentCharge: '', fullSettlementAmount: '', enterDays: '',
      receiptDate: new Date().toISOString().slice(0, 10), receiptAmount: '', penalty: false
    });
    setArticles([
      { category: '', details: '', qty: '', totWt: '', stoneWt: '', nettWt: '', purity: '', gramRate: '', total: '' },
      { category: '', details: '', qty: '', totWt: '', stoneWt: '', nettWt: '', purity: '', gramRate: '', total: '' }
    ]);
    setTotalWt('');
  };


  const inp = "w-full px-3 py-1.5 bg-white border border-gray-400 rounded-md text-lg text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors";
  const lbl = "text-base text-black w-64 shrink-0 self-center whitespace-nowrap";
  const row = "flex items-center gap-4 mb-3";

  const thStyle = "px-4 py-2 text-base font-medium text-white bg-black border border-gray-600 tracking-wider text-center whitespace-nowrap";
  const tdStyle = "p-1 border border-gray-300";
  const tableInp = "w-full px-2 py-1 text-lg text-black bg-white border-none focus:outline-none focus:ring-1 focus:ring-black rounded text-center";
  const emptyPaymentRows = Array(2).fill(null);

  return (
    <div className="h-full w-full flex flex-col p-4 md:p-8">
      <Toaster position="top-right" />
      
      {/* Title & Tabs */}
      <div className="mb-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-black">Provide Loan</h2>
          <p className="text-sm text-text-secondary mt-1">Manage Receipts and Repledging.</p>
        </div>
        
        <div className="flex bg-erp-card p-1 rounded-xl border border-erp-green-dark shadow-sm shrink-0">
          <button 
            onClick={() => setActiveTab('Receipt')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'Receipt' ? 'bg-black text-white shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
          >
            New Receipt
          </button>
          <button 
            onClick={() => setActiveTab('Repledge')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'Repledge' ? 'bg-black text-white shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Repledge
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        
        {/* CUSTOMER SEARCH SECTION */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg max-w-2xl flex items-center gap-4">
          <label className="text-sm font-bold text-gray-700">Customer ID Search :</label>
          <div className="flex-1 flex gap-2">
            <input 
              type="text" 
              className={inp} 
              placeholder="Enter Customer ID (e.g. CUST000001)" 
              value={searchCustomerId}
              onChange={(e) => setSearchCustomerId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
            />
            <button 
              onClick={handleSearchCustomer}
              disabled={isCustomerLoading}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {isCustomerLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* RECEIPT TAB */}
        {activeTab === 'Receipt' && (
          <div className="w-full">
            
            {/* Header Info */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-2 mb-6 pb-6 border-b border-erp-green-dark">
              <div>
                <div className={row}><span className={lbl}>Name :</span><input type="text" name="name" className={inp} value={formData.name} onChange={handleChange} readOnly={!!dbCustomerId} /></div>
                <div className={row}><span className={lbl}>Mobile No :</span><input type="tel" name="mobileNo" className={inp} value={formData.mobileNo} onChange={handleChange} readOnly={!!dbCustomerId} /></div>
                <div className={row}><span className={lbl}>Father/Husband Name :</span><input type="text" name="fatherHusbandName" className={inp} value={formData.fatherHusbandName} onChange={handleChange} readOnly={!!dbCustomerId} /></div>
                <div className={row}><span className={lbl}>Address :</span><textarea name="address" className={`${inp} resize-none`} rows="2" value={formData.address} onChange={handleChange} readOnly={!!dbCustomerId} /></div>
              </div>
              <div>
                <div className={row}><span className={lbl}>Loan Date :</span><input type="date" name="loanDate" className={inp} value={formData.loanDate} onChange={handleChange} /></div>
                <div className={row}><span className={lbl}>Loan Amount :</span><input type="text" name="loanAmount" className={inp} value={formData.loanAmount} onChange={handleChange} /></div>
                <div className={row}><span className={lbl}>Remaining Loan Amount :</span><input type="text" name="remainingLoanAmount" className={inp} value={formData.remainingLoanAmount} onChange={handleChange} /></div>
                <div className={row}><span className={lbl}>Status :</span>
                  <select name="status" className={inp} value={formData.status} onChange={handleChange}>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calculations & Inputs */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-6 mb-6">
              <div>
                <div className={row}><span className={lbl}>Total No.of Days :</span><input type="text" name="totalNoOfDays" className={inp} value={formData.totalNoOfDays} onChange={handleChange} /></div>
                <div className="flex items-center gap-4 mb-3">
                  <span className={lbl}>Interest Rate % :</span>
                  <input type="text" name="interestRate" className={inp} value={formData.interestRate} onChange={handleChange} />
                  <div className="ml-2 flex items-center gap-2 shrink-0">
                    <span className="text-base font-bold text-black">Add. % :</span>
                    <input type="text" name="additionalInterestRate" className="w-16 px-2 py-1 bg-white border border-gray-400 rounded-md text-lg font-bold text-black focus:outline-none focus:border-black" value={formData.additionalInterestRate} onChange={handleChange} />
                  </div>
                </div>
                <div className={row}><span className={lbl}>Total Paid Interest Amount :</span><input type="text" name="totalPaidInterestAmount" className={inp} value={formData.totalPaidInterestAmount} onChange={handleChange} /></div>
                <div className={row}><span className={lbl}>Total Interest Paid Days :</span><input type="text" name="totalInterestPaidDays" className={inp} value={formData.totalInterestPaidDays} onChange={handleChange} /></div>
                <div className={row}><span className={lbl}>Remaining Days :</span><input type="text" name="remainingDays" className={inp} value={formData.remainingDays} onChange={handleChange} /></div>
                <div className={`${row} mt-6`}><span className={lbl}>Remaining Interest Amount :</span><input type="text" name="remainingInterestAmount" className={inp} value={formData.remainingInterestAmount} onChange={handleChange} /></div>
                <div className={`${row} mt-6`}><span className={lbl}>Document Charge :</span><input type="text" name="documentCharge" className={inp} value={formData.documentCharge} onChange={handleChange} /></div>
                <div className={row}><span className={lbl}>Full Settlement Amount Rs :</span><input type="text" name="fullSettlementAmount" className={inp} value={formData.fullSettlementAmount} onChange={handleChange} /></div>
              </div>
              
              <div className="bg-white/50 p-6 border border-erp-green-dark rounded-xl max-w-sm self-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold w-32 shrink-0">Enter Days :</label>
                    <input type="text" name="enterDays" className={inp} value={formData.enterDays} onChange={handleChange} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold w-32 shrink-0">Receipt Date :</label>
                    <input type="date" name="receiptDate" className={inp} value={formData.receiptDate} onChange={handleChange} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold w-32 shrink-0">Receipt Amount :</label>
                    <input type="text" name="receiptAmount" className={inp} value={formData.receiptAmount} onChange={handleChange} />
                  </div>
                  <div className="flex items-center gap-3 ml-32 pl-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="penalty" className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded" checked={formData.penalty} onChange={handleChange} />
                      <span className="text-sm font-semibold">Penalty</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 mb-8">
              <button onClick={handleSaveLoan} className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white text-sm font-bold rounded shadow-md hover:from-red-800 hover:to-red-950 transition-all">Save</button>
              <button onClick={handleClear} className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white text-sm font-bold rounded shadow-md hover:from-red-800 hover:to-red-950 transition-all">Cancel</button>
              <button onClick={handleSaveLoan} className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white text-sm font-bold rounded shadow-md hover:from-red-800 hover:to-red-950 transition-all">Save & Close</button>
              <button onClick={handleSaveLoan} className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white text-sm font-bold rounded shadow-md hover:from-red-800 hover:to-red-950 transition-all">Close & Repledge</button>
            </div>

            {/* Article Details */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <h3 className="font-bold text-black">Article Details :</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-black">Total Wt:</span>
                  <input type="text" className="w-24 px-2 py-1 bg-white border border-gray-300 rounded text-sm text-center font-bold text-black focus:outline-none focus:border-black" placeholder="gms" value={totalWt} readOnly />
                </div>
              </div>
              <div className="overflow-x-auto rounded-md border border-gray-300">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className={thStyle}>Category</th>
                      <th className={thStyle}>Jewel Details</th>
                      <th className={thStyle}>Quantity</th>
                      <th className={thStyle}>Tot.Weight</th>
                      <th className={thStyle}>Stone Wt</th>
                      <th className={thStyle}>Nett.Wt</th>
                      <th className={thStyle}>Purity</th>
                      <th className={thStyle}>Gram Rate</th>
                      <th className={thStyle}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article, i) => (
                      <tr key={i} className="hover:bg-gray-50 bg-white">
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.category} onChange={(e) => handleArticleChange(i, 'category', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.details} onChange={(e) => handleArticleChange(i, 'details', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.qty} onChange={(e) => handleArticleChange(i, 'qty', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.totWt} onChange={(e) => handleArticleChange(i, 'totWt', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.stoneWt} onChange={(e) => handleArticleChange(i, 'stoneWt', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.nettWt} onChange={(e) => handleArticleChange(i, 'nettWt', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.purity} onChange={(e) => handleArticleChange(i, 'purity', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.gramRate} onChange={(e) => handleArticleChange(i, 'gramRate', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.total} readOnly placeholder="Auto" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <h3 className="font-bold text-black mb-2">Payment Details :</h3>
              <div className="overflow-x-auto rounded-md border border-gray-300">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className={thStyle}>Receipt No</th>
                      <th className={thStyle}>Paid Date</th>
                      <th className={thStyle}>Amount</th>
                      <th className={thStyle}>Interest Amount</th>
                      <th className={thStyle}>Principal Amount</th>
                      <th className={thStyle}>penalty</th>
                      <th className={thStyle}>penalty pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emptyPaymentRows.map((_, i) => (
                      <tr key={i} className="hover:bg-gray-50 bg-white">
                        <td className={tdStyle}><input type="text" className={tableInp} /></td>
                        <td className={tdStyle}><input type="date" className={tableInp} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* REPLEDGE TAB */}
        {activeTab === 'Repledge' && (
          <div className="w-full">
            
            {/* Header Info */}
            <div className="mb-6 pb-6 border-b border-erp-green-dark max-w-xl">
              <div className={row}><span className={lbl}>Name :</span><input type="text" name="name" className={inp} value={formData.name} onChange={handleChange} readOnly={!!dbCustomerId} /></div>
              <div className={row}><span className={lbl}>Address :</span><textarea name="address" className={`${inp} resize-none`} rows="2" value={formData.address} onChange={handleChange} readOnly={!!dbCustomerId} /></div>
            </div>

            {/* Article Details */}
            <div className="mb-8">
              <h3 className="font-bold text-black mb-2">Article Details :</h3>
              <div className="overflow-x-auto rounded-md border border-gray-300">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className={thStyle}>Category</th>
                      <th className={thStyle}>Jewel Details</th>
                      <th className={thStyle}>Quantity</th>
                      <th className={thStyle}>Tot.Weight</th>
                      <th className={thStyle}>Stone Wt</th>
                      <th className={thStyle}>Nett.Wt</th>
                      <th className={thStyle}>Purity</th>
                      <th className={thStyle}>Gram Rate</th>
                      <th className={thStyle}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article, i) => (
                      <tr key={i} className="hover:bg-gray-50 bg-white">
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.category} onChange={(e) => handleArticleChange(i, 'category', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.details} onChange={(e) => handleArticleChange(i, 'details', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.qty} onChange={(e) => handleArticleChange(i, 'qty', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.totWt} onChange={(e) => handleArticleChange(i, 'totWt', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.stoneWt} onChange={(e) => handleArticleChange(i, 'stoneWt', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.nettWt} onChange={(e) => handleArticleChange(i, 'nettWt', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.purity} onChange={(e) => handleArticleChange(i, 'purity', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.gramRate} onChange={(e) => handleArticleChange(i, 'gramRate', e.target.value)} /></td>
                        <td className={tdStyle}><input type="text" className={tableInp} value={article.total} readOnly placeholder="Auto" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Links */}
            <div className="flex items-center gap-12 mb-8 border-b border-erp-green-dark pb-4">
              <button className="text-blue-600 hover:text-blue-800 font-bold underline decoration-blue-600/30 underline-offset-4">Repledge</button>
              <button 
                onClick={() => setIsRepayModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-bold underline decoration-blue-600/30 underline-offset-4"
              >
                Repay Repledge Loan
              </button>
              <button 
                onClick={() => setIsStatusModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-bold underline decoration-blue-600/30 underline-offset-4"
              >
                Change Status
              </button>
            </div>

            {/* Repledging Details Form */}
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1 max-w-xl">
                <h3 className="font-bold text-black mb-4">Repledging Details :</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Bank/ Organisation Name : <span className="text-red-500">*</span></label>
                    <div className="flex-1 flex gap-2">
                      <select name="bankOrganisationName" className={inp} value={repledge.bankOrganisationName} onChange={handleRepledgeChange}>
                        <option value="IIFL">IIFL</option>
                        <option value="Muthoot">Muthoot</option>
                      </select>
                      <button className="text-blue-600 font-bold text-sm underline hover:text-blue-800 shrink-0 self-center">Edit</button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Loan No :</label>
                    <input type="text" name="loanNo" className={inp} value={repledge.loanNo} onChange={handleRepledgeChange} />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Date : <span className="text-red-500">*</span></label>
                    <input type="date" name="date" className={inp} value={repledge.date} onChange={handleRepledgeChange} />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Interest % : <span className="text-red-500">*</span></label>
                    <input type="text" name="interestRate" className={inp} value={repledge.interestRate} onChange={handleRepledgeChange} />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Repledge Amount : <span className="text-red-500">*</span></label>
                    <input type="text" name="repledgeAmount" className={inp} value={repledge.repledgeAmount} onChange={handleRepledgeChange} />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Doc. Charge Rs :</label>
                    <input type="text" name="documentCharge" className={inp} value={repledge.documentCharge} onChange={handleRepledgeChange} />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Mature Date :</label>
                    <input type="date" name="matureDate" className={inp} value={repledge.matureDate} onChange={handleRepledgeChange} />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Account Holder Name :</label>
                    <select name="accountHolderName" className={inp} value={repledge.accountHolderName} onChange={handleRepledgeChange}>
                      <option value="DINESH KUMAR">DINESH KUMAR</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Another AGL Account :</label>
                    <input type="text" name="anotherAglAccount" className={inp} value={repledge.anotherAglAccount} onChange={handleRepledgeChange} />
                  </div>
                  
                  <div className="flex items-start gap-4 pt-2">
                    <label className="text-sm font-semibold w-48 shrink-0 mt-2">Upload Image</label>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input type="file" className="text-sm border border-gray-300 rounded p-1 w-full bg-white file:mr-4 file:py-1 file:px-3 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200" />
                        <button className="text-blue-600 font-bold text-sm underline hover:text-blue-800 shrink-0">View Image</button>
                      </div>
                      <div className="flex items-center gap-4 text-sm mt-1">
                        <button className="text-blue-600 font-semibold hover:text-blue-800 underline">Capture Web Cam</button>
                        <button className="text-blue-600 font-semibold hover:text-blue-800 underline">Verify Image</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save & Clear Buttons */}
                <div className="flex items-center justify-center gap-6 mt-12 mb-8">
                  <button onClick={handleSaveLoan} className="px-8 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white text-sm font-bold rounded-full shadow-md hover:from-red-700 hover:to-red-900 transition-all flex items-center gap-2">
                    <Save className="w-4 h-4" /> SAVE
                  </button>
                  <button onClick={handleClear} className="px-8 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white text-sm font-bold rounded-full shadow-md hover:from-red-700 hover:to-red-900 transition-all flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" /> CLEAR
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        )}

      </div>

      {/* Repay Repledge Loan Modal */}
      {isRepayModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* Unchanged modal contents ... */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Repay Repledge Loan</h3>
              <button onClick={() => setIsRepayModalOpen(false)} className="text-gray-500 hover:text-red-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">Modal functionality not yet implemented...</div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* Unchanged modal contents ... */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Change Status</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-500 hover:text-red-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">Modal functionality not yet implemented...</div>
          </div>
        </div>
      )}
=======
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
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6
    </div>
  );
};

export default ProvideLoan;
