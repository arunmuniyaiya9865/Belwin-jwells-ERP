import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
  ShieldCheck, Plus, Edit3, Trash2, Save, X, Users,
  CheckCircle2, Lock, Settings, Eye, RefreshCw, Search,
  UserCog, Check
} from 'lucide-react';

const API = '';
const getToken = () => localStorage.getItem('token');

// All possible permissions organized by module
const PERMISSION_MODULES = [
  {
    module: 'Employees',
    key: 'employees',
    color: '#4f46e5',
    bg: 'bg-indigo-50',
    permissions: ['view', 'add', 'edit', 'delete', 'export']
  },
  {
    module: 'Attendance',
    key: 'attendance',
    color: '#06b6d4',
    bg: 'bg-cyan-50',
    permissions: ['view', 'add', 'edit', 'delete', 'approve', 'export']
  },
  {
    module: 'Salary',
    key: 'salary',
    color: '#16a34a',
    bg: 'bg-green-50',
    permissions: ['view', 'generate', 'approve', 'export']
  },
  {
    module: 'Customers',
    key: 'customers',
    color: '#f59e0b',
    bg: 'bg-amber-50',
    permissions: ['view', 'add', 'edit', 'delete', 'export']
  },
  {
    module: 'Loans',
    key: 'loans',
    color: '#ef4444',
    bg: 'bg-red-50',
    permissions: ['view', 'add', 'edit', 'approve', 'delete', 'export']
  },
  {
    module: 'Finance',
    key: 'finance',
    color: '#8b5cf6',
    bg: 'bg-purple-50',
    permissions: ['view', 'add', 'edit', 'approve', 'export']
  },
  {
    module: 'Reports',
    key: 'reports',
    color: '#e11d48',
    bg: 'bg-rose-50',
    permissions: ['view', 'export']
  },
  {
    module: 'Settings',
    key: 'settings',
    color: '#6b7280',
    bg: 'bg-gray-50',
    permissions: ['view', 'edit']
  }
];

const ROLE_COLORS = [
  '#4f46e5', '#7c3aed', '#16a34a', '#d97706', '#dc2626',
  '#0891b2', '#9333ea', '#c2410c', '#0f766e', '#1d4ed8'
];

