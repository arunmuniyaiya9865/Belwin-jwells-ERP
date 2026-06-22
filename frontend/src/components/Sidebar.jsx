import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, CalendarOff, IndianRupee, Building2, FileText, Settings, LogOut, PhoneCall, PhoneForwarded } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Employee', icon: Users, path: '/employees' },
    { name: 'Attendance', icon: UserCheck, path: '/attendance' },
    { name: 'Leave', icon: CalendarOff, path: '/leave' },
    { name: 'Payroll', icon: IndianRupee, path: '/payroll' },
    { name: 'Department', icon: Building2, path: '/departments' },
    { name: 'Reports', icon: FileText, path: '/reports' },
    { name: 'Add Followup', icon: PhoneCall, path: '/add-followup' },
    { name: 'Call Report', icon: PhoneForwarded, path: '/call-report' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex flex-col w-64 h-full bg-erp-dark border-r border-erp-green-dark">
      {/* Logo Area */}
      <div className="flex items-center justify-center h-20 border-b border-erp-green-dark">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-erp-gold-dark rounded-lg">
             {/* Simple icon representation */}
             <div className="w-4 h-4 bg-erp-dark rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-erp-gold">Belwin Groups ERP</h1>
            <p className="text-xs text-text-secondary">Employee Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-erp-gold border-l-4 border-erp-gold bg-erp-card' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-erp-card border-l-4 border-transparent'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-erp-green-dark">
        <button className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-red-500 hover:text-red-400 transition-colors w-full">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
