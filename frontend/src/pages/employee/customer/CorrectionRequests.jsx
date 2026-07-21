import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCorrectionRequests } from '../../../services/customerService';
import { Search, Edit, AlertTriangle, User, Phone, MapPin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CorrectionRequests = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCorrections();
    }, []);

    const fetchCorrections = async () => {
        try {
            setLoading(true);
            const res = await getCorrectionRequests();
            if (res.success) {
                setCustomers(res.data);
                setFilteredCustomers(res.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch correction requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!searchQuery) {
            setFilteredCustomers(customers);
            return;
        }
        const lower = searchQuery.toLowerCase();
        const filtered = customers.filter(c => 
            c.customerId?.toLowerCase().includes(lower) || 
            c.customerName?.toLowerCase().includes(lower) || 
            c.mobileNumber?.toLowerCase().includes(lower)
        );
        setFilteredCustomers(filtered);
    }, [searchQuery, customers]);

    const handleEditClick = (customer) => {
        navigate('/edit-delete-customer', { state: { editCustomer: customer } });
    };

    return (
        <div className="p-6 bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Correction Requests</h1>
                                <p className="text-slate-500 text-sm mt-1">Customers that require corrections before approval.</p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search ID, Name, Mobile..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/60 shadow-sm flex flex-col items-center justify-center">
                            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                            <p className="text-slate-500 mt-4 text-sm font-medium">Loading requests...</p>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/60 shadow-sm flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No Correction Requests</h3>
                            <p className="text-slate-500 mt-1">You don't have any customers that need correction right now.</p>
                        </div>
                    ) : (
                        filteredCustomers.map(customer => (
                            <div key={customer._id} className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center hover:border-amber-200 transition-colors">
                                
                                <div className="flex items-center gap-4 flex-1">
                                    {customer.customerPhotoUrl ? (
                                        <img src={customer.customerPhotoUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-slate-50" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                                            <User className="w-6 h-6" />
                                        </div>
                                    )}
                                    
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{customer.customerName}</h3>
                                        <p className="text-xs font-mono text-slate-500 mt-0.5">{customer.customerId}</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-4 flex-1 text-sm text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span>{customer.mobileNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span>{customer.city || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 w-full md:w-auto">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span>{customer.correctionRequestedAt ? format(new Date(customer.correctionRequestedAt), 'dd MMM yyyy, HH:mm') : 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto">
                                    <button
                                        onClick={() => handleEditClick(customer)}
                                        className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl font-medium transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit & Resubmit
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CorrectionRequests;
