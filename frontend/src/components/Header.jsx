import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    navigate('/');
  };
  // Mobile menu states removed

  const menus = [
    {
      name: 'Info',
      items: [
        { name: 'Schemes', subItems: ['Search Scheme'] },
        { name: 'Auditor Report' },
        { name: 'Update Incentive' },
        { name: 'Weight Machine' },
        { name: 'License' },
        { name: 'Advance Details' }
      ]
    },
    {
      name: 'Customer',
      items: [
        { name: 'New Customer' },
        { name: 'Edit/Delete Customer' },
        { name: 'Customer Approval Pending' },
        { name: 'Aadhar Verification' },
        { name: 'Customer Ledger' }
      ]
    },
    {
      name: 'Loan',
      items: [
        { name: 'Provide Loan' },
        { name: 'Edit Loan' },
        { name: 'Customer History' },
        { name: 'Loan Closure' },
        { name: 'Repledging & Change Status' },
        { name: 'Top up Loan' }
      ]
    },
    {
      name: 'Payment',
      items: [{ name: 'Receive Payment' }, { name: 'Payment History' }]
    },
    {
      name: 'Report',
      items: [
        { name: 'Daily Summary Report' },
        { name: 'Today Collection report' },
        { name: 'Loan Report' },
        { name: 'Loan Outstanding Report' },
        { name: 'Interest Pending report' },
        { name: 'Datewise pending list' },
        { name: 'Closed Account report' },
        { name: 'Repledge report' },
        { name: 'Auction account' },
        { name: 'Account Summary report' },
        { name: 'Cash Assets report' },
        { name: 'Business report' }
      ]
    },
    {
      name: 'Expenses',
      items: [{ name: 'Add Expense' }, { name: 'Edit Expense' }, { name: 'Expense Report' }]
    },
    {
      name: 'Income',
      items: [{ name: 'Add Income' }, { name: 'Edit Income' }, { name: 'Income Report' }, { name: 'Add Denomination' }]
    },
    {
      name: 'Customer Call',
      items: [{ name: 'Followups' }, { name: 'Call Report' }]
    },
    {
      name: 'Remittance',
      items: [{ name: 'New Remittance' }, { name: 'Remittance History' }]
    },
    {
      name: 'Gold Stock',
      items: [{ name: 'Send Request' }, { name: 'Gold Stock Report' }]
    }
  ];

  // Mobile nav handlers removed

  return (
    <>
      {/* Google Font: Jost */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap');
        .jewel-header * { font-family: 'Jost', sans-serif; }
        .jewel-nav-item:hover .jewel-dropdown-wrapper { display: block; }
      `}</style>

      <header className="jewel-header sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 print:hidden">
        <div className="max-w-screen-2xl mx-auto px-6 flex items-center justify-between h-[72px]">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-base"
              style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}>
              BG
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-700 font-bold" style={{ color: '#14532d' }}>Belwin Groups</span>
              <span className="text-xs font-medium tracking-wide" style={{ color: '#16a34a' }}>Jewellery ERP</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-1">
            {menus.map((menu) => (
              <div key={menu.name} className="jewel-nav-item relative group">
                <button
                  className="flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 text-gray-700"
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#16a34a';
                    e.currentTarget.style.background = '#f0fdf4';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {menu.name}
                </button>

                {/* Dropdown Wrapper (Uses Padding to bridge the gap so hover isn't lost) */}
                <div className="jewel-dropdown-wrapper absolute left-0 top-full hidden pt-1 z-50">
                  <div className="flex flex-col bg-white border border-gray-100 rounded-xl shadow-xl min-w-[220px] overflow-hidden">
                    {/* Green accent bar on top */}
                    <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #16a34a, #14532d)' }}></div>
                    {menu.items.map((item, index) => (
                      <NavLink
                        key={index}
                        to={`/${item.name.toLowerCase().replace(/[\s/&]+/g, '-')}`}
                        className="px-5 py-3 text-sm font-medium text-gray-600 border-b border-gray-50 transition-all duration-150 hover:pl-7 hover:text-green-600 hover:bg-green-50"
                        style={{ borderBottom: index < menu.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-2"></div>

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full bg-green-100 border-2 border-green-600 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-green-400 transition-all focus:outline-none shadow-sm"
              >
                <img src="https://i.pravatar.cc/150?img=11" alt="Employee Profile" className="w-full h-full object-cover" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 transform origin-top-right transition-all">
                  {/* Profile Header section */}
                  <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white border-4 border-green-300 overflow-hidden mb-3 shadow-md">
                      <img src="https://i.pravatar.cc/150?img=11" alt="Employee Profile" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-white font-bold text-lg">Dinesh Kumar</h3>
                    <p className="text-green-100 text-sm font-medium">EMP ID: BWN-0452</p>
                  </div>
                  
                  {/* Profile Info Details */}
                  <div className="p-5 flex flex-col gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phone Number</span>
                      <span className="text-sm text-gray-800 font-medium">+91 98765 43210</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Address</span>
                      <span className="text-sm text-gray-800 font-medium">12/4, Main Road, Pudukkottai, Tamil Nadu 622001</span>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <div className="px-5 pb-5">
                    <button 
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors border border-red-200 shadow-sm"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>

        </div>
      </header>
    </>
  );
};

export default Header;

