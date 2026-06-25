import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Search, Eye, Pencil, Trash2, X, RefreshCcw,
  ChevronLeft, ChevronRight, Upload, FileText,
  User, Phone, MapPin, Loader2, AlertTriangle, ShieldAlert,
  Calendar, CheckCircle2, ChevronDown, Filter, Info,
} from 'lucide-react';
import {
  getCustomers,
  updateCustomer as apiUpdateCustomer,
  deleteCustomer as apiDeleteCustomer,
  uploadDocuments,
  getCustomerAuditLog,
} from '../services/customerService';

// ─────────────────────────────────────────────────────────────────────────────
// Constants & tiny helpers
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  'Customer Approval Pending': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-400' },
  'KYC Verification Pending':  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' },
  'KYC Verified':              { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-400' },
  'Approved':                  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-400' },
  'Rejected':                  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-400' },
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border shadow-sm whitespace-nowrap ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      {status ?? '—'}
    </span>
  );
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const maskAadhaar = (val) => {
  if (!val) return '—';
  const clean = val.replace(/\s/g, '');
  if (clean.length < 4) return val;
  return `XXXX-XXXX-${clean.slice(-4)}`;
};

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start justify-between gap-4 py-2 hover:bg-gray-50/50 transition-colors px-2 rounded-lg group">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
    <span className="text-xs font-bold text-gray-800 text-right break-words max-w-[200px]">{value || '—'}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Document slot – shows existing Cloudinary file + replacement picker
