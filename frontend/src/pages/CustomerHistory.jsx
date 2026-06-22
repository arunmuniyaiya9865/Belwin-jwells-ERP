import React, { useState, useEffect } from 'react';
import { Search, User, ShieldAlert, Award, FileText, Landmark, Calendar, DollarSign } from 'lucide-react';
import { getAllCustomers } from '../utils/customerStore';
import { getAllLoans } from '../utils/loanStore';

const CustomerHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  // Fetch all customers and loans on mount
  useEffect(() => {
    setCustomers(getAllCustomers());
    setLoans(getAllLoans());
  }, []);

  // Filter search results as the query changes
  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      const q = searchQuery.toLowerCase().trim();
      const filtered = customers.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.mobileNumber.includes(q)
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, customers]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Get loans for the selected customer
  const customerLoans = selectedCustomer
    ? loans.filter(l => l.customerId === selectedCustomer.id || l.mobileNumber === selectedCustomer.mobileNumber)
    : [];

  // Calculations
  const totalLoans = customerLoans.length;
  const activeLoans = customerLoans.filter(l => l.status === 'Approved' || l.status === 'Repledged').length;
  const closedLoans = customerLoans.filter(l => l.status === 'Closed').length;
  const repledgedLoans = customerLoans.filter(l => l.status === 'Repledged').length;
  const auctionedLoans = customerLoans.filter(l => l.status === 'Auction').length;

  // Gold History Calculations
  const pledgedWeight = customerLoans.reduce((sum, l) => sum + (parseFloat(l.grossWeight) || 0), 0);
  const releasedWeight = customerLoans
    .filter(l => l.status === 'Closed')
    .reduce((sum, l) => sum + (parseFloat(l.grossWeight) || 0), 0);
  const currentGoldWeight = pledgedWeight - releasedWeight;

  // Financial calculations
  const totalLoanAmount = customerLoans.reduce((sum, l) => sum + (parseFloat(l.loanAmount) || 0), 0);

  // Payments and Interest calculations
  // For Closed loans, interest is fully collected. For others, we can compute or mock.
  const calculateInterest = (loan) => {
    const amount = parseFloat(loan.loanAmount) || 0;
    const rate = parseFloat(loan.interestRate) || 0;
    const period = parseFloat(loan.loanPeriod) || 12; // default 12 months if not specified
    return (amount * (rate / 100) * period) / 12;
  };

  const totalInterestCollected = customerLoans
    .filter(l => l.status === 'Closed')
    .reduce((sum, l) => sum + calculateInterest(l), 0);

  const outstandingBalance = customerLoans
    .filter(l => l.status === 'Approved' || l.status === 'Repledged')
    .reduce((sum, l) => sum + (parseFloat(l.loanAmount) || 0), 0);

  // Overdue calculations (Comparing due date with 2026-06-19)
  const currentDate = new Date('2026-06-19');
  const overdueAmount = customerLoans
    .filter(l => {
      if (l.status !== 'Approved' && l.status !== 'Repledged') return false;
      if (!l.dueDate) return false;
      return new Date(l.dueDate) < currentDate;
    })
    .reduce((sum, l) => sum + (parseFloat(l.loanAmount) || 0), 0);

  // Payment History generation
  const paymentHistory = [];
  customerLoans.forEach(l => {
    if (l.status === 'Closed') {
      const interest = calculateInterest(l);
      const principal = parseFloat(l.loanAmount) || 0;
      paymentHistory.push({
        loanNumber: l.loanNumber,
        paymentDate: l.dueDate || l.loanDate || '2026-06-19',
        amountPaid: principal + interest,
        interestPaid: interest,
        balanceAmount: 0,
        receiptNumber: `R-PAY-${l.loanNumber}`
      });
    } else if (l.status === 'Approved' || l.status === 'Repledged') {
      // Maybe some interest payment mock for active loans
      const interest = calculateInterest(l) * 0.5; // paid half the interest as mock
      const principal = parseFloat(l.loanAmount) || 0;
      paymentHistory.push({
        loanNumber: l.loanNumber,
        paymentDate: l.loanDate || '2026-06-19',
        amountPaid: interest,
        interestPaid: interest,
        balanceAmount: principal,
        receiptNumber: `R-INT-${l.loanNumber}`
      });
    }
  });

  // Activity Dates
  const lastLoanDate = customerLoans.length > 0
    ? customerLoans.reduce((latest, l) => (new Date(l.loanDate) > new Date(latest) ? l.loanDate : latest), customerLoans[0].loanDate)
    : 'N/A';

  const lastPaymentDate = paymentHistory.length > 0
    ? paymentHistory.reduce((latest, p) => (new Date(p.paymentDate) > new Date(latest) ? p.paymentDate : latest), paymentHistory[0].paymentDate)
    : 'N/A';

  // Styles
  const cardStyle = "bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col transition-all hover:shadow-md";
  const headerStyle = "text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5";
  const valStyle = "text-2xl font-bold text-gray-800";

  return (
    <div className="flex flex-col min-h-screen pb-10">
      {/* Search Header */}
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-text-primary">Customer History Dashboard</h2>
        <p className="text-xs text-text-secondary mt-0.5">Search by Customer ID, Name, or Mobile to load history.</p>
        
        <div className="mt-4 relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type Customer ID (e.g. C001) or Name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />

          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.map(c => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b last:border-0 text-sm text-gray-700 flex justify-between"
                >
                  <span className="font-semibold">{c.id} - {c.customerName}</span>
                  <span className="text-gray-500 text-xs">Mobile: {c.mobileNumber}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!selectedCustomer ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-12 bg-white/50 text-gray-400">
          <User className="w-16 h-16 mb-3 text-gray-300" />
          <p className="text-lg font-semibold">No Customer Selected</p>
          <p className="text-sm">Search and select a customer above to view their entire financial & loan history.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">

          {/* ── Left Column: Basic Details & Activity ── */}
          <div className="col-span-1 flex flex-col gap-6">
            
            {/* Basic Details */}
            <div className={cardStyle}>
              <h3 className={`${headerStyle} text-green-700`}><User className="w-4 h-4" /> Basic Details</h3>
              <div className="space-y-3 mt-2 text-sm text-gray-600">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-medium text-gray-500">Customer ID</span>
                  <span className="font-bold text-gray-800">{selectedCustomer.id}</span>
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
                  <span className="font-semibold text-gray-800">{selectedCustomer.aadhaarNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Registration Date</span>
                  <span className="font-semibold text-gray-800">01-Jan-2026</span>
                </div>
              </div>
            </div>

            {/* Customer Activity */}
            <div className={cardStyle}>
              <h3 className={`${headerStyle} text-blue-700`}><Calendar className="w-4 h-4" /> Customer Activity</h3>
              <div className="space-y-3 mt-2 text-sm text-gray-600">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="font-medium text-gray-500">Last Login Date</span>
                  <span className="font-semibold text-gray-800">19-Jun-2026</span>
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
          <div className="col-span-2 flex flex-col gap-6">

            {/* Top Stat Row */}
            <div className="grid grid-cols-4 gap-4">
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
              <div className="grid grid-cols-4 gap-4 mt-2">
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
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt No</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-sm">
                    {paymentHistory.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-4 text-center text-gray-400">No payment history found</td>
                      </tr>
                    ) : (
                      paymentHistory.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-800">{p.loanNumber}</td>
                          <td className="px-4 py-2 text-gray-500">{p.paymentDate}</td>
                          <td className="px-4 py-2 text-right text-green-600 font-semibold">₹{p.amountPaid.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2 text-right text-amber-600">₹{p.interestPaid.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2 text-right text-gray-500">₹{p.balanceAmount.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2 text-gray-500 font-mono text-xs">{p.receiptNumber}</td>
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
                  customerLoans.map(l => (
                    <div key={l.loanNumber} className="border border-gray-150 rounded-lg p-3 flex justify-between items-center text-sm">
                      <div>
                        <span className="font-bold text-gray-800">{l.loanNumber}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-gray-500">Amount: </span>
                        <span className="font-semibold text-gray-800">₹{parseFloat(l.loanAmount || 0).toLocaleString('en-IN')}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-gray-500">Gold: </span>
                        <span className="font-medium text-gray-700">{l.grossWeight}g ({l.ornamentType})</span>
                      </div>
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          l.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          l.status === 'Closed' ? 'bg-blue-100 text-blue-800' :
                          l.status === 'Repledged' ? 'bg-purple-100 text-purple-800' :
                          l.status === 'Auction' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {l.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default CustomerHistory;
