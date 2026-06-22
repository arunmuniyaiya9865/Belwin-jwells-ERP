import React, { useState } from 'react';
import { Search, X, User, Fingerprint, FileImage, ShieldCheck, History, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { searchCustomers, getAllCustomers } from '../utils/customerStore';

const AadharVerification = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(getAllCustomers());
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim()) {
      setResults(searchCustomers(q));
    } else {
      setResults(getAllCustomers());
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="mb-6 shrink-0">
        <h2 className="text-[22px] font-bold text-text-primary tracking-tight">Aadhaar Verification</h2>
        <p className="text-[14px] text-text-secondary mt-1">Review and verify customer Aadhaar documents and details.</p>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by Customer ID or Name..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">CUSTOMER ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">CUSTOMER NAME</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">MOBILE</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">AADHAAR NO</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                results.map(c => (
                  <tr key={c.id} onClick={() => setSelectedCustomer(c)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">#{c.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(c.customerName)}
                        </div>
                        <div className="text-sm font-bold text-gray-800">{c.customerName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">+91 {c.mobileNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{c.aadhaarNo || 'Not provided'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> PENDING
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Panel for Aadhaar Details */}
      {selectedCustomer && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={() => setSelectedCustomer(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex flex-col p-5 border-b border-gray-200 bg-gray-50/50 relative">
              <button onClick={() => setSelectedCustomer(null)} className="absolute right-5 top-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 pr-8">Aadhaar Verification</h2>
              <p className="text-sm text-gray-500 mt-1">Required Details</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Customer Information */}
              <div>
                <div className="flex items-center gap-2 text-green-800 font-bold mb-3">
                  <User className="w-5 h-5" /> Customer Information
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm grid grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer ID</p>
                    <p className="text-sm font-bold text-gray-900">#{selectedCustomer.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Name</p>
                    <p className="text-sm font-bold text-gray-900">{selectedCustomer.customerName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile Number</p>
                    <p className="text-sm font-mono text-gray-900">+91 {selectedCustomer.mobileNumber}</p>
                  </div>
                </div>
              </div>

              {/* Aadhaar Details */}
              <div>
                <div className="flex items-center gap-2 text-green-800 font-bold mb-3">
                  <Fingerprint className="w-5 h-5" /> Aadhaar Details
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm grid grid-cols-2 gap-y-4 gap-x-4">
                  <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Aadhaar Number</p>
                    <p className="text-lg font-mono font-bold tracking-widest text-gray-900">{selectedCustomer.aadhaarNo || 'XXXX XXXX XXXX'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Aadhaar Holder Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCustomer.customerName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCustomer.dob || '1990-01-01'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gender</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCustomer.gender || 'Male'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
                    <p className="text-sm font-medium text-gray-900 leading-relaxed">
                      {selectedCustomer.permanentAddress || `${selectedCustomer.doorNo}, ${selectedCustomer.area}, ${selectedCustomer.city} - ${selectedCustomer.postalCode}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <div className="flex items-center gap-2 text-green-800 font-bold mb-3">
                  <FileImage className="w-5 h-5" /> Documents
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors h-24">
                    <FileImage className="w-6 h-6 text-gray-400" />
                    <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">Aadhaar Front<br/>Image</span>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors h-24">
                    <FileImage className="w-6 h-6 text-gray-400" />
                    <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">Aadhaar Back<br/>Image</span>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors h-24">
                    <User className="w-6 h-6 text-gray-400" />
                    <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">Customer<br/>Photo</span>
                  </div>
                </div>
              </div>

              {/* Verification Review Banner */}
              <div className="bg-[#f3f4f2] border border-[#e5e7e3] rounded-xl p-4 flex gap-4 items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                  <ShieldCheck className="w-5 h-5 text-amber-800" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[15px]">Awaiting Admin Approval</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Documents uploaded. Admin verification is pending.</p>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button onClick={() => setSelectedCustomer(null)} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors">
                Close
              </button>
              <button className="flex-1 py-2.5 bg-gray-100 text-gray-400 font-bold text-sm rounded-lg border border-gray-200 cursor-not-allowed" disabled>
                Pending Admin Approval
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default AadharVerification;