// ─────────────────────────────────────────────────────────────────────────────
const DocSlot = ({ label, existingUrl, newFile, onBrowse, onClear, inputRef, accept, hint }) => {
  const [imgErr, setImgErr] = useState(false);
  useEffect(() => setImgErr(false), [existingUrl]);

  return (
    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex justify-between items-center">
        <span>{label}</span>
        {hint && <span className="text-gray-300 font-normal normal-case">({hint})</span>}
      </p>

      {newFile ? (
        <div className="relative group rounded-lg overflow-hidden border border-green-200 bg-green-50/50 p-2">
           <div className="flex items-center gap-3">
            {newFile.type.startsWith('image/') ? (
              <img src={URL.createObjectURL(newFile)} className="h-10 w-10 object-cover rounded-md shadow-sm border border-white" alt="" />
            ) : (
              <div className="h-10 w-10 bg-red-100 rounded-md flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-red-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-700 font-bold truncate">{newFile.name}</p>
              <p className="text-[10px] text-green-500 font-medium italic">Click save to apply change</p>
            </div>
            <button type="button" onClick={onClear} className="bg-white p-1 rounded-full shadow-sm text-red-500 hover:bg-red-50 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
           </div>
        </div>
      ) : existingUrl ? (
        <div className="relative group border border-gray-200 rounded-lg overflow-hidden shadow-sm aspect-video bg-gray-50">
          {!imgErr ? (
            <img src={existingUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt={label} onError={() => setImgErr(true)} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-1.5 p-4 text-center">
              <ShieldAlert className="w-6 h-6 text-gray-300" />
              <a href={existingUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold underline decoration-blue-200 underline-offset-2">PREVIEW DOCUMENT</a>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-[1px]">
            <button type="button" onClick={onBrowse} className="bg-white text-gray-800 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all active:scale-95">
              <Upload className="w-3 h-3" /> REPLACE
            </button>
            <a href={existingUrl} target="_blank" rel="noreferrer" className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all delay-75 active:scale-95">
              <Eye className="w-3 h-3" /> VIEW FULL
            </a>
          </div>
        </div>
      ) : (
        <button type="button" onClick={onBrowse}
          className="w-full aspect-video border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-[10px] font-bold text-gray-400 hover:border-green-400 hover:text-green-600 hover:bg-green-50/30 transition-all group">
          <div className="p-2 rounded-full bg-gray-50 group-hover:bg-green-100 transition-colors">
            <Upload className="w-4 h-4" />
          </div>
          CLICK TO BROWSE
        </button>
      )}

      <input ref={inputRef} type="file" hidden accept={accept}
        onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(label.toLowerCase().includes('photo') ? 'photo' : (label.toLowerCase().includes('aadhaar') ? 'aadhaarDoc' : 'proof2Doc'), e.target.files[0]); }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FILES = { photo: null, aadhaarDoc: null, proof2Doc: null };

const EditDeleteCustomer = () => {
  const navigate = useNavigate();
  // ── list ─────────────────────────────────────────────────────────────────
  const [customers, setCustomers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 });
  const [search, setSearch]         = useState('');
  const [filters, setFilters]       = useState({ 
    status: '', 
    gender: '', 
    city: '', 
    startDate: '', 
    endDate: '' 
  });
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const timerRef = useRef(null);

  // ── view slide-over ───────────────────────────────────────────────────────
  const [viewCustomer, setViewCustomer] = useState(null);
  const [activeTab, setActiveTab]       = useState('info'); // 'info', 'docs', 'history'
  const [auditLog, setAuditLog]         = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // ── edit slide-over ───────────────────────────────────────────────────────
  const [editCustomer, setEditCustomer] = useState(null);
  const [editForm, setEditForm]         = useState({});
  const [newFiles, setNewFiles]         = useState({ ...EMPTY_FILES });
  const [editLoading, setEditLoading]   = useState(false);
  const photoRef   = useRef(null);
  const aadhaarRef = useRef(null);
  const proof2Ref  = useRef(null);

  // ── delete modal ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteReason, setDeleteReason]   = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── session ──────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState({ role: 'employee' });
  useEffect(() => {
    try {
      const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (info?.role) setCurrentUser(info);
    } catch {}
  }, []);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async (page = 1, q = search, f = filters, s = sort) => {
    setLoading(true);
    try {
      const params = {
        page, limit: 10,
        ...s,
        ...(q.trim()    && { search: q.trim() }),
        ...(f.status    && { status: f.status }),
        ...(f.gender    && { gender: f.gender }),
        ...(f.city      && { city: f.city }),
        ...(f.startDate && { startDate: f.startDate }),
        ...(f.endDate   && { endDate: f.endDate }),
      };
      const res = await getCustomers(params);
      setCustomers(res.data ?? []);
      setPagination(prev => ({ ...prev, ...(res.pagination ?? {}), page }));
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, filters, sort]);

  useEffect(() => { fetchCustomers(1); }, []);

  const handleSort = (field) => {
    const isAsc = sort.sortBy === field && sort.sortOrder === 'asc';
    const newSort = { sortBy: field, sortOrder: isAsc ? 'desc' : 'asc' };
    setSort(newSort);
    fetchCustomers(1, search, filters, newSort);
  };

  const handleExport = () => {
    if (!customers.length) {
      toast.error('No data to export');
      return;
    }
    
    // Create a simple CSV for export
    const headers = ['CustomerID', 'Name', 'Mobile', 'Aadhaar', 'City', 'Status', 'CreatedAt'];
    const rows = customers.map(c => [
      c.customerId,
      c.customerName,
      c.mobileNumber,
      c.aadhaarNumber,
      c.city,
      c.status,
      new Date(c.createdAt).toLocaleDateString()
    ].join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customer_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  // debounced search
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearch(q);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchCustomers(1, q, filters, sort), 450);
  };

  const handleFilterChange = (key, val) => {
    const f = { ...filters, [key]: val };
    setFilters(f);
    fetchCustomers(1, search, f, sort);
  };

  const handleReset = () => {
    setSearch('');
    const f = { status: '', gender: '', city: '', startDate: '', endDate: '' };
    setFilters(f);
    const s = { sortBy: 'createdAt', sortOrder: 'desc' };
    setSort(s);
    fetchCustomers(1, '', f, s);
  };

  // ── view ──────────────────────────────────────────────────────────────────
  const openView = async (c) => { 
    setEditCustomer(null); 
    setViewCustomer(c);
    setActiveTab('info');
    
    // Fetch full audit log when opening view
    setAuditLoading(true);
    try {
      const res = await getCustomerAuditLog(c._id);
      setAuditLog(res.data || []);
    } catch {
      setAuditLog(c.auditLog || []);
    } finally {
      setAuditLoading(false);
    }
  };
  const closeView = () => { setViewCustomer(null); setAuditLog([]); };

  // ── edit ──────────────────────────────────────────────────────────────────
  const openEdit = (c) => {
    setViewCustomer(null);
    setNewFiles({ ...EMPTY_FILES });
    setEditForm({
      customerName:     c.customerName     ?? '',
      guardianName:     c.guardianName     ?? '',
      dateOfBirth:      c.dateOfBirth ? c.dateOfBirth.substring(0, 10) : '',
      age:              String(c.age ?? ''),
      gender:           c.gender           ?? 'Male',
      mobileNumber:     c.mobileNumber     ?? '',
      alternateNumber:  c.alternateNumber  ?? '',
      aadhaarNumber:    c.aadhaarNumber    ?? '',
      panNumber:        c.panNumber        ?? '',
      doorStreet:       c.doorStreet       ?? '',
      area:             c.area             ?? '',
      city:             c.city             ?? '',
      postalCode:       c.postalCode       ?? '',
      permanentAddress: c.permanentAddress ?? '',
      temporaryAddress: c.temporaryAddress ?? '',
      voterId:          c.voterId          ?? '',
      occupation:       c.occupation       ?? '',
      proof2Name:       c.proof2Name       ?? '',
      remarks:          c.remarks          ?? '',
    });
    setEditCustomer(c);
  };
  const closeEdit = () => setEditCustomer(null);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // File selection via DocSlot
  const handleFileSelect = (fileKey, file) => {
    if (!file) return;
    const maxMB = fileKey === 'photo' ? 5 : 10;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`File too large — max ${maxMB} MB`);
      return;
    }
    setNewFiles(prev => ({ ...prev, [fileKey]: file }));
  };
  const clearFile = (fileKey) => {
    setNewFiles(prev => ({ ...prev, [fileKey]: null }));
    const map = { photo: photoRef, aadhaarDoc: aadhaarRef, proof2Doc: proof2Ref };
    if (map[fileKey]?.current) map[fileKey].current.value = '';
  };

  const handleEditSubmit = async () => {
    if (!editForm.customerName?.trim())  return toast.error('Customer name is required');
    if (!editForm.guardianName?.trim())  return toast.error('Guardian name is required');
    if (!editForm.mobileNumber?.trim())  return toast.error('Mobile number is required');
    if (!editForm.doorStreet?.trim())    return toast.error('Door No/Street is required');
    if (!editForm.area?.trim())          return toast.error('Area is required');
    if (!editForm.age)                   return toast.error('Age is required');

    setEditLoading(true);
    try {
      // 1. Update text fields
      await apiUpdateCustomer(editCustomer._id, {
        ...editForm,
        age: parseInt(editForm.age, 10),
      });

      // 2. Replace documents if any new files were selected
      const hasFiles = Object.values(newFiles).some(Boolean);
      if (hasFiles) await uploadDocuments(editCustomer._id, newFiles);

      toast.success('Customer updated successfully!');
      closeEdit();
      fetchCustomers(pagination.page, search, filters);
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors?.length) {
        apiErrors.forEach(e => toast.error(`${e.field}: ${e.message}`));
      } else {
        toast.error(err?.response?.data?.message ?? 'Failed to update customer');
      }
    } finally {
      setEditLoading(false);
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────
  const openDelete = (c) => { setDeleteTarget(c); setDeleteReason(''); };
  const closeDelete = () => setDeleteTarget(null);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await apiDeleteCustomer(deleteTarget._id, { deleteReason });
      toast.success(`"${deleteTarget.customerName}" deleted successfully`);
      closeDelete();
      // If we deleted the last item on the page, go back one page
      const nextPage = customers.length === 1 && pagination.page > 1
        ? pagination.page - 1
        : pagination.page;
      fetchCustomers(nextPage, search, filters);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete customer');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── common style tokens ───────────────────────────────────────────────────
  const inp  = 'w-full px-3 py-1.5 text-sm bg-white border border-gray-300 shadow-sm rounded-md ' +
               'focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors outline-none';
  const lbl  = 'block text-xs font-semibold text-gray-600 mb-0.5';
  const iBtn = 'p-1.5 rounded-md transition-colors disabled:opacity-40';

  // ── pagination helpers ────────────────────────────────────────────────────
  const { total, page, pages } = pagination;
  const from = total === 0 ? 0 : (page - 1) * 10 + 1;
  const to   = Math.min(page * 10, total);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-[#F8FAFC]" style={{ height: 'calc(100vh - 100px)' }}>

      {/* ── Page Header ── */}
      <div className="mb-4 shrink-0 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl border border-green-100">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Edit / Delete Customer</h2>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full border border-yellow-200">
                {total} RECORDS
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
              Finance ERP • Customer Management Portal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:text-green-600 transition-all shadow-sm active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" /> EXPORT EXCEL
          </button>
          <button
            onClick={() => navigate('/new-customer')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md active:scale-95 shadow-green-200"
          >
             ADD CUSTOMER
          </button>
          <button
            onClick={() => fetchCustomers(pagination.page)}
            className="p-2 text-gray-400 bg-gray-50 border border-gray-200 rounded-lg hover:text-green-600 hover:bg-green-50 hover:border-green-200 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="mb-4 shrink-0 bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={handleSearchChange}
            placeholder="Search Name, Mobile, ID..."
            className="w-full pl-10 pr-4 py-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-300 placeholder:font-normal"
          />
        </div>

        <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden lg:block" />

        {/* Status filter */}
        <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}
          className="py-2 pl-3 pr-8 text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg focus:border-green-500 outline-none cursor-pointer">
          <option value="">STATUS: ALL</option>
          <option>Customer Approval Pending</option>
          <option>KYC Verification Pending</option>
          <option>KYC Verified</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>

        {/* City Filter */}
        <div className="relative">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text" value={filters.city} onChange={e => handleFilterChange('city', e.target.value)}
            placeholder="CITY"
            className="w-32 pl-8 pr-3 py-2 text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg focus:border-green-500 outline-none"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
           <input
            type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)}
            className="py-1.5 px-2 text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg focus:border-green-500 outline-none"
          />
          <span className="text-gray-300 font-bold">→</span>
          <input
            type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)}
            className="py-1.5 px-2 text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg focus:border-green-500 outline-none"
          />
        </div>

        <div className="flex-1" />

        {/* Reset */}
        {(search || filters.status || filters.city || filters.startDate || filters.endDate) && (
          <button onClick={handleReset}
            className="flex items-center gap-1.5 text-[11px] font-extrabold text-red-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors group">
            <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" /> CLEAR FILTERS
          </button>
        )}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden relative border-t-0">
        {/* Table Background Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-green-600 z-20" />
        
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-[#FBFCFD] sticky top-0 z-10 border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <tr className="divide-x divide-gray-50">
                {[
                  { label: 'CUSTOMER ID', width: 'w-[140px]', field: 'customerId' },
                  { label: 'CUSTOMER PROFILE', width: 'w-[280px]', field: 'customerName' },
                  { label: 'UID / ADDRESS', width: 'w-[240px]', field: 'city' },
                  { label: 'STATUS', width: 'w-[160px]', field: 'status' },
                  { label: 'TIMESTAMPS', width: 'w-[150px]', field: 'createdAt' },
                  { label: 'CONTROL ACTIONS', width: 'w-[200px]' },
                ].map((h, i) => (
                  <th 
                    key={i} 
                    className={`${h.width} px-4 py-4 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100/50 transition-colors`}
                    onClick={() => h.field && handleSort(h.field)}
                  >
                    <div className="flex items-center gap-2">
                       {h.label}
                       {h.field && sort.sortBy === h.field && (
                         <span className="text-green-600">
                            {sort.sortOrder === 'asc' ? '↑' : '↓'}
                         </span>
                       )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-24 text-center">
                    <div className="relative w-12 h-12 mx-auto">
                      <div className="absolute inset-0 border-4 border-green-100 rounded-full" />
                      <div className="absolute inset-0 border-4 border-t-green-600 rounded-full animate-spin" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 mt-4 uppercase tracking-widest">Retrieving Secure Records...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-24 text-center bg-gray-50/10">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                       <User className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-sm font-extrabold text-gray-900">No matching records found</p>
                    <p className="text-[11px] text-gray-400 mt-1 font-medium uppercase tracking-wider">Try adjusting filters for internal customer lookup</p>
                    <button onClick={handleReset} className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-extrabold hover:bg-gray-50 transition-all text-gray-600">RESET DIRECTORY</button>
                  </td>
                </tr>
              ) : (
                customers.map((c, idx) => (
                  <tr key={idx} className={`group hover:bg-green-50/30 transition-all cursor-default border-l-4 border-l-transparent hover:border-l-green-500 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-2 font-mono">
                      <button 
                        onClick={() => openView(c)}
                        className="text-[10px] font-extrabold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 hover:bg-green-100 transition-all"
                      >
                        {c.customerId ?? '—'}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                       <div className="flex items-center gap-3">
                          <div className="relative group/avatar">
                            {c.customerPhotoUrl ? (
                              <img 
                                src={c.customerPhotoUrl} 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23dcfce7"/><text x="50%" y="50%" font-family="sans-serif" font-size="14" font-weight="bold" fill="%2315803d" dominant-baseline="central" text-anchor="middle">${c.customerName?.[0] ?? '?'}</text></svg>`;
                                }}
                                className="w-10 h-10 rounded-lg object-cover ring-2 ring-white shadow-md border border-gray-100 group-hover/avatar:scale-110 transition-transform duration-300" 
                                alt="" 
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-black text-sm uppercase ring-2 ring-white shadow-sm border border-green-200">
                                {c.customerName?.[0] ?? '?'}
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                               <div className={`w-2 h-2 rounded-full ${c.status === 'Approved' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                            </div>
                          </div>
                          <div className="min-w-0">
                             <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tight">{c.customerName}</p>
                             <div className="flex items-center gap-1.5 mt-0.5">
                               <Phone className="w-2.5 h-2.5 text-gray-400" />
                               <span className="text-[10px] font-bold text-gray-400 tracking-wider">+{c.mobileNumber}</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-4 py-2">
                       <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                             <ShieldAlert className="w-2.5 h-2.5 text-gray-300" />
                             <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 rounded opacity-70">UID: {maskAadhaar(c.aadhaarNumber)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                             <MapPin className="w-2.5 h-2.5 text-gray-300" />
                             <span className="text-[10px] font-bold text-gray-900 uppercase">{c.city || 'UNDEFINED'}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-4 py-2">
                       <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-2">
                       <div className="space-y-0.5">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase">Created: {fmtDate(c.createdAt)}</span>
                          <span className="block text-[9px] font-bold text-green-600 uppercase bg-green-50 px-1 rounded inline-block">Updated: {fmtDate(c.updatedAt)}</span>
                       </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2 pr-2">
                        <button onClick={() => openView(c)} title="View Profile"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100">
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase">View</span>
                        </button>
                        <button onClick={() => openEdit(c)} title="Modify Data"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm border border-green-100">
                          <Pencil className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase">Edit</span>
                        </button>
                        <button onClick={() => openDelete(c)} title="Archive Record"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-[#FBFCFD] flex items-center justify-between">
          <div className="flex items-center gap-4">
             <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
               Displaying {from}–{to} <span className="mx-2 text-gray-200">|</span> Total Records: {total}
             </p>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg border border-gray-200 shadow-inner">
            <button 
              onClick={() => fetchCustomers(page - 1)} 
              disabled={page <= 1 || loading}
              className="p-2 rounded-md bg-white hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 border border-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                const p = pages <= 5 ? i + 1 : (page <= 3 ? i + 1 : (page >= pages - 2 ? pages - 4 + i : page - 2 + i));
                return (
                  <button key={p} onClick={() => fetchCustomers(p)}
                    className={`min-w-[32px] h-8 text-[11px] font-black rounded-md transition-all shadow-sm
                      ${p === page ? 'bg-green-600 text-white shadow-green-200' : 'bg-white hover:bg-green-50 text-gray-600 hover:text-green-700'}`}>
                    {p}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => fetchCustomers(page + 1)} 
              disabled={page >= pages || loading}
              className="p-2 rounded-md bg-white hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 border border-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          VIEW SLIDE-OVER
      ══════════════════════════════════════════════════════════════════════ */}
      {viewCustomer && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] transition-all duration-500" onClick={closeView} />
          <div className="fixed right-0 top-0 bottom-0 w-[520px] bg-white shadow-[-20px_0_50px_-12px_rgba(0,0,0,0.25)] z-[101] flex flex-col transform transition-transform duration-500 ease-out animate-slide-in">
            {/* Header */}
            <div className="relative overflow-hidden shrink-0 border-b border-gray-100 bg-white">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-600" />
              <div className="px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100 shadow-sm">
                    <User className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase leading-tight">{viewCustomer.customerName}</h3>
                    <p className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded inline-block mt-1 tracking-widest uppercase">ID: {viewCustomer.customerId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={closeView} className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-gray-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex px-6 gap-8 border-b border-gray-50">
                {[
                  { id: 'info', label: 'PROFILE', icon: User },
                  { id: 'docs', label: 'KYC DOCUMENTS', icon: ShieldAlert },
                  { id: 'history', label: 'AUDIT TRAIL', icon: RefreshCcw }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all relative
                      ${activeTab === t.id ? 'text-green-600' : 'text-gray-300 hover:text-gray-500'}`}
                  >
                    <t.icon className={`w-3.5 h-3.5 ${activeTab === t.id ? 'text-green-600' : 'text-gray-300'}`} />
                    {t.label}
                    {activeTab === t.id && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-green-600 rounded-t-full shadow-[0_-2px_8px_rgba(22,163,74,0.4)]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#FDFEFE]">
              <div className="p-6 space-y-6">
                {activeTab === 'info' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Identification Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                       <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">Identification & Basis</h4>
                          <StatusBadge status={viewCustomer.status} />
                       </div>
                       <div className="p-4 space-y-1">
                          <InfoRow label="Registration Date" value={fmtDate(viewCustomer.createdAt)} icon={FileText} />
                          <InfoRow label="Aadhaar Number" value={maskAadhaar(viewCustomer.aadhaarNumber)} icon={ShieldAlert} />
                          <InfoRow label="PAN Number" value={viewCustomer.panNumber} icon={FileText} />
                          <InfoRow label="Voter ID" value={viewCustomer.voterId} icon={FileText} />
                       </div>
                    </div>

                    {/* Personal Details */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                       <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100">
                          <h4 className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">Personal Details</h4>
                       </div>
                       <div className="p-4 space-y-1">
                          <InfoRow label="Full Legal Name" value={viewCustomer.customerName} icon={User} />
                          <InfoRow label="Guardian / Father" value={viewCustomer.guardianName} icon={User} />
                          <InfoRow label="Date of Birth" value={fmtDate(viewCustomer.dateOfBirth)} icon={FileText} />
                          <InfoRow label="Calculated Age" value={`${viewCustomer.age} Years`} icon={FileText} />
                          <InfoRow label="Gender Identity" value={viewCustomer.gender} icon={User} />
                          <InfoRow label="Occupation" value={viewCustomer.occupation} icon={FileText} />
                       </div>
                    </div>

                    {/* Contact & Address */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                       <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100">
                          <h4 className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">Contact & Residency</h4>
                       </div>
                       <div className="p-4 space-y-1">
                          <InfoRow label="Primary Mobile" value={viewCustomer.mobileNumber} icon={Phone} />
                          <InfoRow label="Secondary Phone" value={viewCustomer.alternateNumber} icon={Phone} />
                          <InfoRow label="Postal Code" value={viewCustomer.postalCode} icon={MapPin} />
                          <InfoRow label="Current City" value={viewCustomer.city} icon={MapPin} />
                          <div className="py-3 px-2 border-t border-gray-50 mt-2">
                             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Residential Address</p>
                             <p className="text-xs font-bold text-gray-700 leading-relaxed">
                               {viewCustomer.doorStreet}, {viewCustomer.area}, {viewCustomer.city} - {viewCustomer.postalCode}
                             </p>
                          </div>
                       </div>
                    </div>

                    {viewCustomer.remarks && (
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                         <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                         <div>
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Administrative Remarks</p>
                            <p className="text-xs font-bold text-amber-600/80 mt-1 leading-relaxed">{viewCustomer.remarks}</p>
                         </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'docs' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 gap-4">
                       <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                             <span>CUSTOMER PHOTOGRAPH</span>
                             <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[9px]">SECURE ASSET</span>
                          </p>
                          <div className="relative rounded-xl overflow-hidden border border-gray-100 aspect-square bg-gray-50">
                             {viewCustomer.customerPhotoUrl ? (
                               <img src={viewCustomer.customerPhotoUrl} 
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" font-weight="bold" fill="%239ca3af" dominant-baseline="central" text-anchor="middle">NOT FOUND</text></svg>`;
                                    }}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Customer" />
                             ) : (
                               <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2">
                                  <User className="w-12 h-12" />
                                  <span className="text-[10px] font-bold">NO ASSET FOUND</span>
                               </div>
                             )}
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <a href={viewCustomer.customerPhotoUrl} target="_blank" rel="noreferrer" className="bg-white text-gray-900 text-[10px] font-black px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
                                   <Eye className="w-4 h-4" /> FULL SCREEN PREVIEW
                                </a>
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'AADHAAR DOCUMENT', url: viewCustomer.aadhaarDocumentUrl },
                            { label: viewCustomer.proof2Name || 'SECONDARY PROOF', url: viewCustomer.proof2DocumentUrl }
                          ].map((d, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group">
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 truncate">{d.label}</p>
                               <div className="relative h-32 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                  {d.url ? (
                                    <img src={d.url} 
                                         onError={(e) => {
                                           e.target.onerror = null;
                                           e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="sans-serif" font-size="16" font-weight="bold" fill="%239ca3af" dominant-baseline="central" text-anchor="middle">NOT FOUND</text></svg>`;
                                         }}
                                         className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={d.label} />
                                  ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-1 text-center p-2">
                                       <FileText className="w-8 h-8" />
                                       <span className="text-[9px] font-bold uppercase">UNAVAILABLE</span>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <a href={d.url} target="_blank" rel="noreferrer" className="bg-white text-gray-900 text-[9px] font-black p-2 rounded-full shadow-xl hover:scale-110 transition-transform">
                                        <Eye className="w-4 h-4" />
                                     </a>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4 animate-fade-in">
                    {auditLoading ? (
                      <div className="py-20 text-center">
                         <div className="w-8 h-8 border-4 border-t-green-600 border-green-100 rounded-full animate-spin mx-auto mb-4" />
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing Blockchain Logs...</p>
                      </div>
                    ) : auditLog.length === 0 ? (
                      <div className="py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                         <RefreshCcw className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No transaction history recorded</p>
                      </div>
                    ) : (
                      <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                        {auditLog.slice().reverse().map((a, i) => (
                          <div key={i} className="relative group">
                            <div className="absolute -left-8 top-1.5 w-6 h-6 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center z-10 group-hover:border-green-500 group-hover:scale-110 transition-all">
                               <div className="w-2 h-2 bg-gray-200 rounded-full group-hover:bg-green-500 transition-colors" />
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                               <div className="flex items-center justify-between mb-2">
                                  <span className="text-[9px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded uppercase tracking-tighter shadow-inner">
                                    {a.action?.replace(/_/g,' ')}
                                  </span>
                                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{fmtDate(a.timestamp)} • {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               </div>
                               <p className="text-[11px] font-bold text-gray-600 leading-relaxed italic border-l-2 border-gray-50 pl-3">"{a.note || 'Internal ledger entry generated by system'}"</p>
                               {a.performedBy?.username && (
                                 <div className="mt-3 flex items-center gap-2 pt-3 border-t border-gray-50">
                                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-400">{a.role?.[0]}</div>
                                    <p className="text-[9px] font-bold text-gray-400 tracking-wide uppercase">Authored By: <span className="text-gray-600">{a.performedBy.username}</span> <span className="text-[8px] opacity-50">({a.role})</span></p>
                                 </div>
                               )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 shrink-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { closeView(); openEdit(viewCustomer); }}
                    className="flex-1 bg-green-600 text-white text-[10px] font-black py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95 shadow-green-100 uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                  <button 
                    onClick={() => { closeView(); openDelete(viewCustomer); }}
                    className="bg-red-50 text-red-600 text-[10px] font-black py-4 px-6 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100 uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Archive
                  </button>
                  <button 
                    onClick={closeView}
                    className="bg-gray-50 text-gray-500 text-[10px] font-black py-4 px-6 rounded-xl hover:bg-gray-100 transition-all border border-gray-100 uppercase tracking-widest"
                  >
                    Close
                  </button>
               </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          EDIT SLIDE-OVER
      ══════════════════════════════════════════════════════════════════════ */}
      {editCustomer && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100]" onClick={closeEdit} />
          <div className="fixed right-0 top-0 bottom-0 w-[640px] bg-white shadow-2xl z-[101] flex flex-col transform transition-transform duration-500 ease-out animate-slide-in">
            {/* Header */}
            <div className="relative overflow-hidden shrink-0 border-b border-gray-100 bg-white">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-600" />
              <div className="px-6 py-5 flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase leading-tight">Edit Customer Configuration</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target UID:</span>
                      <span className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">{editCustomer.customerId}</span>
                      <span className="text-gray-200 text-xs text-bold">|</span>
                      <span className="text-[10px] font-black text-gray-900 uppercase">{editCustomer.customerName}</span>
                   </div>
                </div>
                <button onClick={closeEdit} className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#FDFEFE] custom-scrollbar space-y-8">
                {/* Personal Information */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center border border-green-100">
                        <User className="w-4 h-4 text-green-600" />
                     </div>
                     <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Personal Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Full Legal Name</label>
                      <input name="customerName" value={editForm.customerName} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Guardian Name</label>
                      <input name="guardianName" value={editForm.guardianName} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Occupation</label>
                      <input name="occupation" value={editForm.occupation} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Date of Birth</label>
                      <input type="date" name="dateOfBirth" value={editForm.dateOfBirth} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm" />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Age</label>
                        <input type="number" name="age" value={editForm.age} min="1" max="120" onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Gender</label>
                        <select name="gender" value={editForm.gender} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-800 focus:bg-white focus:border-green-500 outline-none transition-all shadow-sm cursor-pointer">
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Identity & Contact */}
                <div>
                  <div className="flex items-center gap-3 mb-4 px-2">
                     <div className="w-[1px] h-4 bg-green-200" />
                     <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Identity & Contact Data</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest flex items-center gap-2">
                         <Phone className="w-3 h-3" /> Primary Mobile
                      </label>
                      <input type="tel" name="mobileNumber" value={editForm.mobileNumber} maxLength={10} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Alternate Phone</label>
                      <input type="tel" name="alternateNumber" value={editForm.alternateNumber} maxLength={10} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest flex items-center gap-2">
                         <ShieldAlert className="w-3 h-3" /> Aadhaar Identification
                      </label>
                      <input name="aadhaarNumber" value={editForm.aadhaarNumber} maxLength={14} placeholder="0000 0000 0000" onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm tracking-[0.1em]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">PAN Card Number</label>
                      <input name="panNumber" value={editForm.panNumber} maxLength={10} style={{ textTransform: 'uppercase' }} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm tracking-[0.1em]" />
                    </div>
                  </div>
                </div>

                {/* Residency Information */}
                <div>
                  <div className="flex items-center gap-3 mb-4 px-2">
                     <div className="w-[1px] h-4 bg-green-200" />
                     <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Residency & Presence</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest flex items-center gap-2">
                         <MapPin className="w-3 h-3" /> Door No / Street
                      </label>
                      <input name="doorStreet" value={editForm.doorStreet} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Area / Landmark</label>
                      <input name="area" value={editForm.area} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">City</label>
                      <input name="city" value={editForm.city} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Postal Code</label>
                      <input name="postalCode" value={editForm.postalCode} maxLength={6} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm tracking-[0.2em]" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Permanent Registry Address</label>
                      <textarea name="permanentAddress" value={editForm.permanentAddress} onChange={handleEditChange} rows={2} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm resize-none" />
                    </div>
                  </div>
                </div>

                {/* Digital Assets */}
                <div>
                   <div className="flex items-center gap-3 mb-4 px-2">
                     <div className="w-[1px] h-4 bg-green-200" />
                     <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Digital Document Assets</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <DocSlot 
                        label="Customer Photo Avatar"
                        existingUrl={editCustomer.customerPhotoUrl}
                        newFile={newFiles.photo}
                        inputRef={photoRef}
                        accept="image/*"
                        onBrowse={() => photoRef.current?.click()}
                        onClear={() => clearFile('photo')}
                     />
                     <DocSlot 
                        label="Primary Aadhaar Proof"
                        existingUrl={editCustomer.aadhaarDocumentUrl}
                        newFile={newFiles.aadhaarDoc}
                        inputRef={aadhaarRef}
                        accept="image/*,application/pdf"
                        onBrowse={() => aadhaarRef.current?.click()}
                        onClear={() => clearFile('aadhaarDoc')}
                     />
                     <div className="col-span-2">
                        <div className="flex items-end gap-4">
                           <div className="flex-1">
                              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Secondary Proof Identity Name</label>
                              <input name="proof2Name" value={editForm.proof2Name} onChange={handleEditChange} placeholder="e.g. EB Bill, Voter Id" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:border-green-500 outline-none transition-all mb-4 mt-2" />
                              <DocSlot 
                                label="Secondary Instrument Upload"
                                existingUrl={editCustomer.proof2DocumentUrl}
                                newFile={newFiles.proof2Doc}
                                inputRef={proof2Ref}
                                accept="image/*,application/pdf"
                                onBrowse={() => proof2Ref.current?.click()}
                                onClear={() => clearFile('proof2Doc')}
                              />
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
                
                {/* Remarks */}
                <div className="pb-8">
                   <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Internal Administrative Remarks</label>
                   <textarea name="remarks" value={editForm.remarks} onChange={handleEditChange} rows={3} className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-2xl text-xs font-bold text-gray-700 focus:ring-0 focus:border-green-500 outline-none transition-all shadow-inner" placeholder="Enter reason for modification or special notes..." />
                </div>
            </div>

            {/* Footer actions */}
            <div className="shrink-0 p-6 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleEditSubmit} disabled={editLoading}
                  className="flex-1 bg-green-600 text-white text-xs font-black py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95 shadow-green-100 flex items-center justify-center gap-2 uppercase tracking-[0.1em]"
                >
                  {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {editLoading ? 'Authorizing Updates...' : 'Synchronize Changes'}
                </button>
                <button onClick={closeEdit} disabled={editLoading} className="px-8 py-4 bg-gray-50 text-gray-500 text-xs font-black rounded-xl hover:bg-gray-100 transition-all border border-gray-100 uppercase tracking-[0.1em]">
                  Abort
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DELETE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform animate-pop-in">
            {/* Header */}
            <div className="px-6 pt-8 pb-4 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-100 shadow-inner group">
                <Trash2 className="w-10 h-10 text-red-500 transition-transform group-hover:rotate-12" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Archive Records?</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-widest leading-loose mx-8"> You are about to initiate a secure deletion protocol for customer profile:</p>
            </div>

            {/* Target Data */}
            <div className="px-8 py-4">
               <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between gap-4">
                     <div>
                        <p className="text-xs font-black text-gray-900 uppercase">{deleteTarget.customerName}</p>
                        <p className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded inline-block mt-2 tracking-widest">{deleteTarget.customerId}</p>
                     </div>
                     <StatusBadge status={deleteTarget.status} />
                  </div>
               </div>
            </div>

            {/* Safety Check */}
            <div className="px-8 pb-8 space-y-4">
               <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-[10px] font-bold text-amber-700 leading-normal uppercase">
                    This profile will be moved to the archive registry. All active loan linkages will remain in read-only preservation.
                  </p>
               </div>
               
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1 text-center">Authorization Reason</label>
                  <input
                    type="text" value={deleteReason} onChange={e => setDeleteReason(e.target.value)}
                    placeholder="e.g. DATA_DUPLICATION"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-[11px] font-black text-center text-gray-700 focus:border-red-500 outline-none transition-all placeholder:text-gray-200"
                  />
               </div>
            </div>

            {/* Confirm Actions */}
            <div className="p-6 bg-gray-50 flex gap-4">
               <button 
                 onClick={handleDelete} disabled={deleteLoading}
                 className="flex-1 bg-red-600 text-white text-[11px] font-black py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg active:scale-95 shadow-red-100 uppercase tracking-widest"
               >
                 {deleteLoading ? 'ARCHIVING...' : 'CONFIRM PURGE'}
               </button>
               <button 
                 onClick={closeDelete} disabled={deleteLoading}
                 className="flex-1 bg-white text-gray-400 text-[11px] font-black py-4 rounded-xl hover:bg-gray-100 transition-all border border-gray-200 uppercase tracking-widest"
               >
                 CANCEL
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Component Styling ── */}
      <style>{`
        @keyframes slide-in {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

export default EditDeleteCustomer;
