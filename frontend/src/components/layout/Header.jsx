import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, ChevronDown, Building2, Menu, X, Gem
} from 'lucide-react';
import UserProfile from './UserProfile';
import { ADMIN_NAV, EMPLOYEE_NAV, HR_NAV } from './navData';

const BRANCHES = ['Head Office', 'Branch 01', 'Branch 02'];

const Header = ({ isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [branch, setBranch] = useState('Head Office');
  const [branchOpen, setBranchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileOpenMenus, setMobileOpenMenus] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const branchRef = useRef(null);
  const dropdownTimer = useRef(null);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const role = user.role || 'employee';
  const isAdmin = role === 'admin' || role === 'Super Admin';
  const NAV = isAdmin ? ADMIN_NAV : EMPLOYEE_NAV;

  const isActive = (path) => location.pathname === path;
  const isParentActive = (item) =>
    item.children?.some((c) => location.pathname === c.path);

  useEffect(() => {
    const handler = (e) => {
      if (branchRef.current && !branchRef.current.contains(e.target)) setBranchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = (id) => {
    setMobileOpenMenus((p) => ({ ...p, [id]: !p[id] }));
  };

  const handleDropdownEnter = (id) => {
    clearTimeout(dropdownTimer.current);
    setOpenDropdown(id);
  };

  const handleDropdownLeave = () => {
    dropdownTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  return (
    <>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap');
        .topbar-header * { font-family: 'Jost', sans-serif; }
      `}</style>

      <header className="topbar-header sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 print:hidden">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
          {/* Top Row: Logo + Nav + Actions */}
          <div className="flex items-center justify-between h-[68px]">

            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base"
                style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}>
                <Gem size={20} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold text-[#14532d]">Belwin Groups</span>
                <span className="text-[10px] font-semibold tracking-wider text-green-600 uppercase">Jewellery ERP</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="flex items-center gap-0.5 ml-6">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = item.path ? isActive(item.path) : isParentActive(item);

                  if (item.path && !item.children) {
                    // Direct link (Dashboard)
                    return (
                      <button
                        key={item.id}
                        onClick={() => navTo(item.path)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                          active
                            ? 'text-green-700 bg-green-50'
                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50/60'
                        }`}
                      >
                        <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                        {item.label}
                      </button>
                    );
                  }

                  // Dropdown menu
                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => handleDropdownEnter(item.id)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <button
                        className={`flex items-center gap-1 px-3 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                          active || openDropdown === item.id
                            ? 'text-green-700 bg-green-50'
                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50/60'
                        }`}
                      >
                        {item.label}
                        {/* <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${openDropdown === item.id ? 'rotate-180 text-green-500' : ''}`} /> */}
                      </button>

                      {/* Dropdown */}
                      {openDropdown === item.id && (
                        <div className="absolute left-0 top-full pt-1 z-50">
                          <div className="flex flex-col bg-white border border-gray-100 rounded-xl shadow-xl min-w-[230px] overflow-hidden">
                            {/* Green accent bar */}
                            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #16a34a, #14532d)' }}></div>
                            <div className="py-1 max-h-[70vh] overflow-y-auto">
                              {item.children.map((child, idx) => {
                                const CIcon = child.icon;
                                const childActive = isActive(child.path);
                                return (
                                  <button
                                    key={child.path}
                                    onClick={() => { navTo(child.path); setOpenDropdown(null); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 cursor-pointer text-left ${
                                      childActive
                                        ? 'text-green-700 bg-green-50 font-semibold pl-5'
                                        : 'text-gray-600 hover:pl-5 hover:text-green-600 hover:bg-green-50/60 font-medium'
                                    } ${idx < item.children.length - 1 ? 'border-b border-gray-50' : ''}`}
                                  >
                                    <CIcon size={14} className={childActive ? 'text-green-600' : 'text-gray-400'} />
                                    {child.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            )}

            {/* Right side actions */}
            <div className="flex items-center gap-2 md:gap-3 ml-auto">

              {/* Desktop Search */}
              {/* {!isMobile && (
                <div className="relative group max-w-[200px] xl:max-w-[280px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all duration-200"
                  />
                </div>
              )} */}

              {/* Mobile search icon */}
              {isMobile && (
                <button
                  onClick={() => setSearchOpen(o => !o)}
                  className="p-1.5 border border-gray-200 text-gray-500 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Search size={16} />
                </button>
              )}

              {/* Branch Selector — desktop only */}
              {!isMobile && (
                <div ref={branchRef} className="relative">
                  <button
                    onClick={() => setBranchOpen((o) => !o)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      branchOpen
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <Building2 size={14} className={branchOpen ? 'text-green-600' : 'text-gray-400'} />
                    <span>{branch}</span>
                    <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${branchOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {branchOpen && (
                    <div className="absolute top-full right-0 mt-2 min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-green-600 to-green-800"></div>
                      <div className="p-1">
                        {BRANCHES.map((b) => (
                          <button
                            key={b}
                            onClick={() => { setBranch(b); setBranchOpen(false); }}
                            className={`w-full px-3 py-2 text-sm text-left rounded-lg transition-colors cursor-pointer ${
                              b === branch
                                ? 'bg-green-50 text-green-700 font-semibold'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notification Bell */}
              {/* <button className="relative p-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex-shrink-0 cursor-pointer">
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button> */}

              {/* Profile */}
              <UserProfile isMobile={isMobile} />

              {/* Mobile Hamburger */}
              {isMobile && (
                <button
                  onClick={() => setMobileMenuOpen(o => !o)}
                  className="p-1.5 text-green-600 rounded-lg hover:bg-green-50 transition-colors cursor-pointer"
                >
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile full-width search dropdown */}
        {isMobile && searchOpen && (
          <div className="bg-white border-b border-gray-200 p-3 shadow-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search employees, loans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Nav Dropdown */}
        {isMobile && mobileMenuOpen && (
          <div className="bg-white border-b border-gray-200 shadow-lg max-h-[75vh] overflow-y-auto">
            <div className="p-3 space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = item.path ? isActive(item.path) : isParentActive(item);
                const isOpen = mobileOpenMenus[item.id];

                if (item.path && !item.children) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => navTo(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                        active
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} className={active ? 'text-green-600' : 'text-gray-500'} />
                      {item.label}
                    </button>
                  );
                }

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => toggleMobileMenu(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                        active
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={active ? 'text-green-600' : 'text-gray-500'} />
                        {item.label}
                      </div>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="ml-6 pl-4 border-l-2 border-green-100 space-y-0.5 mt-1 mb-2">
                        {item.children.map((child) => {
                          const CIcon = child.icon;
                          const childActive = isActive(child.path);
                          return (
                            <button
                              key={child.path}
                              onClick={() => navTo(child.path)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer text-left ${
                                childActive
                                  ? 'text-green-600 bg-green-50/60 font-semibold'
                                  : 'text-gray-500 hover:text-green-600 hover:bg-green-50/30'
                              }`}
                            >
                              <CIcon size={14} className={childActive ? 'text-green-600' : 'text-gray-400'} />
                              {child.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
