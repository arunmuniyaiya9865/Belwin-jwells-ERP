import React, { useState, useEffect } from 'react';
import { Search, Calendar, FilterX, ChevronDown, X, User, Banknote, FileText, CheckCircle2, ShieldAlert, MapPin, Phone } from 'lucide-react';
import { getPendingCustomers, approveCustomerByApprovalId, rejectCustomerByApprovalId } from '../services/customerService';
import toast from 'react-hot-toast';

const CustomerApprovalPending = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await getPendingCustomers();
      if (res.success) {
        setPendingCustomers(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending customers:', err);
      toast.error('Failed to load pending customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    setResults(pendingCustomers);
    setSearchQuery('');
  }, [pendingCustomers]);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim()) {
      const filtered = pendingCustomers.filter(c => 
        (c.customerId && c.customerId.toLowerCase().includes(q.toLowerCase())) ||
        (c.customerName && c.customerName.toLowerCase().includes(q.toLowerCase())) ||
        (c.mobileNumber && c.mobileNumber.includes(q))
      );
      setResults(filtered);
    } else {
      setResults(pendingCustomers);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
  };

  const handleApprove = async () => {
    if (!selectedCustomer) return;
    const confirmApprove = window.confirm(`Are you sure you want to approve customer ${selectedCustomer.customerName}?`);
    if (!confirmApprove) return;
    
    try {
      const res = await approveCustomerByApprovalId(selectedCustomer.customerId || selectedCustomer._id);
      if (res.success) {
        toast.success('Customer approved successfully');
        setSelectedCustomer(null);
        fetchPending();
      }
    } catch (err) {
      console.error('Approve failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to approve customer');
    }
  };

  const handleReject = async () => {
    if (!selectedCustomer) return;
    const reason = window.prompt(`Enter rejection reason for customer ${selectedCustomer.customerName}:`);
    if (reason === null) return; // cancelled
    if (!reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    if (reason.trim().length < 5) {
      toast.error('Rejection reason must be at least 5 characters');
      return;
    }

    try {
      const res = await rejectCustomerByApprovalId(selectedCustomer.customerId || selectedCustomer._id, reason.trim());
      if (res.success) {
        toast.success('Customer rejected successfully');
        setSelectedCustomer(null);
        fetchPending();
      }
    } catch (err) {
      console.error('Reject failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to reject customer');
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    if (status === 'Approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
          Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block animate-pulse"></span>
        Pending
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="mb-6 shrink-0">
        <h2 className="text-[22px] font-bold text-text-primary tracking-tight">Customer Approval Pending</h2>
        <p className="text-[14px] text-text-secondary mt-1">Track loan requests submitted for admin verification and approval.</p>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Filter by Loan ID or Customer..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
          <div className="relative">
            <select className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer">
              <option>Branch: All</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Calendar className="w-4 h-4" /> Date Range
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md">
            <FilterX className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">LOAN ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">CUSTOMER INFO</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">ASSIGNEE</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">STATUS</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">FINANCIAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Retrieving pending approvals...</span>
                    </div>
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                    {searchQuery.trim() ? "No customers match your search." : "No pending customer approvals."}
                  </td>
                </tr>
              ) : (
                results.map(c => (
                  <tr key={c.customerId || c._id} onClick={() => setSelectedCustomer(c)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800">#{c.customerId}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Application</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(c.customerName)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-800">{c.customerName}</div>
                          <div className="text-xs font-mono text-gray-600 mt-0.5">+91 {c.mobileNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">Unassigned</div>
                      <div className="text-xs text-gray-500 mt-0.5">{c.city || 'Main Branch'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status="Pending" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800">Review Required</div>
                      <div className="text-xs text-gray-500 mt-0.5">--</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <p className="text-sm text-gray-500">
            {results.length > 0 ? `Showing ${results.length} applications` : '0 applications'}
          </p>
        </div>
      </div>

      {/* Slide-over */}
      {selectedCustomer && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={() => setSelectedCustomer(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Application Detail</h2>
                <p className="text-sm text-gray-500">Loan ID: #{selectedCustomer.customerId}</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Status badge in slide-over header — reflects admin approval */}
                <StatusBadge status="Pending" />
                <button onClick={() => setSelectedCustomer(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
              
              {/* Customer Profile */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-green-800 font-bold">
                    <User className="w-5 h-5" />
                    Customer Profile
                  </div>
                  <button className="text-xs font-bold text-amber-700 hover:text-amber-800">Edit Info</button>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 shadow-sm">
                  <div className="w-[72px] h-[72px] bg-green-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {/* Live photo preview if available in the database */}
                    {selectedCustomer.customerPhotoUrl ? (
                      <img src={selectedCustomer.customerPhotoUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="text-2xl font-bold text-green-700">{getInitials(selectedCustomer.customerName)}</div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 text-base">{selectedCustomer.customerName}</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Gdn: {selectedCustomer.guardianName || selectedCustomer.guardian || 'N/A'}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1.5">
                      <Phone className="w-3.5 h-3.5" /> +91 {selectedCustomer.mobileNumber}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {selectedCustomer.doorStreet || selectedCustomer.doorNo}, {selectedCustomer.city} - {selectedCustomer.postalCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Configuration */}
              <div>
                <div className="flex items-center gap-2 text-green-800 font-bold mb-3">
                  <Banknote className="w-5 h-5" />
                  Loan Configuration
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Requested Amount</p>
                    <p className="text-base font-bold text-green-800">₹4,50,000</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Scheme</p>
                    <p className="text-base font-bold text-gray-900">Gold Premium</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Collateral Weight</p>
                    <p className="text-base font-bold text-gray-900">120g (22K)</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Tenure</p>
                    <p className="text-base font-bold text-gray-900">12 Months</p>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-xl p-3 border border-gray-50">
                  <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Items Description</p>
                  <p className="text-xs text-gray-600 italic">2x Gold Chains (Fine link), 1x Heavy Bracelet (Handmade)</p>
                </div>
              </div>

              {/* KYC Documents */}
              <div>
                <div className="flex items-center gap-2 text-green-800 font-bold mb-3">
                  <FileText className="w-5 h-5" />
                  KYC Documents
                </div>
                <div className="space-y-2">
                  <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-gray-800">Aadhaar Card (Front)</span>
                    </div>
                    <span className="text-[10px] font-bold text-green-700 tracking-wider">VERIFIED</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-gray-800">Aadhaar Card (Back)</span>
                    </div>
                    <span className="text-[10px] font-bold text-green-700 tracking-wider">VERIFIED</span>
                  </div>
                  <div className="bg-[#fff9eb] border border-[#e5c587] rounded-lg p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-[1.5px] border-amber-700 flex items-center justify-center">
                        <div className="flex gap-[2px]">
                          <div className="w-0.5 h-0.5 bg-amber-700 rounded-full"></div>
                          <div className="w-0.5 h-0.5 bg-amber-700 rounded-full"></div>
                          <div className="w-0.5 h-0.5 bg-amber-700 rounded-full"></div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">PAN Card</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 tracking-wider">AWAITING REVIEW</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-gray-800">Customer Live Photo</span>
                    </div>
                    <span className="text-[10px] font-bold text-green-700 tracking-wider">VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Verification Review Banner */}
              <div className="bg-[#f3f4f2] border border-[#e5e7e3] rounded-xl p-4 flex gap-4 items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                  <ShieldAlert className="w-5 h-5 text-amber-800" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[15px]">Verification Review</h4>
                  <p className="text-xs text-gray-600 mt-0.5">KYC Verification In Progress — Awaiting Admin Approval</p>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button 
                onClick={handleReject}
                className="flex-1 py-2.5 bg-white border border-red-300 text-red-700 font-bold text-sm rounded-lg hover:bg-red-50 transition-colors"
              >
                Reject Customer
              </button>
              <button 
                onClick={handleApprove}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg transition-colors"
              >
                Approve Customer
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default CustomerApprovalPending;
