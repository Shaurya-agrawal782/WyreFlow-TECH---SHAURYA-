import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useContext(AuthContext);

  const links = [
    { to: '/', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'recruiter', 'employer', 'job_seeker'] },
    { to: '/candidates', label: 'Candidates', icon: 'group', roles: ['admin', 'recruiter'] },
    { to: '/import', label: 'CSV Import', icon: 'upload_file', roles: ['admin'] },
  ];

  const filteredLinks = links.filter(link => !link.roles || (user && link.roles.includes(user.role)));

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 z-50 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Header / Brand */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-white text-base flex-shrink-0">
            W
          </div>
          {isOpen && (
            <span className="font-headline font-bold text-white text-lg truncate">
              WyreFlow Tech
            </span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white focus:outline-none hidden md:block"
        >
          <span className="material-symbols-outlined">
            {isOpen ? 'menu_open' : 'menu'}
          </span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-1">
        {filteredLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            {isOpen && <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
