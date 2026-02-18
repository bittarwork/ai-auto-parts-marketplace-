import { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

/**
 * Admin Top Header
 * Auto breadcrumb, search bar, notification bell, avatar dropdown
 */

// Build breadcrumbs from pathname
const buildBreadcrumbs = (pathname) => {
  const crumbs = [{ label: 'Dashboard', path: '/admin' }];
  const segments = pathname.replace('/admin', '').split('/').filter(Boolean);

  const labels = {
    orders:     'Orders',
    products:   'Products',
    categories: 'Categories',
    users:      'Users',
    suppliers:  'Suppliers',
    analytics:  'Analytics',
    ai:         'AI & Chatbot',
    settings:   'Settings',
    new:        'New Product',
    edit:       'Edit',
  };

  let currentPath = '/admin';
  segments.forEach((seg) => {
    currentPath += `/${seg}`;
    const label = labels[seg] || (seg.length === 24 ? '···' : seg);
    crumbs.push({ label, path: currentPath });
  });

  return crumbs;
};

const AdminHeader = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'AD';

  const breadcrumbs = buildBreadcrumbs(location.pathname);
  const isRoot = location.pathname === '/admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-200/80 flex items-center gap-3 px-4 lg:px-5 flex-shrink-0 sticky top-0 z-10">

      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm min-w-0 flex-1">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-gray-800 truncate">{crumb.label}</span>
            ) : (
              <NavLink
                to={crumb.path}
                className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 flex-shrink-0"
              >
                {i === 0 && <HomeIcon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{i > 0 ? crumb.label : ''}</span>
              </NavLink>
            )}
          </span>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-[11px] font-bold">{initials}</span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block group-hover:text-gray-900 transition-colors">
              {user?.name?.split(' ')[0] || 'Admin'}
            </span>
            <svg className="w-3 h-3 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden">

                {/* User info */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm font-bold">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                    Administrator
                  </div>
                </div>

                {/* Actions */}
                <div className="p-1.5">
                  <button
                    onClick={() => { navigate('/admin/settings'); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
                    Settings
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
