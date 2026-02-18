import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  CubeIcon,
  TagIcon,
  TruckIcon,
  ChartBarIcon,
  SparklesIcon,
  Cog6ToothIcon,
  XMarkIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

/**
 * Admin Sidebar Navigation
 * Dark sidebar with navigation links to all admin sections
 */

const navItems = [
  { label: 'Overview', path: '/admin', icon: HomeIcon, exact: true },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBagIcon },
  { label: 'Products', path: '/admin/products', icon: CubeIcon },
  { label: 'Categories', path: '/admin/categories', icon: TagIcon },
  { label: 'Users', path: '/admin/users', icon: UsersIcon },
  { label: 'Suppliers', path: '/admin/suppliers', icon: BuildingStorefrontIcon },
  { label: 'Analytics', path: '/admin/analytics', icon: ChartBarIcon },
  { label: 'AI & Chatbot', path: '/admin/ai', icon: SparklesIcon },
  { label: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-gray-900 transform transition-transform duration-300
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <TruckIcon className="w-7 h-7 text-blue-400" />
            <span className="text-white font-bold text-lg">Admin Panel</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: version */}
        <div className="absolute bottom-4 left-0 right-0 px-6">
          <p className="text-xs text-gray-600 text-center">Auto Parts Admin v1.0</p>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
