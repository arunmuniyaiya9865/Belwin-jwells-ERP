import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users, UserCheck, UserX, UserPlus,
  TrendingUp, TrendingDown, CalendarDays, Briefcase, Clock,
  ArrowRight, Shield
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const API = '';

const HRDashboard = () => {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const hrName = user.employee
    ? `${user.employee.firstName || ''} ${user.employee.lastName || ''}`.trim()
    : 'HR Manager';

  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    newJoiners: 0,
  });
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, empRes] = await Promise.all([
        api.get(`${API}/hr/dashboard-stats`, { headers }),
        api.get(`${API}/employees`, { headers }),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      setEmployees(empRes.data.slice(0, 5)); // Latest 5 for quick view
    } catch (err) {
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock weekly attendance data for the chart
  const weeklyData = [
    { name: 'Mon', present: Math.max(1, stats.totalEmployees - 3), target: stats.totalEmployees },
    { name: 'Tue', present: Math.max(1, stats.totalEmployees - 1), target: stats.totalEmployees },
    { name: 'Wed', present: Math.max(1, stats.totalEmployees - 4), target: stats.totalEmployees },
    { name: 'Thu', present: Math.max(1, stats.totalEmployees - 2), target: stats.totalEmployees },
    { name: 'Fri', present: stats.presentToday || Math.max(1, stats.totalEmployees - 2), target: stats.totalEmployees },
    { name: 'Sat', present: Math.max(1, Math.floor(stats.totalEmployees * 0.85)), target: stats.totalEmployees },
  ];

  const departmentData = [
    { name: 'Sales', value: 35 },
    { name: 'Operations', value: 25 },
    { name: 'Finance', value: 15 },
    { name: 'HR', value: 10 },
    { name: 'Admin', value: 15 },
  ];

  const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#d1fae5'];

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      trend: '+4.2%',
      up: true,
      subtitle: 'Active workforce',
      gradient: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: UserCheck,
      trend: stats.totalEmployees > 0 ? `${Math.round((stats.presentToday / stats.totalEmployees) * 100)}%` : '0%',
      up: true,
      subtitle: 'Attendance rate',
      gradient: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Absent Today',
      value: stats.absentToday,
      icon: UserX,
      trend: stats.totalEmployees > 0 ? `${Math.round((stats.absentToday / stats.totalEmployees) * 100)}%` : '0%',
      up: false,
      subtitle: 'Absenteeism',
      gradient: 'from-orange-500 to-amber-600',
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'New Joiners',
      value: stats.newJoiners,
      icon: UserPlus,
      trend: 'This month',
      up: true,
      subtitle: 'Recent additions',
      gradient: 'from-purple-500 to-violet-600',
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              HR Portal · {currentDate}
            </p>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {hrName}
          </h2>
          <p className="text-gray-500 mt-1">Here's your workforce overview for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
            <Clock size={14} className="text-green-600" />
            <span className="text-sm font-semibold text-gray-700">{currentTime}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-sm">
            <Shield size={14} className="text-white" />
            <span className="text-sm font-semibold text-white">HR Portal</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="relative bg-white border border-gray-100 rounded-2xl p-6 overflow-hidden group hover:shadow-lg hover:border-green-200 transition-all duration-300"
          >
            {/* Decorative gradient corner */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.gradient} opacity-5 rounded-bl-full`}></div>

            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${stat.iconBg} rounded-xl`}>
                <stat.icon size={22} className={stat.iconColor} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                stat.up ? 'text-green-700 bg-green-50' : 'text-orange-700 bg-orange-50'
              }`}>
                {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.trend}
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? (
                  <div className="w-12 h-8 bg-gray-100 rounded animate-pulse"></div>
                ) : stat.value}
              </h3>
              <p className="text-sm font-semibold text-gray-500">{stat.title}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Weekly Attendance</h3>
              <p className="text-sm text-gray-500">Present vs Target (Current Week)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-500">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="text-gray-500">Target</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                }}
              />
              <Line type="monotone" dataKey="target" stroke="#d1d5db" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="present" stroke="#16a34a" strokeWidth={3} dot={{ fill: '#16a34a', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Department Distribution</h3>
          <p className="text-sm text-gray-500 mb-4">Employee spread across departments</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                iconSize={8}
                iconType="circle"
                formatter={(value) => <span className="text-xs text-gray-600 font-medium">{value}</span>}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Employees */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Employees</h3>
            <p className="text-sm text-gray-500">Latest additions to the workforce</p>
          </div>
          <a
            href="/hr/employees"
            className="flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
          >
            View All <ArrowRight size={14} />
          </a>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                  <div className="w-20 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">No employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider pb-3 pl-4">Employee</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider pb-3">ID</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider pb-3">Designation</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider pb-3">Branch</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="border-b border-gray-50 hover:bg-green-50/30 transition-colors">
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                          {emp.photo ? (
                            <img src={emp.photo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            `${(emp.firstName || '')[0] || ''}${(emp.lastName || '')[0] || ''}`.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-gray-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-mono font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md">{emp.employeeId}</span>
                    </td>
                    <td className="py-3 text-sm text-gray-600 font-medium">{emp.designation}</td>
                    <td className="py-3 text-sm text-gray-600 font-medium">{emp.branch}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        emp.status === 'Active'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {emp.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Create Employee', icon: UserPlus, href: '/hr/employees/create', color: 'green' },
          { label: 'View Employees', icon: Users, href: '/hr/employees', color: 'blue' },
          { label: 'Mark Attendance', icon: CalendarDays, href: '/hr/attendance', color: 'purple' },
          { label: 'My Profile', icon: Briefcase, href: '/hr/profile', color: 'orange' },
        ].map((action, i) => (
          <a
            key={i}
            href={action.href}
            className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-green-200 transition-all duration-300"
          >
            <div className={`p-3 rounded-xl bg-${action.color}-50 group-hover:bg-${action.color}-100 transition-colors`}>
              <action.icon size={20} className={`text-${action.color}-600`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800 group-hover:text-green-700 transition-colors">{action.label}</p>
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-green-500 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default HRDashboard;
