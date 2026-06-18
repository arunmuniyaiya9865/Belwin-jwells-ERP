import React from 'react';
import { Users, UserCheck, UserX, CalendarOff, IndianRupee, Briefcase, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard = () => {
  // Mock Data
  const attendanceData = [
    { name: 'Mon', present: 145, target: 150 },
    { name: 'Tue', present: 148, target: 150 },
    { name: 'Wed', present: 142, target: 150 },
    { name: 'Thu', present: 149, target: 150 },
    { name: 'Fri', present: 140, target: 150 },
    { name: 'Sat', present: 135, target: 150 },
  ];

  const departmentData = [
    { name: 'Engineering', value: 65 },
    { name: 'Sales', value: 35 },
    { name: 'Marketing', value: 20 },
    { name: 'HR', value: 10 },
    { name: 'Finance', value: 20 },
  ];

  const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#d1fae5'];

  const stats = [
    { title: 'Total Employees', value: '150', icon: Users, trend: '+12.4%', up: true, subtitle: 'vs last month' },
    { title: 'Present Today', value: '145', icon: UserCheck, trend: '+3.1%', up: true, subtitle: '96% attendance' },
    { title: 'Absent Today', value: '3', icon: UserX, trend: '-2.5%', up: false, subtitle: '2% absenteeism' },
    { title: 'On Leave', value: '2', icon: CalendarOff, trend: '0%', up: true, subtitle: 'Planned leaves' },
    { title: 'Salary Expense', value: '₹ 45.2 L', icon: IndianRupee, trend: '+6.8%', up: true, subtitle: 'This month' },
    { title: 'Active Projects', value: '24', icon: Briefcase, trend: '+1.2%', up: true, subtitle: 'Across 5 depts' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <p className="text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1">Overview · {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <h2 className="text-3xl font-bold text-text-primary">Good morning, Employee</h2>
          <p className="text-text-secondary mt-1">Here's what's happening across your workforce today.</p>
        </div>

      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="p-5 bg-erp-card border border-erp-green-dark rounded-xl relative overflow-hidden group hover:border-erp-gold/50 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-erp-green-dark/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-erp-gold/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-erp-green-dark rounded-lg">
                <stat.icon className="w-5 h-5 text-erp-green" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.up ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-text-primary">{stat.value}</h3>
              <p className="text-xs text-text-secondary mt-2">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 p-6 bg-erp-card border border-erp-green-dark rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Attendance Analytics</h3>
              <p className="text-sm text-text-secondary">Present vs Target (Current Week)</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-erp-green"></span>
                <span className="text-text-secondary">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                <span className="text-text-secondary">Target</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} dx={-10} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#111827' }}
                />
                <Line type="monotone" dataKey="present" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="target" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="p-6 bg-erp-card border border-erp-green-dark rounded-xl">
          <h3 className="text-lg font-bold text-text-primary mb-2">Department Distribution</h3>
          <p className="text-sm text-text-secondary mb-6">Employee count by department</p>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#111827' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-text-primary">150</span>
              <span className="text-xs text-text-secondary">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-6 mt-4">
            {departmentData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-text-secondary">{entry.name}</span>
                <span className="text-text-primary font-medium ml-auto">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
