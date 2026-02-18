import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

/**
 * Admin Layout
 * Full-height split: dark sidebar + light content area with frosted header
 */

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Right column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Sticky header */}
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
