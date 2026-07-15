import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Handshake, Wallet, UserCheck, Package, BookOpen,
  TrendingUp, TrendingDown, ArrowRight, RefreshCw,
  Eye, Clock, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

// ── Sparkline SVG ──────────────────────────────────────────────────────────────
const Sparkline = ({ data, color = '#16a34a', up = true }) => {
  const w = 80, h = 36, pad = 4;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  const area = `M${pts.split(' ')[0]} L${pts.split(' ').slice(1).join(' L')} L${w - pad},${h} L${pad},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── Bar Chart SVG ──────────────────────────────────────────────────────────────
const BarChart = ({ data, activeIdx }) => {
  const w = 320, h = 140, pad = 10;
  const colW = (w - pad * 2) / data.length;
  const maxV = Math.max(...data.map((d) => d.value));
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h + 28}`} className="overflow-visible">
      {data.map((d, i) => {
        const barH = Math.max(4, ((d.value / maxV) * h) * 0.88);
        const x = pad + i * colW + colW * 0.18;
        const y = h - barH;
        const isActive = i === activeIdx;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={colW * 0.64} height={barH}
              rx="4"
              fill={isActive ? '#16a34a' : 'rgba(22,163,74,0.18)'}
            />
            <text x={x + colW * 0.32} y={h + 16} textAnchor="middle"
              className={`text-[10px] ${isActive ? 'fill-green-600 font-bold' : 'fill-green-700/70'}`}>
              {d.label}
            </text>
            {isActive && (
              <text x={x + colW * 0.32} y={y - 6} textAnchor="middle"
                className="text-[9px] fill-green-600 font-bold">
                ₹{d.value}K
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ── Gold Rate Line Chart ───────────────────────────────────────────────────────
const LineChart = ({ data, color = '#16a34a' }) => {
  const w = 220, h = 60, pad = 6;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  const areaPath = `M${pts.split(' ')[0]} L${pts.split(' ').slice(1).join(' L')} L${w - pad},${h} L${pad},${h} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="line-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#line-gold)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx={pts.split(' ').at(-1).split(',')[0]} cy={pts.split(' ').at(-1).split(',')[1]} r="3" fill={color} />
    </svg>
  );
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, trend, up, icon: Icon, iconBg, sparkData, sparkColor, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-gray-200 p-5 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'shadow-sm'}`}
  >
    <div className="flex justify-between items-start mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={20} className={sparkColor} strokeWidth={2} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${up ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
        {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {trend}
      </div>
    </div>
    <div className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-none">{value}</div>
    <div className="text-sm text-gray-500 mt-1 mb-2">{label}</div>
    {sparkData && <Sparkline data={sparkData} color={up ? '#16a34a' : '#ef4444'} up={up} />}
  </div>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const map = {
    'Pending':   { bg: 'bg-amber-50',  text: 'text-amber-600', border: 'border-amber-200', label: 'Pending' },
    'Approved':  { bg: 'bg-green-50',  text: 'text-green-600', border: 'border-green-200', label: 'Approved' },
    'In Review': { bg: 'bg-blue-50',   text: 'text-blue-600',  border: 'border-blue-200', label: 'In Review' },
    'Rejected':  { bg: 'bg-red-50',    text: 'text-red-600',   border: 'border-red-200', label: 'Rejected' },
  };
  const s = map[status] || map['Pending'];
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
};

// ── Activity Icon ─────────────────────────────────────────────────────────────
const ActivityIcon = ({ type }) => {
  const map = {
    new_loan: { icon: Handshake,    bg: 'bg-blue-50',  color: 'text-blue-500' },
    payment:  { icon: CheckCircle2, bg: 'bg-green-50',   color: 'text-green-500' },
    overdue:  { icon: AlertCircle,  bg: 'bg-amber-50', color: 'text-amber-500' },
    closure:  { icon: XCircle,      bg: 'bg-red-50',   color: 'text-red-500' },
    employee: { icon: UserCheck,    bg: 'bg-purple-50',  color: 'text-purple-500' },
    scheme:   { icon: BookOpen,     bg: 'bg-green-50',  color: 'text-green-600' },
  };
  const s = map[type] || map.payment;
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}>
      <s.icon size={16} className={s.color} />
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState('Week');
  const [loadingStats, setLoadingStats] = useState(false);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const kpis = [
    { label: 'Total Customers', value: '12,450', sub: 'Registered clients', trend: '+12%', up: true, icon: Users, iconBg: 'bg-indigo-50', sparkColor: 'text-indigo-500', sparkData: [80, 95, 88, 110, 105, 130, 125] },
    { label: 'Active Gold Loans', value: '3,210', sub: 'Ongoing loans', trend: '+8%', up: true, icon: Handshake, iconBg: 'bg-green-50', sparkColor: 'text-green-600', sparkData: [200, 240, 220, 280, 260, 310, 320], path: '/admin/loans' },
    { label: "Today's Collection", value: '₹45,200', sub: 'Cash received today', trend: '+5%', up: true, icon: Wallet, iconBg: 'bg-green-50', sparkColor: 'text-green-500', sparkData: [300, 280, 350, 320, 400, 380, 450] },
    { label: 'Total Employees', value: '124', sub: 'Active staff members', trend: '+2%', up: true, icon: UserCheck, iconBg: 'bg-blue-50', sparkColor: 'text-blue-500', sparkData: [110, 112, 115, 118, 120, 122, 124], path: '/admin/employees' },
    { label: 'Inventory Value', value: '₹8.2M', sub: 'Current stock value', trend: '-1%', up: false, icon: Package, iconBg: 'bg-amber-50', sparkColor: 'text-amber-500', sparkData: [85, 88, 84, 82, 86, 80, 82] },
    { label: 'Active Schemes', value: '1,150', sub: 'Ongoing scheme members', trend: '+15%', up: true, icon: BookOpen, iconBg: 'bg-purple-50', sparkColor: 'text-purple-500', sparkData: [900, 950, 980, 1000, 1050, 1100, 1150] },
  ];

  const chartData = {
    Week: [
      { label: 'Mon', value: 32 }, { label: 'Tue', value: 45 }, { label: 'Wed', value: 38 },
      { label: 'Thu', value: 52 }, { label: 'Fri', value: 41 }, { label: 'Sat', value: 58 },
      { label: 'Sun', value: 65 },
    ],
    Today: [
      { label: '9AM', value: 12 }, { label: '10AM', value: 28 }, { label: '11AM', value: 35 },
      { label: '12PM', value: 20 }, { label: '1PM', value: 42 }, { label: '2PM', value: 38 },
      { label: '3PM', value: 45 },
    ],
    Month: [
      { label: 'W1', value: 220 }, { label: 'W2', value: 185 }, { label: 'W3', value: 260 },
      { label: 'W4', value: 310 },
    ],
    Year: [
      { label: 'Q1', value: 820 }, { label: 'Q2', value: 960 }, { label: 'Q3', value: 880 }, { label: 'Q4', value: 1100 },
    ],
  };

  const goldRateData = [5680, 5720, 5700, 5760, 5740, 5800, 5820];

  const summary = [
    { label: 'New Customers', value: '12', color: 'text-gray-900' },
    { label: 'New Loans', value: '08', color: 'text-gray-900' },
    { label: 'Loan Closures', value: '05', color: 'text-red-600' },
    { label: 'Scheme Collections', value: '₹12,400', color: 'text-gray-900' },
    { label: 'Total Transactions', value: '45', color: 'text-green-600' },
  ];

  const loanTable = [
    { id: 'GL-2025-1042', customer: 'Ravi Shankar', branch: 'Head Office', weight: '24.5g', amount: '₹1,42,100', status: 'Pending' },
    { id: 'GL-2025-1041', customer: 'Meena Kumari', branch: 'Branch 01', weight: '18.2g', amount: '₹1,05,560', status: 'Approved' },
    { id: 'GL-2025-1040', customer: 'Suresh Babu', branch: 'Head Office', weight: '32.0g', amount: '₹1,85,600', status: 'In Review' },
    { id: 'GL-2025-1039', customer: 'Anitha Devi', branch: 'Branch 01', weight: '15.8g', amount: '₹91,640', status: 'Approved' },
    { id: 'GL-2025-1038', customer: 'Gopal Rao', branch: 'Head Office', weight: '8.5g', amount: '₹49,300', status: 'Rejected' },
  ];

  const activities = [
    { type: 'new_loan', msg: 'New gold loan application by Ravi Shankar', time: '2 min ago', meta: 'GL-2025-1042' },
    { type: 'payment', msg: 'EMI payment received from Meena Kumari', time: '12 min ago', meta: '₹8,400 credited' },
    { type: 'overdue', msg: 'Overdue alert: Suresh Babu — 3 EMIs pending', time: '28 min ago', meta: 'GL-2025-0982' },
    { type: 'closure', msg: 'Loan closed — Anitha Devi (GL-2025-0801)', time: '1 hr ago', meta: 'All dues cleared' },
    { type: 'employee', msg: 'New employee Kiran Kumar joined (EMP0124)', time: '2 hrs ago', meta: 'Sales · Branch 01' },
    { type: 'scheme', msg: 'Scheme instalment collected from 48 members', time: '3 hrs ago', meta: '₹96,000 total' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-8 space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">{today}</p>
        </div>
        <button
          onClick={() => setLoadingStats((l) => !l)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200"
        >
          <RefreshCw size={16} className={loadingStats ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ROW 1 — 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} onClick={k.path ? () => navigate(k.path) : null} />
        ))}
      </div>

      {/* ROW 2 — Bar Chart + Gold Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-start sm:items-center mb-6 flex-col sm:flex-row gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Loan Collection Analytics</h2>
              <p className="text-sm text-gray-500 mt-1">Income trend overview</p>
            </div>
            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
              {['Today', 'Week', 'Month', 'Year'].map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                    chartRange === r ? 'bg-white shadow-sm text-green-700 border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="px-2">
            <BarChart data={chartData[chartRange]} activeIdx={chartData[chartRange].length - 1} />
          </div>
          <div className="flex justify-between mt-6 pt-6 border-t border-gray-100">
            {[['Target', '₹3,50,000'], ['Achieved', '₹3,11,000'], ['Variance', '-₹39,000']].map(([k, v]) => (
              <div key={k}>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{k}</div>
                <div className={`text-base sm:text-lg font-bold mt-1 ${k === 'Variance' ? 'text-red-600' : 'text-gray-900'}`}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gold Rate */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Gold Rate Trend</h2>
              <p className="text-sm text-gray-500 mt-1">Live market price</p>
            </div>
            <div className="px-2.5 py-1 bg-green-50 rounded-full text-[10px] font-bold text-green-600 border border-green-100">
              LIVE
            </div>
          </div>
          <div className="mb-5">
            <div className="text-3xl font-black text-green-600 tracking-tight">₹5,820</div>
            <div className="text-sm text-gray-500 font-medium">per gram · 22 Karat</div>
          </div>
          <div className="mb-6">
            <LineChart data={goldRateData} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['22K', '₹5,820', 'text-green-600'], ['24K', '₹6,350', 'text-gray-900'], ['Yesterday', '₹5,800', 'text-gray-900']].map(([k, v, c]) => (
              <div key={k} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="text-[10px] text-gray-400 font-bold tracking-wider">{k}</div>
                <div className={`text-sm font-bold mt-1 ${c}`}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3 — Business Summary + Loan Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Business Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">
            Today's Summary
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          <div className="flex flex-col">
            {summary.map(({ label, value, color }, i) => (
              <div key={label} className={`flex justify-between items-center py-3.5 ${i < summary.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <span className="text-sm text-gray-500 font-medium">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/admin/reports')}
            className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all duration-200"
          >
            View Full Report <ArrowRight size={16} />
          </button>
        </div>

        {/* Recent Loan Applications */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Loan Applications</h2>
              <p className="text-sm text-gray-500 mt-1">Latest submissions requiring attention</p>
            </div>
            <button
              onClick={() => navigate('/admin/loans')}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all duration-200"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold tracking-wider">
                <tr>
                  {['Loan ID', 'Customer', 'Branch', 'Gold Weight', 'Amount', 'Status', 'Action'].map((h) => (
                    <th key={h} className={`px-4 py-3 ${h === 'Action' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loanTable.map((row) => (
                  <tr key={row.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-green-600">{row.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{row.customer}</td>
                    <td className="px-4 py-3 text-gray-600">{row.branch}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{row.weight}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{row.amount}</td>
                    <td className="px-4 py-3"><Badge status={row.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate('/admin/loans')}
                        title="View / Edit Loan"
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors inline-flex"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ROW 4 — Activity Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent System Activity</h2>
            <p className="text-sm text-gray-500 mt-1">Live feed of operations across all branches</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full border border-green-100">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {activities.map((act, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 p-5 transition-colors hover:bg-green-50/30 ${i < 3 ? 'lg:border-b border-gray-100' : ''}`}
            >
              <ActivityIcon type={act.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug mb-1">{act.msg}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} /> {act.time}
                  </div>
                  <span className="text-xs font-bold text-green-600">{act.meta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
