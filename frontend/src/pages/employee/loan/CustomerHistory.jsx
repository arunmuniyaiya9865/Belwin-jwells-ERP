import React, { useState } from 'react';
import { Search, User, ShieldAlert, Award, FileText, Landmark, Calendar, DollarSign, Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { useLoanSearch } from '../../../hooks/useLoanSearch';
import LoanSearchBox from '../../../components/shared/LoanSearchBox';
import LoanSelectionList from '../../../components/shared/LoanSelectionList';

const CustomerHistory = () => {
  const { searchLoans, loading: isSearchingLoans, results, clearSearch } = useLoanSearch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyData, setHistoryData] = useState(null);

  const handleSearch = async (searchValue) => {
    setHistoryData(null);
    setError('');
    const data = await searchLoans(searchValue);
    if (data && data.count === 1) {
      handleSelectLoan(data.results[0].loan);
    } else if (data && data.count === 0) {
      setError('No matching records found.');
    }
  };

  const handleSelectLoan = async (loanData) => {
    const loan = typeof loanData === 'string'
      ? results.find(r => r.loan.loanId === loanData)?.loan
      : loanData;
    
    if (!loan) return;
    
    // We have a loan, now we fetch customer history using the customerId of this loan
    fetchCustomerHistory(loan.customerId);
  };

  const fetchCustomerHistory = async (customerId) => {
    setLoading(true);
    setError('');
    setHistoryData(null);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const config = userInfo?.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};
      
      const response = await api.get('/customer-history/${customerId}', config);
      if (response.data.success) {
        setHistoryData(response.data.data);
      } else {
        setError(response.data.message || 'Customer not found');
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Customer not found');
      } else {
        setError('An error occurred while fetching data');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = historyData?.customer;
  const customerLoans = historyData?.loans || [];
  const payments = historyData?.payments || [];
  const repledges = historyData?.repledges || [];
  const topups = historyData?.topups || [];

  // Calculations
  const totalLoans = customerLoans.length;
  const activeLoans = customerLoans.filter(l => l.status === 'Approved' || l.status === 'Active' || l.status === 'Repledged').length;
  const closedLoans = customerLoans.filter(l => l.status === 'Closed').length;
  const repledgedLoans = customerLoans.filter(l => l.status === 'Repledged').length;
  const auctionedLoans = customerLoans.filter(l => l.status === 'Auctioned' || l.status === 'Auction Ready').length;

  // Gold History Calculations
  const pledgedWeight = customerLoans.reduce((sum, l) => sum + (parseFloat(l.totalWt || l.grossWeight) || 0), 0);
  const releasedWeight = customerLoans
    .filter(l => l.status === 'Closed')
    .reduce((sum, l) => sum + (parseFloat(l.totalWt || l.grossWeight) || 0), 0);
  const currentGoldWeight = pledgedWeight - releasedWeight;

  // Financial calculations
  const totalLoanAmount = customerLoans.reduce((sum, l) => sum + (parseFloat(l.loanAmount) || 0), 0);
  
  // Outstanding balance calculation
  const outstandingBalance = customerLoans
    .filter(l => l.status !== 'Closed')
    .reduce((sum, l) => sum + (parseFloat(l.remainingLoanAmount || l.loanAmount) || 0), 0);

  // Interest calculations (simplified or from payments)
  const totalInterestCollected = payments.reduce((sum, p) => sum + (parseFloat(p.interestAmount || p.amount) || 0), 0);

  // Overdue calculations (Comparing remainingDays or status)
  const overdueAmount = customerLoans
    .filter(l => l.status === 'Overdue')
    .reduce((sum, l) => sum + (parseFloat(l.remainingLoanAmount || l.loanAmount) || 0), 0);

  // Activity Dates
  const lastLoanDate = customerLoans.length > 0
    ? customerLoans.reduce((latest, l) => {
        const d = new Date(l.loanDate || l.createdAt);
        return d > new Date(latest) ? d : latest;
      }, new Date(customerLoans[0].loanDate || customerLoans[0].createdAt)).toLocaleDateString()
    : 'N/A';

  const lastPaymentDate = payments.length > 0
    ? payments.reduce((latest, p) => {
        const d = new Date(p.paidDate || p.createdAt);
        return d > new Date(latest) ? d : latest;
      }, new Date(payments[0].paidDate || payments[0].createdAt)).toLocaleDateString()
    : 'N/A';

  // Styles
  const cardStyle = "bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col transition-all hover:shadow-md";
  const headerStyle = "text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5";
  const valStyle = "text-2xl font-bold text-gray-800";

  return (
    <div className="flex flex-col min-h-screen pb-10 p-6">
      {/* Search Header */}
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-text-primary">Customer History Dashboard</h2>
        <p className="text-xs text-text-secondary mt-0.5">Search by Customer ID to load history.</p>
        
        <div className="mt-4 max-w-xl">
          {!historyData && (
            <div className="flex flex-col gap-4">
              <LoanSearchBox onSearch={handleSearch} loading={isSearchingLoans} />
              {results.length > 1 && (
                <LoanSelectionList results={results} onSelectLoan={handleSelectLoan} />
              )}
            </div>
          )}
          {historyData && (
            <button
              onClick={() => { setHistoryData(null); clearSearch(); }}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Change Customer
            </button>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
      </div>

      {!selectedCustomer && !loading && !error && (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-12 bg-white/50 text-gray-400 mt-10">
          <User className="w-16 h-16 mb-3 text-gray-300" />
          <p className="text-lg font-semibold">No Customer Selected</p>
          <p className="text-sm">Enter a Loan ID or Phone Number and search to view their history.</p>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-green-600 mt-10">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-lg font-semibold text-gray-600">Loading customer history...</p>
        </div>
      )}

      {selectedCustomer && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column: Basic Details & Activity ── */}
          <div className="col-span-1 flex flex-col gap-6">
            
            {/* Basic Details */}
            <div className={cardStyle}>
              <h3 className={`${headerStyle} text-green-700`}><User className="w-4 h-4" /> Basic Details</h3>
              <div className="space-y-3 mt-2 text-sm text-gray-600">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-medium text-gray-500">Customer ID</span>
                  <span className="font-bold text-gray-800">{selectedCustomer.customerId}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-medium text-gray-500">Customer Name</span>
                  <span className="font-semibold text-gray-800">{selectedCustomer.customerName}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-medium text-gray-500">Mobile Number</span>
                  <span className="font-semibold text-gray-800">{selectedCustomer.mobileNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-medium text-gray-500">Aadhaar Number</span>
                  <span className="font-semibold text-gray-800">{selectedCustomer.aadhaarNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Registration Date</span>
                  <span className="font-semibold text-gray-800">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Customer Activity */}
            <div className={cardStyle}>
              <h3 className={`${headerStyle} text-blue-700`}><Calendar className="w-4 h-4" /> Customer Activity</h3>
              <div className="space-y-3 mt-2 text-sm text-gray-600">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-medium text-gray-500">Approval Status</span>
                  <span className={`font-semibold ${selectedCustomer.status === 'Approved' ? 'text-green-600' : 'text-amber-600'}`}>
                    {selectedCustomer.status}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-medium text-gray-500">Last Loan Date</span>
                  <span className="font-semibold text-gray-800">{lastLoanDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Last Payment Date</span>
                  <span className="font-semibold text-gray-800">{lastPaymentDate}</span>
                </div>
              </div>
            </div>

            {/* Gold History */}
            <div className={cardStyle}>
              <h3 className={`${headerStyle} text-amber-600`}><Award className="w-4 h-4" /> Gold History</h3>
              <div className="space-y-3 mt-2 text-sm text-gray-600">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-medium text-gray-500">Pledged Gold Weight</span>
                  <span className="font-bold text-gray-800">{pledgedWeight.toFixed(2)} g</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-medium text-gray-500">Released Gold Weight</span>
                  <span className="font-bold text-green-600">{releasedWeight.toFixed(2)} g</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Current Gold Weight</span>
                  <span className="font-bold text-amber-600">{currentGoldWeight.toFixed(2)} g</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── Right Column: Loan Summary, Finance & History Tables ── */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">

            {/* Top Stat Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
                <div className="text-xs font-bold text-gray-400 uppercase">Loans Taken</div>
                <div className="text-xl font-extrabold text-gray-800 mt-1">{totalLoans}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
                <div className="text-xs font-bold text-green-500 uppercase">Active</div>
                <div className="text-xl font-extrabold text-green-600 mt-1">{activeLoans}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
                <div className="text-xs font-bold text-blue-500 uppercase">Closed</div>
                <div className="text-xl font-extrabold text-blue-600 mt-1">{closedLoans}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
                <div className="text-xs font-bold text-purple-500 uppercase">Repledged</div>
                <div className="text-xl font-extrabold text-purple-600 mt-1">{repledgedLoans}</div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className={`${cardStyle} bg-gradient-to-br from-green-50 to-emerald-50 border-green-100`}>
              <h3 className={`${headerStyle} text-emerald-800`}><Landmark className="w-4 h-4" /> Financial Summary</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                <div>
                  <span className="block text-xs font-bold text-emerald-700/70 uppercase">Total Loan Amount</span>
                  <span className="text-lg font-bold text-emerald-900">₹{totalLoanAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-emerald-700/70 uppercase">Interest Collected</span>
                  <span className="text-lg font-bold text-emerald-900">₹{totalInterestCollected.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-emerald-700/70 uppercase">Outstanding Balance</span>
                  <span className="text-lg font-bold text-amber-800">₹{outstandingBalance.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-red-700/70 uppercase">Overdue Amount</span>
                  <span className="text-lg font-bold text-red-600">₹{overdueAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payment History Table */}
            <div className={cardStyle}>
              <h3 className={`${headerStyle} text-gray-700`}><FileText className="w-4 h-4" /> Payment History</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-150">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Loan No</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Interest Paid</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt No</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-sm">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-gray-400">No payment history found</td>
                      </tr>
                    ) : (
                      payments.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-800">{p.loanId || p.loanNumber || 'N/A'}</td>
                          <td className="px-4 py-2 text-gray-500">{new Date(p.paidDate || p.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-right text-green-600 font-semibold">₹{(p.amount || 0).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2 text-right text-amber-600">₹{(p.interestAmount || 0).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2 text-gray-500 font-mono text-xs">{p.receiptNo || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Loan Details List */}
            <div className={cardStyle}>
              <h3 className={`${headerStyle} text-gray-700`}><Landmark className="w-4 h-4" /> Loan List Details</h3>
              <div className="mt-2 space-y-3">
                {customerLoans.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No loans associated with this customer.</p>
                ) : (
                  customerLoans.map((l, idx) => (
                    <div key={l._id || idx} className="border border-gray-150 rounded-lg p-3 flex justify-between items-center text-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-800">{l.loanId || l.loanNumber}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-500">Amount: </span>
                          <span className="font-semibold text-gray-800">₹{parseFloat(l.loanAmount || 0).toLocaleString('en-IN')}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-500">Gold: </span>
                          <span className="font-medium text-gray-700">{l.totalWt || l.grossWeight}g</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Start:</span> <span className="font-semibold text-gray-700">{new Date(l.loanStartDate || l.loanDate).toLocaleDateString()}</span>
                          <span className="mx-2 text-gray-300">|</span>
                          <span className="font-medium">End:</span> <span className="font-semibold text-gray-700">{l.loanEndDate ? new Date(l.loanEndDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          l.status === 'Approved' || l.status === 'Active' ? 'bg-green-100 text-green-800' :
                          l.status === 'Closed' ? 'bg-blue-100 text-blue-800' :
                          l.status === 'Repledged' ? 'bg-purple-100 text-purple-800' :
                          l.status === 'Auction' || l.status === 'Auction Ready' || l.status === 'Auctioned' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {l.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Repledges */}
            {repledges.length > 0 && (
              <div className={cardStyle}>
                <h3 className={`${headerStyle} text-purple-700`}><Award className="w-4 h-4" /> Repledge History</h3>
                <div className="mt-2 space-y-3">
                  {repledges.map((r, idx) => (
                    <div key={r._id || idx} className="border border-purple-100 bg-purple-50 rounded-lg p-3 flex justify-between items-center text-sm">
                      <div>
                        <span className="font-bold text-purple-800">{r.loanId}</span>
                        <span className="mx-2 text-purple-300">|</span>
                        <span className="text-purple-600">Repledge Amount: </span>
                        <span className="font-semibold text-purple-800">₹{parseFloat(r.repledgeAmount || 0).toLocaleString('en-IN')}</span>
                        <span className="mx-2 text-purple-300">|</span>
                        <span className="text-purple-600">Bank: </span>
                        <span className="font-medium text-purple-800">{r.bankName || 'N/A'}</span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-purple-200 text-purple-800 rounded-full text-xs font-bold">
                        {new Date(r.repledgeDate || r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TopUps */}
            {topups.length > 0 && (
              <div className={cardStyle}>
                <h3 className={`${headerStyle} text-orange-700`}><DollarSign className="w-4 h-4" /> TopUp History</h3>
                <div className="mt-2 space-y-3">
                  {topups.map((t, idx) => (
                    <div key={t._id || idx} className="border border-orange-100 bg-orange-50 rounded-lg p-3 flex justify-between items-center text-sm">
                      <div>
                        <span className="font-bold text-orange-800">{t.loanId}</span>
                        <span className="mx-2 text-orange-300">|</span>
                        <span className="text-orange-600">TopUp Amount: </span>
                        <span className="font-semibold text-orange-800">₹{parseFloat(t.topupAmount || 0).toLocaleString('en-IN')}</span>
                        <span className="mx-2 text-orange-300">|</span>
                        <span className="text-orange-600">Status: </span>
                        <span className="font-medium text-orange-800">{t.status || 'N/A'}</span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-orange-200 text-orange-800 rounded-full text-xs font-bold">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
};

export default CustomerHistory;
