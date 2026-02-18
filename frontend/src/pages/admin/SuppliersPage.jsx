import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { getSuppliers, updateSupplierStatus } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Suppliers Page
 * Shows all suppliers with approve/suspend workflow
 */

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const SuppliersPage = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await getSuppliers(params);
      setSuppliers(res.data?.suppliers || []);
      setPagination(res.data?.pagination || null);
    } catch {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSuppliers();
  };

  const handleStatusChange = async (id, isActive) => {
    try {
      const res = await updateSupplierStatus(id, isActive);
      toast.success(res.message);
      fetchSuppliers();
    } catch {
      toast.error('Failed to update supplier');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Supplier',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{row.name}</p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      )
    },
    {
      key: 'businessName',
      label: 'Business Name',
      render: (row) => <span className="text-sm text-gray-600">{row.businessName || '—'}</span>
    },
    {
      key: 'businessLicense',
      label: 'License',
      render: (row) => <span className="text-sm text-gray-600">{row.businessLicense || '—'}</span>
    },
    {
      key: 'productsCount',
      label: 'Products',
      render: (row) => (
        <span className="text-sm font-semibold text-gray-800">{row.productsCount}</span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <StatusBadge status={row.isActive ? 'approved' : 'suspended'} />
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (row) => <span className="text-sm text-gray-500">{formatDate(row.createdAt)}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/users/${row._id}`)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            View
          </button>
          {row.isActive ? (
            <button
              onClick={() => handleStatusChange(row._id, false)}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
            >
              <XCircleIcon className="w-3.5 h-3.5" />
              Suspend
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange(row._id, true)}
              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
            >
              <CheckCircleIcon className="w-3.5 h-3.5" />
              Approve
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, business..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              Search
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Approved</option>
            <option value="inactive">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={suppliers}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        emptyMessage="No suppliers found"
      />
    </div>
  );
};

export default SuppliersPage;
