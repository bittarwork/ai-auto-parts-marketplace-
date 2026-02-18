import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { getSuppliers, updateSupplierStatus } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Suppliers Page
 * Supplier list with approve / suspend workflow
 */

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const FilterChip = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`h-7 px-3 rounded-full text-xs font-medium border transition-all ${
    active ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
  }`}>
    {label}
  </button>
);

const SuppliersPage = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]               = useState(1);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search)       params.search = search;
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

  const handleStatus = async (id, isActive) => {
    try {
      const res = await updateSupplierStatus(id, isActive);
      toast.success(res.message);
      fetchSuppliers();
    } catch { toast.error('Failed to update supplier'); }
  };

  const columns = [
    {
      key: 'name',
      label: 'Supplier',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">{row.name?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{row.name}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'businessName',
      label: 'Business',
      render: (row) => (
        <div>
          <p className="text-sm text-gray-700">{row.businessName || '—'}</p>
          <p className="text-xs text-gray-400">{row.businessLicense || ''}</p>
        </div>
      )
    },
    {
      key: 'productsCount',
      label: 'Products',
      render: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold">
          {row.productsCount}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => <StatusBadge status={row.isActive ? 'approved' : 'suspended'} />
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (row) => <span className="text-xs text-gray-400">{fmtDate(row.createdAt)}</span>
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/users/${row._id}`)}
            className="h-7 px-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View
          </button>
          {row.isActive ? (
            <button
              onClick={() => handleStatus(row._id, false)}
              className="h-7 px-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors"
            >
              <XCircleIcon className="w-3.5 h-3.5" />
              Suspend
            </button>
          ) : (
            <button
              onClick={() => handleStatus(row._id, true)}
              className="h-7 px-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-1 transition-colors"
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
      <div>
        <h2 className="text-lg font-bold text-gray-900">Suppliers</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {pagination ? `${pagination.total} registered suppliers` : 'Loading…'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, or business…"
              className="w-full pl-9 pr-4 h-9 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <button type="submit" className="h-9 px-4 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
            Search
          </button>
          {(search || statusFilter) && (
            <button type="button" onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); }}
              className="h-9 px-3 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 flex items-center gap-1 text-sm">
              <ArrowPathIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
        <div className="flex gap-1.5">
          <span className="text-xs text-gray-400 mr-1 self-center">Status:</span>
          <FilterChip label="All" active={!statusFilter} onClick={() => { setStatusFilter(''); setPage(1); }} />
          <FilterChip label="Approved" active={statusFilter === 'active'} onClick={() => { setStatusFilter('active'); setPage(1); }} />
          <FilterChip label="Suspended" active={statusFilter === 'inactive'} onClick={() => { setStatusFilter('inactive'); setPage(1); }} />
        </div>
      </div>

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
