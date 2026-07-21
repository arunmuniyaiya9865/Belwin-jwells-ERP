import React, { useState, useEffect } from 'react';
import { getCustomers } from '../../services/customerService';
import { Search, Filter, Eye, UserCheck, Calendar, MapPin, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import CustomerApprovalDrawer from './CustomerApprovalDrawer';

const ApprovedCustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [branchFilter, setBranchFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Drawer State
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        fetchApprovedCustomers();
    }, [page, branchFilter, dateRange.start, dateRange.end]);

    const fetchApprovedCustomers = async (search = searchQuery) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 10,
                status: 'Approved',
                search,
                branchId: branchFilter || undefined,
                startDate: dateRange.start || undefined,
                endDate: dateRange.end || undefined
            };

            const res = await getCustomers(params);
            if (res.success) {
                setCustomers(res.data);
                setTotalPages(res.pagination.pages);
                setTotalRecords(res.pagination.total);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch approved customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchApprovedCustomers(searchQuery);
    };

    const handleRefresh = () => {
        setSearchQuery('');
        setBranchFilter('');
        setDateRange({ start: '', end: '' });
        setPage(1);
        fetchApprovedCustomers('');
    };

    return (
        <div className="p-6 bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header & Summary Cards */}
                <div>
                    <nav className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                        <span>Borrower</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-indigo-600">Approved Customer List</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Approved Customer List</h1>
                    <p className="text-slate-500 text-sm mt-1">Permanent archive of all approved customers</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Approved</p>
                                <p className="text-2xl font-bold text-slate-900">{totalRecords}</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Today's Approvals</p>
                                <p className="text-2xl font-bold text-slate-900">-</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">This Month</p>
                                <p className="text-2xl font-bold text-slate-900">-</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between">
                    <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search ID, Name, Mobile..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20">
                            Search
                        </button>
                    </form>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => { setPage(1); setDateRange(p => ({ ...p, start: e.target.value })) }}
                            className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-indigo-500 text-slate-600"
                        />
                        <span className="text-slate-400 text-sm">to</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => { setPage(1); setDateRange(p => ({ ...p, end: e.target.value })) }}
                            className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-indigo-500 text-slate-600"
                        />
                        <button onClick={handleRefresh} className="p-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors bg-white ml-2">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Customer</th>
                                    <th className="px-6 py-4 font-semibold">Branch</th>
                                    <th className="px-6 py-4 font-semibold">Created By</th>
                                    <th className="px-6 py-4 font-semibold">Approved By</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                            <div className="animate-pulse flex flex-col items-center gap-3">
                                                <div className="h-4 bg-slate-200 rounded w-48"></div>
                                                <div className="h-4 bg-slate-200 rounded w-32"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : customers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <UserCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                            <p className="text-base font-medium text-slate-700">No approved customers found</p>
                                            <p className="text-sm mt-1">Adjust your filters or try a different search</p>
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((c) => (
                                        <tr key={c._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">{c.customerName}</span>
                                                    <span className="text-xs text-slate-500">{c.customerId}</span>
                                                    <span className="text-xs text-slate-500">{c.mobileNumber}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                                                    <MapPin className="w-3 h-3" />
                                                    {c.branchName || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700">{c.createdByEmployee?.employeeName || c.createdBy?.name || 'N/A'}</span>
                                                    <span className="text-xs text-slate-500">{c.createdByEmployee?.employeeId || c.createdBy?.employeeId || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700">{c.approvedByEmployee?.name || c.approvedBy?.name || 'N/A'}</span>
                                                    {c.approvedByEmployee?.employeeId && (
                                                        <span className="text-xs text-slate-500">{c.approvedByEmployee.employeeId}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-slate-700 font-medium">
                                                        {c.approvedDate ? format(new Date(c.approvedDate), 'dd MMM yyyy') : 'N/A'}
                                                    </span>
                                                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 w-fit px-2 py-0.5 rounded border border-emerald-200 mt-1">
                                                        Approved
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCustomer(c);
                                                        setIsDrawerOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && customers.length > 0 && (
                        <div className="p-4 border-t border-slate-200/60 bg-slate-50/50 flex items-center justify-between">
                            <span className="text-sm text-slate-500 font-medium">
                                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, totalRecords)} of {totalRecords} records
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CustomerApprovalDrawer 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                customer={selectedCustomer}
                viewOnly={true}
            />
        </div>
    );
};

export default ApprovedCustomerList;
