import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Users, Search, Plus, Eye, Edit, Trash2, Key,
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Download, ChevronDown,
  UserCheck, UserPlus, Building2, RefreshCw
} from 'lucide-react';
import EmployeeView from './EmployeeView';

// Unified UI Components
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SearchBox from '../../components/ui/SearchBox';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', branch: '', department: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Mock stats for demo
  const stats = [
    { label: 'Total Employees', value: '124', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Employees', value: '118', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'New This Month', value: '6', icon: UserPlus, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Departments', value: '5', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, search, filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/employees', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search,
          status: filters.status,
          branch: filters.branch,
          department: filters.department,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      // Handle both paginated response and direct array response
      setEmployees(Array.isArray(response.data) ? response.data : response.data.employees || []);
      setPagination((prev) => ({ ...prev, totalPages: response.data.totalPages || 1 }));
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch('/employees/toggle-status/${id}', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee? This action is a soft delete.')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete('/employees/${id}', {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
    } catch {
      alert('Failed to delete employee');
    }
  };

  const exportCSV = () => {
    const headers = ['Employee ID', 'First Name', 'Last Name', 'Mobile', 'Designation', 'Role', 'Status', 'Created'];
    const rows = employees.map((e) => [
      e.employeeId, e.firstName, e.lastName, e.mobile, e.designation, e.role, e.status,
      new Date(e.createdAt).toLocaleDateString('en-GB'),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'employees.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // Mobile card renderer
  const renderEmployeeCards = () => {
    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
    if (employees.length === 0) return <div className="p-10 text-center text-gray-500">No employees found.</div>;
    return (
      <div className="flex flex-col gap-3 p-3">
        {employees.map((emp) => {
          const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();
          return (
            <div
              key={emp._id}
              onClick={() => setSelectedEmployeeId(emp._id)}
              className={`rounded-xl p-4 cursor-pointer transition-all duration-200 border ${
                selectedEmployeeId === emp._id ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center font-bold text-sm text-green-600 border-2 border-gray-200 overflow-hidden ${emp.photo ? 'bg-transparent' : 'bg-green-50'}`}>
                  {emp.photo ? <img src={emp.photo} alt="" className="w-full h-full object-cover" /> : initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-gray-900 truncate">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="flex gap-2 items-center mt-0.5 flex-wrap">
                    <span className="text-[11px] text-green-600 font-mono font-bold">{emp.employeeId}</span>
                    <span className="text-[11px] text-gray-500">{emp.role}</span>
                  </div>
                </div>
                <Badge variant={emp.status === 'Active' ? 'success' : 'danger'}>
                  {emp.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
                <div><span className="font-semibold">Branch: </span><span className="text-gray-900">{emp.branch || '—'}</span></div>
                <div><span className="font-semibold">Phone: </span><span className="text-gray-900">{emp.mobile || '—'}</span></div>
                <div className="col-span-2"><span className="font-semibold">Designation: </span><span className="text-gray-900">{emp.designation || '—'}</span></div>
              </div>
              <div className="flex gap-1.5 justify-end">
                {[
                  { title: 'View', icon: Eye, color: 'text-indigo-500', bg: 'bg-indigo-50 hover:bg-indigo-100', onClick: () => setSelectedEmployeeId(emp._id) },
                  { title: 'Edit', icon: Edit, color: 'text-blue-500', bg: 'bg-blue-50 hover:bg-blue-100', onClick: () => navigate(`/admin/employees/edit/${emp._id}`) },
                  { title: 'Delete', icon: Trash2, color: 'text-red-500', bg: 'bg-red-50 hover:bg-red-100', onClick: () => handleDelete(emp._id) },
                ].map(({ title, icon: Icon, color, bg, onClick }) => (
                  <button
                    key={title}
                    title={title}
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    className={`px-3 py-1.5 border-none rounded-lg ${color} ${bg} cursor-pointer text-xs font-semibold flex items-center gap-1 transition-colors`}
                  >
                    <Icon size={13} /> {title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const headerActions = (
    <>
      <Button
        variant="secondary"
        onClick={exportCSV}
        icon={Download}
      >
        <span className="hidden sm:inline">Export CSV</span>
      </Button>
      <Button
        variant="primary"
        onClick={() => navigate('/admin/employees/create')}
        icon={Plus}
      >
        <span>Add Employee</span>
      </Button>
    </>
  );

  return (
    <div className="flex gap-5 max-w-7xl mx-auto items-start p-6 bg-gray-50 rounded-2xl border border-gray-200">
      <div className={`transition-all duration-300 ease-in-out min-w-0 w-full ${selectedEmployeeId ? 'flex-[0_0_55%]' : 'flex-1'}`}>
        {/* Page Header */}
        <PageHeader
          title="Employee Management"
          subtitle="Manage your workforce across all branches"
          actions={headerActions}
        />

        {/* ROW 1 — 4 Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {stats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              iconBg={s.bg}
              iconColor={s.color}
            />
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-4 bg-white p-3.5 rounded-2xl border border-gray-200 items-center shadow-sm">
          <div className="w-full md:flex-1">
            <SearchBox
              placeholder="Search by name, ID or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-none"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              containerClassName="min-w-[130px] flex-1"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>

            <Select
              value={filters.branch}
              onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}
              containerClassName="min-w-[130px] flex-1"
            >
              <option value="">All Branches</option>
              <option value="HEADOFFICE">Head Office</option>
              <option value="BRANCH01">Branch 01</option>
            </Select>

            <Select
              value={filters.department}
              onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
              containerClassName="min-w-[130px] flex-1"
            >
              <option value="">All Departments</option>
              <option value="SALES">Sales</option>
              <option value="COLLECTION">Collection</option>
              <option value="ADMIN">Admin</option>
            </Select>

            <button
              onClick={() => { setSearch(''); setFilters({ status: '', branch: '', department: '' }); }}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-green-600 hover:bg-green-50 hover:border-green-200 transition-all cursor-pointer shrink-0 h-[42px] flex items-center justify-center"
              title="Reset Filters"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Data Table / Card View */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {isMobile ? renderEmployeeCards() : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Photo</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee ID</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Name & Role</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Branch</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Designation</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="8" className="p-16 text-center text-gray-500 text-sm">Loading workforce data...</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan="8" className="p-16 text-center text-gray-500 text-sm">No employees found matching criteria.</td></tr>
                ) : (
                  employees.map((emp) => {
                    const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();
                    return (
                      <tr
                        key={emp._id}
                        className={`transition-colors cursor-pointer hover:bg-green-50/50 ${selectedEmployeeId === emp._id ? 'bg-green-50/50' : ''}`}
                        onClick={() => setSelectedEmployeeId(emp._id)}
                      >
                        <td className="px-4 py-3">
                          <div className={`w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-green-600 border border-gray-200 ${emp.photo ? 'bg-transparent' : 'bg-gray-100'}`}>
                            {emp.photo
                              ? <img src={emp.photo} alt="" className="w-full h-full object-cover" />
                              : initials}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-green-600 font-mono text-xs">
                          {emp.employeeId || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900 text-sm">{emp.firstName} {emp.lastName}</div>
                          <div className="text-[11px] text-gray-500">{emp.role}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{emp.branch || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{emp.mobile}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-gray-900">{emp.designation || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={emp.status === 'Active' ? 'success' : 'danger'}>
                            {emp.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            {[
                              { title: 'View', icon: Eye, color: 'text-indigo-500 hover:text-indigo-600', bg: 'hover:bg-indigo-50', onClick: () => setSelectedEmployeeId(emp._id) },
                              { title: 'Edit', icon: Edit, color: 'text-blue-500 hover:text-blue-600', bg: 'hover:bg-blue-50', onClick: () => navigate(`/admin/employees/edit/${emp._id}`) },
                              { title: 'Status', icon: emp.status === 'Active' ? XCircle : CheckCircle, color: emp.status === 'Active' ? 'text-orange-500 hover:text-orange-600' : 'text-green-500 hover:text-green-600', bg: emp.status === 'Active' ? 'hover:bg-orange-50' : 'hover:bg-green-50', onClick: () => handleToggleStatus(emp._id) },
                              { title: 'Reset', icon: Key, color: 'text-gray-500 hover:text-gray-700', bg: 'hover:bg-gray-100', onClick: () => navigate(`/admin/employees/reset-password/${emp._id}`) },
                              { title: 'Delete', icon: Trash2, color: 'text-red-500 hover:text-red-600', bg: 'hover:bg-red-50', onClick: () => handleDelete(emp._id) },
                            ].map(({ title, icon: Icon, color, bg, onClick }) => (
                              <button
                                key={title}
                                title={title}
                                onClick={(e) => { e.stopPropagation(); onClick(); }}
                                className={`p-1.5 border-none rounded-md bg-transparent cursor-pointer transition-all ${color} ${bg}`}
                              >
                                <Icon size={16} />
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          )}

          {/* Footer / Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          />
        </div>
      </div>

      {/* Right Panel: Employee Details */}
      {selectedEmployeeId && !isMobile && (
        <div className="flex-[0_0_42%] bg-white rounded-2xl border border-gray-200 p-5 sticky top-5 max-h-[calc(100vh-40px)] overflow-y-auto shadow-sm">
          <EmployeeView employeeId={selectedEmployeeId} onClose={() => setSelectedEmployeeId(null)} />
        </div>
      )}

      {/* Mobile Full-Screen Employee Detail Overlay */}
      {selectedEmployeeId && isMobile && (
        <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto p-4 animate-[slideUp_0.25s_ease]">
          <style>{`@keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-full p-4 overflow-y-auto relative">
            <EmployeeView employeeId={selectedEmployeeId} onClose={() => setSelectedEmployeeId(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
