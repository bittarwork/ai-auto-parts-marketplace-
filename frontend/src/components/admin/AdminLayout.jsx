import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

/**
 * Admin Layout
 * Wraps all admin pages with sidebar + top header
 */

// Map paths to readable titles
const pageTitles = {
  '/admin': 'Dashboard Overview',
  '/admin/orders': 'Order Management',
  '/admin/products': 'Product Management',
  '/admin/products/new': 'Add New Product',
  '/admin/categories': 'Category Management',
  '/admin/users': 'User Management',
  '/admin/suppliers': 'Supplier Management',
  '/admin/analytics': 'Analytics & Reports',
  '/admin/ai': 'AI & Chatbot Analytics',
  '/admin/settings': 'Settings',
};

const getTitle = (pathname) => {
  // Check exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Check for dynamic routes
  if (pathname.startsWith('/admin/orders/')) return 'Order Details';
  if (pathname.startsWith('/admin/users/')) return 'User Details';
  if (pathname.startsWith('/admin/suppliers/')) return 'Supplier Details';
  if (pathname.endsWith('/edit')) return 'Edit Product';

  return 'Admin Panel';
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader
          onMenuToggle={() => setSidebarOpen(true)}
          title={title}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
