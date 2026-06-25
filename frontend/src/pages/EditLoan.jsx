import { useState } from 'react';
import { Save, RefreshCcw, XCircle, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { getLoanById, getLoansByCustomer, updateLoan } from '../services/loanService';

const EditLoan = () => {
  const [activeTab, setActiveTab] = useState('Receipt');
  const [hasSearched, setHasSearched] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Search state
  const [searchLoanId, setSearchLoanId] = useState('');
  const [dbLoanId, setDbLoanId] = useState(''); // Stores the loanId string now, not ObjectId
  const [isSearching, setIsSearching] = useState(false);
  const [matchingLoans, setMatchingLoans] = useState([]);
  const [isLoanSelectionOpen, setIsLoanSelectionOpen] = useState(false);

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

  const formatDateString = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  const populateLoan = (loan) => {
    setDbLoanId(loan.loanId);
    
    // Populate Form Data
    setFormData({
      name: loan.name || '',
      mobileNo: loan.mobileNo || '',
      fatherHusbandName: loan.fatherHusbandName || '',
      address: loan.address || '',
      loanDate: formatDateString(loan.loanDate),
      loanAmount: loan.loanAmount || '',
      remainingLoanAmount: loan.remainingLoanAmount || '',
      status: loan.status || 'Pending',
      totalNoOfDays: loan.totalNoOfDays || '',
      interestRate: loan.interestRate || '',
      additionalInterestRate: loan.additionalInterestRate || '',
      totalPaidInterestAmount: loan.totalPaidInterestAmount || '',
      totalInterestPaidDays: loan.totalInterestPaidDays || '',
      remainingDays: loan.remainingDays || '',
      remainingInterestAmount: loan.remainingInterestAmount || '',
      documentCharge: loan.documentCharge || '',
      fullSettlementAmount: loan.fullSettlementAmount || '',
      enterDays: loan.receiptEntry?.enterDays || '',
      receiptDate: formatDateString(loan.receiptEntry?.receiptDate),
      receiptAmount: loan.receiptEntry?.receiptAmount || '',
      penalty: loan.receiptEntry?.penalty || false
    });

    // Populate Articles
    if (loan.articles && loan.articles.length > 0) {
      const mappedArticles = loan.articles.map(art => ({
        category: art.category || '',
        details: art.details || '',
        qty: art.qty || '',
        totWt: art.totWt || '',
        stoneWt: art.stoneWt || '',
        nettWt: art.nettWt || '',
        purity: art.purity || '',
        gramRate: art.gramRate || '',
        total: art.total || ''
      }));
      while (mappedArticles.length < 2) {
        mappedArticles.push({ category: '', details: '', qty: '', totWt: '', stoneWt: '', nettWt: '', purity: '', gramRate: '', total: '' });
      }
      setArticles(mappedArticles);
    } else {
      setArticles([
        { category: '', details: '', qty: '', totWt: '', stoneWt: '', nettWt: '', purity: '', gramRate: '', total: '' },
        { category: '', details: '', qty: '', totWt: '', stoneWt: '', nettWt: '', purity: '', gramRate: '', total: '' }
      ]);
    }
    setTotalWt(loan.totalWt || '');

    // Populate Repledge
    if (loan.repledgeDetails) {
      setRepledge({
        bankOrganisationName: loan.repledgeDetails.bankOrganisationName || 'IIFL',
        loanNo: loan.repledgeDetails.loanNo || '',
        date: formatDateString(loan.repledgeDetails.date),
        interestRate: loan.repledgeDetails.interestRate || '',
        repledgeAmount: loan.repledgeDetails.repledgeAmount || '',
        documentCharge: loan.repledgeDetails.documentCharge || '',
        matureDate: formatDateString(loan.repledgeDetails.matureDate),
        accountHolderName: loan.repledgeDetails.accountHolderName || 'DINESH KUMAR',
        anotherAglAccount: loan.repledgeDetails.anotherAglAccount || ''
      });
    }

    setHasSearched(true);
    toast.success('Loan data loaded successfully.');
  };

  const handleSearchLoan = async () => {
    if (!searchLoanId.trim()) {
      toast.error('Please enter a Customer ID or Loan ID to search.');
      return;
    }
    setIsSearching(true);
    try {
      const query = searchLoanId.trim().toUpperCase();
      
      if (query.startsWith('CUST')) {
        const loans = await getLoansByCustomer(query);
        if (!loans || loans.length === 0) {
          toast.error('No loans found for this customer.');
          return;
        }
        if (loans.length === 1) {
          populateLoan(loans[0]);
        } else {
          setMatchingLoans(loans);
          setIsLoanSelectionOpen(true);
        }
      } else {
        const loan = await getLoanById(query);
        if (!loan) {
          toast.error('Loan not found');
          return;
        }
        populateLoan(loan);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching loan. Check ID format.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateLoan = async () => {
    if (!dbLoanId) {
      toast.error('No loan loaded to update.');
      return;
    }
    if (!formData.name || !formData.loanAmount) {
      toast.error('Name and Loan Amount are required.');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        mobileNo: formData.mobileNo,
        fatherHusbandName: formData.fatherHusbandName,
        address: formData.address,
        loanDate: formData.loanDate,
        loanAmount: parseFloat(formData.loanAmount) || 0,
        remainingLoanAmount: parseFloat(formData.remainingLoanAmount) || 0,
        status: formData.status,
        
        totalNoOfDays: parseFloat(formData.totalNoOfDays) || 0,
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

        articles: articles.map(art => ({
          ...art,
          qty: parseInt(art.qty) || 0,
          totWt: parseFloat(art.totWt) || 0,
          stoneWt: parseFloat(art.stoneWt) || 0,
          nettWt: parseFloat(art.nettWt) || 0,
          gramRate: parseFloat(art.gramRate) || 0,
          total: parseFloat(art.total) || 0
        })),
        totalWt: parseFloat(totalWt) || 0,

        repledgeDetails: {
          ...repledge,
          interestRate: parseFloat(repledge.interestRate) || 0,
          repledgeAmount: parseFloat(repledge.repledgeAmount) || 0,
          documentCharge: parseFloat(repledge.documentCharge) || 0
        }
      };

      await updateLoan(dbLoanId, payload);
      toast.success('Loan updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update loan');
    }
  };

  const inp = "w-full px-3 py-1.5 bg-white border border-gray-400 rounded-md text-lg text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors";
  const lbl = "text-base text-black w-64 shrink-0 self-center whitespace-nowrap";
  const row = "flex items-center gap-4 mb-3";

  // Table header styles
  const thStyle = "px-4 py-2 text-base font-medium text-white bg-black border border-gray-600 tracking-wider text-center whitespace-nowrap";
  const tdStyle = "p-1 border border-gray-300";
  const tableInp = "w-full px-2 py-1 text-lg text-black bg-white border-none focus:outline-none focus:ring-1 focus:ring-black rounded text-center";
  
  const emptyPaymentRows = Array(2).fill(null);

  return (
    <div className="h-full w-full flex flex-col p-4 md:p-8">
      <Toaster position="top-right" />
      {/* Title & Tabs */}
      <div className="mb-4 shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-black">Edit Loan</h2>
          <p className="text-sm text-text-secondary mt-1">Manage Receipts and Repledging.</p>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-0 lg:mx-4">
          <div className="flex items-center bg-white border border-gray-400 rounded-lg overflow-hidden shadow-sm">
            <input 
              type="text" 
              placeholder="Search Loan ID..." 
              value={searchLoanId}
              onChange={(e) => setSearchLoanId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchLoan()}
              className="w-full px-4 py-2 text-base text-black focus:outline-none"
            />
            <button 
              onClick={handleSearchLoan}
              disabled={isSearching}
              className="px-6 py-2 bg-black text-white text-base hover:bg-gray-800 transition-colors disabled:bg-gray-500"
            >
              {isSearching ? '...' : 'Search'}
            </button>
          </div>
        </div>
        
        {hasSearched && (
          <div className="flex bg-erp-card p-1 rounded-xl border border-gray-300 shadow-sm shrink-0">
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
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasSearched ? (
          <div className="h-full w-full flex items-center justify-center pb-32">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <h3 className="text-xl font-bold text-gray-600">Search for a Loan</h3>
              <p className="mt-2 text-sm font-semibold text-gray-400">Enter a MongoDB Loan ID above to view and edit details.</p>
            </div>
          </div>
        ) : (
          <>
            {/* RECEIPT TAB */}
        {activeTab === 'Receipt' && (
          <div className="w-full">
            
            {/* Header Info */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-2 mb-6 pb-6 border-b border-erp-green-dark">
              <div>
                <div className={row}><span className={lbl}>Name :</span><input type="text" name="name" value={formData.name} onChange={handleChange} className={inp} /></div>
                <div className={row}><span className={lbl}>Mobile No :</span><input type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleChange} className={inp} /></div>
                <div className={row}><span className={lbl}>Father/Husband Name :</span><input type="text" name="fatherHusbandName" value={formData.fatherHusbandName} onChange={handleChange} className={inp} /></div>
                <div className={row}><span className={lbl}>Address :</span><textarea name="address" value={formData.address} onChange={handleChange} className={`${inp} resize-none`} rows="2" /></div>
              </div>
              <div>
                <div className={row}><span className={lbl}>Loan Date :</span><input type="date" name="loanDate" value={formData.loanDate} onChange={handleChange} className={inp} /></div>
                <div className={row}><span className={lbl}>Loan Amount :</span><input type="text" name="loanAmount" value={formData.loanAmount} onChange={handleChange} className={inp} /></div>
                <div className={row}><span className={lbl}>Remaining Loan Amount :</span><input type="text" name="remainingLoanAmount" value={formData.remainingLoanAmount} onChange={handleChange} className={inp} /></div>
                <div className={row}><span className={lbl}>Status :</span>
                  <select name="status" value={formData.status} onChange={handleChange} className={inp}>
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
                <div className={row}><span className={lbl}>Total No.of Days :</span><input type="text" name="totalNoOfDays" value={formData.totalNoOfDays} onChange={handleChange} className={inp} /></div>
                <div className="flex items-center gap-4 mb-3">
                  <span className={lbl}>Interest Rate % :</span>
                  <input type="text" name="interestRate" value={formData.interestRate} onChange={handleChange} className={inp} />
                  <div className="ml-2 flex items-center gap-2 shrink-0">
                    <span className="text-base font-bold text-black">Add. % :</span>
                    <input type="text" name="additionalInterestRate" value={formData.additionalInterestRate} onChange={handleChange} className="w-16 px-2 py-1 bg-white border border-gray-400 rounded-md text-lg font-bold text-black focus:outline-none focus:border-black" />
                  </div>
                </div>
                <div className={row}><span className={lbl}>Total Paid Interest Amount :</span><input type="text" name="totalPaidInterestAmount" value={formData.totalPaidInterestAmount} onChange={handleChange} className={inp} /></div>
                <div className={row}><span className={lbl}>Total Interest Paid Days :</span><input type="text" name="totalInterestPaidDays" value={formData.totalInterestPaidDays} onChange={handleChange} className={inp} /></div>
                <div className={row}><span className={lbl}>Remaining Days :</span><input type="text" name="remainingDays" value={formData.remainingDays} onChange={handleChange} className={inp} /></div>
                <div className={`${row} mt-6`}><span className={lbl}>Remaining Interest Amount :</span><input type="text" name="remainingInterestAmount" value={formData.remainingInterestAmount} onChange={handleChange} className={inp} /></div>
                <div className={`${row} mt-6`}><span className={lbl}>Document Charge :</span><input type="text" name="documentCharge" value={formData.documentCharge} onChange={handleChange} className={inp} /></div>
                <div className={row}><span className={lbl}>Full Settlement Amount Rs :</span><input type="text" name="fullSettlementAmount" value={formData.fullSettlementAmount} onChange={handleChange} className={inp} /></div>
              </div>
              
              <div className="bg-white/50 p-6 border border-erp-green-dark rounded-xl max-w-sm self-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold w-32 shrink-0">Enter Days :</label>
                    <input type="text" name="enterDays" value={formData.enterDays} onChange={handleChange} className={inp} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold w-32 shrink-0">Receipt Date :</label>
                    <input type="date" name="receiptDate" value={formData.receiptDate} onChange={handleChange} className={inp} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold w-32 shrink-0">Receipt Amount :</label>
                    <input type="text" name="receiptAmount" value={formData.receiptAmount} onChange={handleChange} className={inp} />
                  </div>
                  <div className="flex items-center gap-3 ml-32 pl-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="penalty" checked={formData.penalty} onChange={handleChange} className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded" />
                      <span className="text-sm font-semibold">Penalty</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 mb-8">
              <button onClick={handleUpdateLoan} className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white text-sm font-bold rounded shadow-md hover:from-red-800 hover:to-red-950 transition-all">Update Loan</button>
              <button onClick={() => setHasSearched(false)} className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white text-sm font-bold rounded shadow-md hover:from-red-800 hover:to-red-950 transition-all">Cancel</button>
              <button onClick={handleUpdateLoan} className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white text-sm font-bold rounded shadow-md hover:from-red-800 hover:to-red-950 transition-all">Save & Close</button>
              <button onClick={handleUpdateLoan} className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white text-sm font-bold rounded shadow-md hover:from-red-800 hover:to-red-950 transition-all">Close & Repledge</button>
            </div>

            {/* Article Details */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <h3 className="font-bold text-black">Article Details :</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-black">Total Wt:</span>
                  <input type="text" className="w-24 px-2 py-1 bg-white border border-gray-300 rounded text-sm text-center font-bold text-black focus:outline-none focus:border-black" placeholder="gms" value={totalWt} onChange={(e) => setTotalWt(e.target.value)} />
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
              <div className={row}><span className={lbl}>Name :</span><input type="text" name="name" value={formData.name} onChange={handleChange} className={inp} /></div>
              <div className={row}><span className={lbl}>Address :</span><textarea name="address" value={formData.address} onChange={handleChange} className={`${inp} resize-none`} rows="2" /></div>
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
                      <select name="bankOrganisationName" value={repledge.bankOrganisationName} onChange={handleRepledgeChange} className={inp}>
                        <option value="IIFL">IIFL</option>
                        <option value="Muthoot">Muthoot</option>
                      </select>
                      <button className="text-blue-600 font-bold text-sm underline hover:text-blue-800 shrink-0 self-center">Edit</button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Loan No :</label>
                    <input type="text" name="loanNo" value={repledge.loanNo} onChange={handleRepledgeChange} className={inp} />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Date : <span className="text-red-500">*</span></label>
                    <input type="date" name="date" value={repledge.date} onChange={handleRepledgeChange} className={inp} />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Interest % : <span className="text-red-500">*</span></label>
                    <input type="text" name="interestRate" value={repledge.interestRate} onChange={handleRepledgeChange} className={inp} />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Repledge Amount : <span className="text-red-500">*</span></label>
                    <input type="text" name="repledgeAmount" value={repledge.repledgeAmount} onChange={handleRepledgeChange} className={inp} />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Doc. Charge Rs :</label>
                    <input type="text" name="documentCharge" value={repledge.documentCharge} onChange={handleRepledgeChange} className={inp} />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Mature Date :</label>
                    <input type="date" name="matureDate" value={repledge.matureDate} onChange={handleRepledgeChange} className={inp} />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Account Holder Name :</label>
                    <select name="accountHolderName" value={repledge.accountHolderName} onChange={handleRepledgeChange} className={inp}>
                      <option value="DINESH KUMAR">DINESH KUMAR</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold w-48 shrink-0">Another AGL Account :</label>
                    <input type="text" name="anotherAglAccount" value={repledge.anotherAglAccount} onChange={handleRepledgeChange} className={inp} />
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
                  <button onClick={handleUpdateLoan} className="px-8 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white text-sm font-bold rounded-full shadow-md hover:from-red-700 hover:to-red-900 transition-all flex items-center gap-2">
                    <Save className="w-4 h-4" /> UPDATE
                  </button>
                  <button onClick={() => setHasSearched(false)} className="px-8 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white text-sm font-bold rounded-full shadow-md hover:from-red-700 hover:to-red-900 transition-all flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" /> CLEAR
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        )}
        </>
      )}
      </div>

      {/* Repay Repledge Loan Modal */}
      {isRepayModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Repay Repledge Loan</h3>
              <button onClick={() => setIsRepayModalOpen(false)} className="text-gray-500 hover:text-red-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Repledge No</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Paid Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Amount</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Interest Split</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Principal Split</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Penalty</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Balance Pending</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold text-gray-800 mb-2">Payment History</h4>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 border-b">Date</th>
                        <th className="p-2 border-b">Amount</th>
                        <th className="p-2 border-b">Principal</th>
                        <th className="p-2 border-b">Interest</th>
                        <th className="p-2 border-b">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border-b text-center text-gray-500" colSpan="5">
                          <input type="text" className="w-full px-2 py-1 text-center bg-white border-none focus:outline-none" placeholder="No history available" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button className="px-6 py-2 bg-gray-200 text-gray-800 text-sm font-bold rounded shadow-sm hover:bg-gray-300 transition-all" onClick={() => setIsRepayModalOpen(false)}>Cancel</button>
                <button className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white text-sm font-bold rounded shadow-md hover:from-red-800 hover:to-red-950 transition-all">Submit Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Change Status</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-500 hover:text-red-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Current Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">New Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                    <option value="Closed">Closed</option>
                    <option value="Released">Released</option>
                    <option value="Auctioned">Auctioned</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Change Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Reason</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Remarks</label>
                  <textarea rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black resize-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Closing / Release Info</label>
                  <textarea rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black resize-none" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button className="px-6 py-2 bg-gray-200 text-gray-800 text-sm font-bold rounded shadow-sm hover:bg-gray-300 transition-all" onClick={() => setIsStatusModalOpen(false)}>Cancel</button>
                <button className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white text-sm font-bold rounded shadow-md hover:from-red-800 hover:to-red-950 transition-all">Save Status</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Loan Selection Modal */}
      {isLoanSelectionOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Select Loan to Edit</h3>
              <button onClick={() => setIsLoanSelectionOpen(false)} className="text-gray-500 hover:text-red-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">
                Multiple loans found for this customer. Please select the loan you wish to edit:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingLoans.map((loan) => (
                  <div 
                    key={loan.loanId || loan._id} 
                    className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-black hover:shadow-md transition-all flex flex-col gap-2"
                    onClick={() => {
                      populateLoan(loan);
                      setIsLoanSelectionOpen(false);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-black">{loan.loanId || 'N/A'}</span>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        loan.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        loan.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Date:</strong> {new Date(loan.loanDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Amount:</strong> ₹{loan.loanAmount}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Remaining:</strong> ₹{loan.remainingLoanAmount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditLoan;
