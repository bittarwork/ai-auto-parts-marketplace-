import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  CubeIcon,
  TagIcon,
  ChartBarIcon,
  SparklesIcon,
  Cog6ToothIcon,
  XMarkIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

/**
 * Admin Sidebar Navigation
 * Premium dark sidebar with section groups, animated active indicator,
 * and user profile card at the bottom
 */

const navSections = [
  {
    label: 'Main',
    items: [
      { label: 'Overview',   path: '/admin',            icon: HomeIcon,               exact: true },
      { label: 'Orders',     path: '/admin/orders',     icon: ShoppingBagIcon },
      { label: 'Products',   path: '/admin/products',   icon: CubeIcon },
      { label: 'Categories', path: '/admin/categories', icon: TagIcon },
    ]
  },
  {
    label: 'People',
    items: [
      { label: 'Users',     path: '/admin/users',     icon: UsersIcon },
      { label: 'Suppliers', path: '/admin/suppliers', icon: BuildingStorefrontIcon },
    ]
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', path: '/admin/analytics', icon: ChartBarIcon },
      { label: 'AI & Chatbot', path: '/admin/ai',    icon: SparklesIcon },
    ]
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
    ]
  }
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'AD';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 flex flex-col
          bg-[#0f1117] border-r border-white/[0.06]
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* ── Logo ── */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldCheckIcon className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-none">AutoParts</p>
              <p className="text-gray-500 text-[10px] leading-none mt-0.5">Admin Console</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-hide">
          {navSections.map((section) => (
            <div key={section.label}>
              {/* Section label */}
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600 select-none">
                {section.label}
              </p>

              {/* Nav items */}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                       transition-all duration-150 group
                       ${isActive
                          ? 'bg-blue-600/15 text-blue-400'
                          : 'text-gray-400 hover:bg-white/[0.05] hover:text-gray-200'
                       }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active left bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-full" />
                        )}
                        <item.icon className={`w-4.5 h-4.5 flex-shrink-0 w-[18px] h-[18px] transition-colors
                          ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}
                        />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ── User Profile Card ── */}
        <div className="flex-shrink-0 p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate leading-none">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-gray-500 truncate mt-0.5">{user?.email || ''}</p>
            </div>
            {/* Online dot */}
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-sm shadow-emerald-400/50" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