/* ====== ROLE FORM MODAL ====== */
function RoleFormModal({ role, onClose, onSaved }) {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [permissions, setPermissions] = useState(role?.permissions || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const togglePerm = (perm) => {
    setPermissions(p => p.includes(perm) ? p.filter(x => x !== perm) : [...p, perm]);
  };

  const toggleModule = (moduleKey, perms) => {
    const modulePerms = perms.map(p => `${moduleKey}:${p}`);
    const allSelected = modulePerms.every(p => permissions.includes(p));
    if (allSelected) {
      setPermissions(prev => prev.filter(p => !modulePerms.includes(p)));
    } else {
      setPermissions(prev => [...new Set([...prev, ...modulePerms])]);
    }
  };

  const selectAll = () => {
    const all = PERMISSION_MODULES.flatMap(m => m.permissions.map(p => `${m.key}:${p}`));
    setPermissions(all);
  };

  const clearAll = () => setPermissions([]);

  const handleSave = async () => {
    if (!name.trim()) { setError('Role name is required'); return; }
    setSaving(true);
    try {
      const headers = { 'x-auth-token': getToken() };
      if (role?._id) {
        await api.put(`${API}/roles/${role._id}`, { name, description, permissions }, { headers });
      } else {
        await api.post(`${API}/roles`, { name, description, permissions }, { headers });
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 z-[1000] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <ShieldCheck size={20} className="text-indigo-600" />
            </div>
            <div className="font-bold text-gray-900">{role ? 'Edit Role' : 'Create New Role'}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="p-3 mb-5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Role Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Branch Manager"
                disabled={role?.isSystem}
                className={`w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all ${role?.isSystem ? 'bg-gray-50' : 'bg-white'}`} />
              {role?.isSystem && <div className="text-[10px] text-gray-500 mt-1">System roles cannot be renamed</div>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief role description..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all" />
            </div>
          </div>

          {/* Permissions */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Lock size={15} className="text-indigo-600" /> Permissions
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px]">{permissions.length} selected</span>
              </div>
              <div className="flex gap-2">
                <button onClick={selectAll} className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors">Select All</button>
                <button onClick={clearAll} className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold transition-colors">Clear All</button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {PERMISSION_MODULES.map(({ module, key, color, bg, permissions: perms }) => {
                const modulePerms = perms.map(p => `${key}:${p}`);
                const selected = modulePerms.filter(p => permissions.includes(p));
                const allSelected = selected.length === modulePerms.length;
                const someSelected = selected.length > 0 && !allSelected;

                return (
                  <div key={key} className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer ${bg}`} onClick={() => toggleModule(key, perms)}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors`}
                           style={{ borderColor: color, backgroundColor: allSelected ? color : someSelected ? `${color}40` : 'transparent' }}>
                        {(allSelected || someSelected) && <Check size={12} color={allSelected ? '#fff' : color} />}
                      </div>
                      <span className="font-bold text-sm flex-1" style={{ color }}>{module}</span>
                      <span className="text-[11px] font-bold" style={{ color }}>{selected.length}/{perms.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 px-4 py-3 bg-gray-50">
                      {perms.map(p => {
                        const permKey = `${key}:${p}`;
                        const isSelected = permissions.includes(permKey);
                        return (
                          <button key={p} onClick={() => togglePerm(permKey)}
                            style={{
                              borderColor: isSelected ? color : '#e5e7eb',
                              backgroundColor: isSelected ? color : '#ffffff',
                              color: isSelected ? '#ffffff' : '#6b7280'
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold capitalize transition-colors">
                            {isSelected && <Check size={12} />} {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-none bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-70">
              <Save size={16} /> {saving ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== ASSIGN PERMISSIONS MODAL ====== */
function AssignModal({ employee, employees, roles, onClose, onSaved }) {
  const [selectedEmp, setSelectedEmp] = useState(employee?._id || '');
  const [role, setRole] = useState(employee?.role || '');
  const [permissions, setPermissions] = useState(employee?.permissions || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const applyRole = (roleName) => {
    setRole(roleName);
    const roleObj = roles.find(r => r.name === roleName);
    if (roleObj) {
      setPermissions(roleObj.permissions || []);
    }
  };

  const togglePerm = (perm) => {
    setPermissions(p => p.includes(perm) ? p.filter(x => x !== perm) : [...p, perm]);
  };

  const handleSave = async () => {
    if (!selectedEmp) { setError('Please select an employee'); return; }
    setSaving(true);
    try {
      await api.put(`${API}/roles/assign/${selectedEmp}`, { role, permissions }, { headers: { 'x-auth-token': getToken() } });
      onSaved();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to assign');
    } finally {
      setSaving(false);
    }
  };

  const empObj = employees.find(e => e._id === selectedEmp);

  return (
    <div className="fixed inset-0 bg-gray-900/80 z-[1000] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <UserCog size={20} className="text-indigo-600" />
            </div>
            <div className="font-bold text-gray-900">Assign Role & Permissions</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="p-3 mb-5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Employee *</label>
              <select value={selectedEmp} onChange={e => { setSelectedEmp(e.target.value); const emp = employees.find(x => x._id === e.target.value); if (emp) { setRole(emp.role || ''); setPermissions(emp.permissions || []); } }}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all">
                <option value="">Select employee...</option>
                {employees.filter(e => e.role !== 'Super Admin').map(e => (
                  <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Assign Role</label>
              <select value={role} onChange={e => applyRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all">
                <option value="">Select role (auto-fill permissions)...</option>
                {roles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
              </select>
              <div className="text-[10px] text-gray-500 mt-1">Selecting a role auto-fills permissions below</div>
            </div>
          </div>

          {/* Employee preview */}
          {empObj && (
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">{empObj.firstName?.[0]}{empObj.lastName?.[0]}</span>
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900">{empObj.firstName} {empObj.lastName}</div>
                <div className="text-xs text-gray-500">{empObj.designation} · Current role: <strong className="text-indigo-600">{empObj.role}</strong></div>
              </div>
              <div className="ml-auto text-xs text-indigo-700 font-bold bg-indigo-100 px-2.5 py-1 rounded-lg">
                {permissions.length} permissions
              </div>
            </div>
          )}

          {/* Permissions Grid */}
          <div className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Lock size={15} className="text-indigo-600" /> Customize Permissions
          </div>

          <div className="flex flex-col gap-2 mb-6">
            {PERMISSION_MODULES.map(({ module, key, color, bg, permissions: perms }) => {
              const modulePerms = perms.map(p => `${key}:${p}`);
              const selectedCount = modulePerms.filter(p => permissions.includes(p)).length;

              return (
                <div key={key} className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-bold text-xs text-gray-900 flex-1">{module}</span>
                    <span className="text-[10px] font-bold text-gray-500">{selectedCount}/{perms.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-3 py-2">
                    {perms.map(p => {
                      const permKey = `${key}:${p}`;
                      const isSelected = permissions.includes(permKey);
                      return (
                        <button key={p} onClick={() => togglePerm(permKey)}
                          style={{
                            borderColor: isSelected ? color : '#e5e7eb',
                            backgroundColor: isSelected ? `${color}15` : '#ffffff',
                            color: isSelected ? color : '#9ca3af'
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-bold capitalize transition-colors">
                          {isSelected && <Check size={10} />} {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-none bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-70">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== MAIN PAGE ====== */
export default function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'employees'
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [assignEmployee, setAssignEmployee] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const headers = { 'x-auth-token': getToken() };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API}/roles`, { headers });
      setRoles(res.data.roles || []);
    } catch (e) {
      showToast('Failed to load roles', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    const res = await api.get(`${API}/employees`, { headers });
    setEmployees(res.data.employees || []);
  }, []);

  useEffect(() => { fetchRoles(); fetchEmployees(); }, [fetchRoles, fetchEmployees]);

  const deleteRole = async (id) => {
    if (!window.confirm('Delete this role?')) return;
    try {
      await api.delete(`${API}/roles/${id}`, { headers });
      fetchRoles();
      showToast('Role deleted');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed', 'error');
    }
  };

  const seedRoles = async () => {
    setSeeding(true);
    try {
      await api.post(`${API}/roles/seed`, {}, { headers });
      fetchRoles();
      showToast('Default roles seeded');
    } catch (e) {
      showToast('Seed failed', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const filteredEmployees = employees.filter(e => {
    const name = `${e.firstName} ${e.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) || e.employeeId?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 max-w-[1440px] mx-auto pb-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-white text-sm font-bold animate-[slideUp_0.2s_ease] ${
          toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {showRoleForm && (
        <RoleFormModal
          role={editRole}
          onClose={() => { setShowRoleForm(false); setEditRole(null); }}
          onSaved={() => { fetchRoles(); showToast(editRole ? 'Role updated' : 'Role created'); }}
        />
      )}

      {showAssign && (
        <AssignModal
          employee={assignEmployee}
          employees={employees}
          roles={roles}
          onClose={() => { setShowAssign(false); setAssignEmployee(null); }}
          onSaved={() => { fetchEmployees(); showToast('Permissions updated'); }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 px-6 pt-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 m-0">Roles & Permissions</h1>
          </div>
          <p className="text-xs text-gray-500 m-0 ml-12">Manage access control and employee permissions</p>
        </div>

        <div className="flex items-center gap-3">
          {roles.length === 0 && (
            <button onClick={seedRoles} disabled={seeding}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-500 bg-amber-50 text-amber-600 hover:bg-amber-100 text-sm font-bold transition-colors">
              {seeding ? 'Seeding...' : '🌱 Seed Default Roles'}
            </button>
          )}
          <button onClick={() => { setShowAssign(true); setAssignEmployee(null); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-bold transition-colors">
            <UserCog size={16} /> Assign Permissions
          </button>
          <button onClick={() => { setEditRole(null); setShowRoleForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-none bg-green-600 hover:bg-green-700 text-white text-sm font-bold cursor-pointer transition-colors shadow-sm">
            <Plus size={16} /> New Role
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 mb-6 mx-6 w-fit shadow-sm">
        {[['roles', 'Roles', ShieldCheck], ['employees', 'Employee Permissions', UserCog]].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === key ? 'bg-green-600 text-white' : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ROLES TAB */}
      {activeTab === 'roles' && (
        <div className="px-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500 text-sm">Loading roles...</div>
          ) : roles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <ShieldCheck size={48} className="text-gray-300 mx-auto mb-4" />
              <div className="text-lg font-bold text-gray-900 mb-2">No roles created yet</div>
              <div className="text-sm text-gray-500 mb-6">Start by seeding default roles or create a custom one</div>
              <button onClick={seedRoles} className="px-6 py-2.5 rounded-xl border-none bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors shadow-sm">
                🌱 Seed Default Roles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {roles.map((role, i) => {
                const colorIdx = i % ROLE_COLORS.length;
                const color = ROLE_COLORS[colorIdx];
                return (
                  <div key={role._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    {/* Role Header */}
                    <div className="p-4 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
                          <ShieldCheck size={20} style={{ color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{role.name}</span>
                            {role.isSystem && (
                              <span className="px-1.5 py-0.5 rounded border border-gray-200 bg-gray-100 text-gray-500 text-[9px] font-bold tracking-wider">SYSTEM</span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{role.description || 'No description'}</div>
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => { setEditRole(role); setShowRoleForm(true); }}
                          className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-indigo-600 transition-colors shadow-sm">
                          <Edit3 size={12} />
                        </button>
                        {!role.isSystem && (
                          <button onClick={() => deleteRole(role._id)}
                            className="w-7 h-7 rounded-lg border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center text-red-500 transition-colors shadow-sm">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="p-4 flex-1">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {role.permissions.includes('*') ? 'Full Access' : `${role.permissions.length} permissions`}
                      </div>
                      {role.permissions.includes('*') ? (
                        <div className="px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold text-center">
                          ✦ Unrestricted Access to All Modules
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {role.permissions.slice(0, 8).map(p => (
                            <span key={p} className="px-2 py-1 rounded text-[10px] font-bold" style={{ backgroundColor: `${color}12`, color }}>
                              {p.replace(':', ' › ')}
                            </span>
                          ))}
                          {role.permissions.length > 8 && (
                            <span className="px-2 py-1 rounded bg-gray-100 text-gray-500 text-[10px] font-bold">
                              +{role.permissions.length - 8} more
                            </span>
                          )}
                          {role.permissions.length === 0 && (
                            <span className="text-gray-400 text-xs">No permissions assigned</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center mt-auto">
                      <span className="text-[11px] font-medium text-gray-500">
                        {employees.filter(e => e.role === role.name).length} employees
                      </span>
                      <button onClick={() => { setShowAssign(true); setAssignEmployee(null); }}
                        className="text-[11px] font-bold flex items-center gap-1.5 hover:underline" style={{ color }}>
                        <Users size={12} /> Assign to Employee
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* EMPLOYEES TAB */}
      {activeTab === 'employees' && (
        <div className="px-6">
          {/* Search */}
          <div className="flex mb-5">
            <div className="flex-1 max-w-sm flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-10 shadow-sm focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
              <Search size={15} className="text-gray-400" />
              <input placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)}
                className="border-none outline-none text-sm flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 w-full" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Employee', 'Role', 'Permissions', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map((emp, i) => {
                  const isAdmin = emp.role === 'Super Admin';
                  return (
                    <tr key={emp._id} className="transition-colors hover:bg-green-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-gray-200 ${emp?.photo ? 'bg-transparent' : isAdmin ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-green-50'}`}>
                            {emp.photo
                              ? <img src={emp.photo} alt="" className="w-full h-full rounded-full object-cover" />
                              : <span className={isAdmin ? 'text-white text-xs font-bold' : 'text-green-600 text-xs font-bold'}>{emp.firstName?.[0]}{emp.lastName?.[0]}</span>
                            }
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{emp.firstName} {emp.lastName}</div>
                            <div className="text-[11px] text-gray-500 font-medium">{emp.employeeId} · {emp.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isAdmin ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                          {emp.role || 'Employee'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <span className="text-xs font-bold text-indigo-600 flex items-center gap-1"><ShieldCheck size={14}/> Full Access</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {(emp.permissions || []).slice(0, 4).map(p => (
                              <span key={p} className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold">
                                {p.replace(':', ' › ')}
                              </span>
                            ))}
                            {(emp.permissions || []).length > 4 && (
                              <span className="px-2 py-0.5 rounded bg-green-50 border border-green-200 text-green-600 text-[10px] font-bold">
                                +{emp.permissions.length - 4}
                              </span>
                            )}
                            {(emp.permissions || []).length === 0 && (
                              <span className="text-xs text-gray-400">No permissions</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!isAdmin && (
                          <button onClick={() => { setAssignEmployee(emp); setShowAssign(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors shadow-sm">
                            <Edit3 size={14} /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Showing {filteredEmployees.length} employees</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
