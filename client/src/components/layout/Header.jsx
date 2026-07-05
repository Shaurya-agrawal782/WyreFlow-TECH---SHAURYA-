import React, { useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/candidates':
        return 'Candidates Workspace';
      case '/candidates/new':
        return 'Create Candidate';
      case '/import':
        return 'CSV Bulk Import';
      default:
        if (location.pathname.startsWith('/candidates/')) {
          return 'Candidate Details';
        }
        return 'Recruitment Platform';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-slate-700 md:hidden focus:outline-none"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-xl font-bold font-headline text-slate-800">
          {getPageTitle()}
        </h2>
      </div>

      {/* Profile / Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 focus:outline-none"
        >
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">
              {user?.name || 'User'}
            </p>
            <p className="text-xs font-medium text-slate-400 capitalize">
              {user?.role || 'Guest'}
            </p>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-lg sm:block hidden">
            keyboard_arrow_down
          </span>
        </button>

        {dropdownOpen && (
          <>
            {/* Overlay to close */}
            <div
              onClick={() => setDropdownOpen(false)}
              className="fixed inset-0 z-30"
            ></div>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40">
              <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                <p className="text-sm font-semibold text-slate-700">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400 capitalize">
                  {user?.role}
                </p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm font-bold">logout</span>
                Log Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
