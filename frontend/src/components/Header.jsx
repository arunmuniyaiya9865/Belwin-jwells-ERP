import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Header = () => {
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
        { name: 'Aadhar Verification' }
      ]
    },
    {
      name: 'Loan',
      items: [
        { name: 'Provide Loan' },
        { name: 'Edit Loan' },
        { name: 'Customer History' },
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
        { name: 'Loan Report' },
        { name: 'Today Collection Report' },
        { name: 'Closed Account Report' },
        { name: 'Auction Accounts' },
        { name: 'Daily Summary Report' },
        { name: 'Accounts Summary Report' },
        { name: 'Cash Assets Report' },
        { name: 'Interest Pending' },
        { name: 'Business Report' },
        { name: 'Repledge' },
        { name: 'Loan Outstanding Report' },
        { name: 'Datewise Pending List' }
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
      name: 'Calls',
      items: [{ name: 'Call Log' }, { name: 'Pending Calls' }]
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

  return (
    <>
      {/* Google Font: Jost */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap');
        .jewel-header * { font-family: 'Jost', sans-serif; }
        .jewel-nav-item:hover .jewel-dropdown { display: flex; }
      `}</style>

      <header className="jewel-header sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
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

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {menus.map((menu) => (
              <div key={menu.name} className="jewel-nav-item relative group">
                <button
                  className="flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200"
                  style={{ color: '#374151' }}
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

                {/* Dropdown */}
                <div className="jewel-dropdown absolute left-0 top-full hidden flex-col bg-white border border-gray-100 rounded-xl shadow-xl min-w-[220px] mt-1 overflow-hidden z-50">
                  {/* Green accent bar on top */}
                  <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #16a34a, #14532d)' }}></div>
                  {menu.items.map((item, index) => (
                    <NavLink
                      key={index}
                      to={`/${item.name.toLowerCase().replace(/[\s/&]+/g, '-')}`}
                      className="px-5 py-3 text-sm font-medium text-gray-600 border-b border-gray-50 transition-all duration-150 hover:pl-7"
                      style={{ borderBottom: index < menu.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = '#16a34a';
                        e.currentTarget.style.background = '#f0fdf4';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = '#4b5563';
                        e.currentTarget.style.background = 'white';
                      }}
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-2"></div>

            {/* Logout */}
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </nav>
        </div>

      </header>
    </>
  );
};

export default Header;
