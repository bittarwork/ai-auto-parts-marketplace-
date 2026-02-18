import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { getUsers, deleteUser, toggleUserActivation } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Users Management Page
 */

const ROLES    = ['customer', 'supplier', 'administrator'];
const STATUSES = ['active', 'inactive'];

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const RoleBadge = ({ role }) => {
  const styles = {
    administrator: 'bg-purple-50 text-purple-700 border-purple-200/60',
    supplier:      'bg-blue-50   text-blue-700   border-blue-200/60',
    customer:      'bg-gray-100  text-gray-600   border-gray-200/60',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${styles[role] || styles.customer}`}>
      {role}
    </span>
  );
};

const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`h-7 px-3 rounded-full text-xs font-medium capitalize border transition-all ${
      active
        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
    }`}
  >
    {label}
  </button>
);

const UsersPage = () => {
  const navigate = useNavigate();

  const [users, setUsers]           = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);

  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]               = useState(1);
  const [sortBy, setSortBy]           = useState('createdAt');
  const [sortOrder, setSortOrder]     = useState('desc');

  const [deleteModal, setDeleteModal] = useState({ open: false, userId: null, loading: false });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sortBy, sortOrder };
      if (search)       params.search = search;
      if (roleFilter)   params.role   = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await getUsers(params);
      setUsers(res.data?.users || []);
      setPagination(res.data?.pagination || null);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter, statusFilter, sortBy, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleUserActivation(id);
      toast.success(res.message);
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const handleDelete = async () => {
    setDeleteModal(p => ({ ...p, loading: true }));
    try {
      await deleteUser(deleteModal.userId);
      toast.success('User deleted');
      setDeleteModal({ open: false, userId: null, loading: false });
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
      setDeleteModal(p => ({ ...p, loading: false }));
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">
              {row.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{row.name}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => <span className="text-sm text-gray-500">{row.phone || '—'}</span>
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <RoleBadge role={row.role} />
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => <StatusBadge status={row.isActive ? 'active' : 'inactive'} />
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
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
          <button
            onClick={() => handleToggle(row._id)}
            className={`h-7 px-2.5 text-xs font-semibold rounded-lg transition-colors ${
              row.isActive
                ? 'text-orange-500 hover:bg-orange-50'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => setDeleteModal({ open: true, userId: row._id, loading: false })}
            className="h-7 px-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const hasFilters = search || roleFilter || statusFilter;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Users</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {pagination ? `${pagination.total} registered accounts` : 'Loading…'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, or phone…"
              className="w-full pl-9 pr-4 h-9 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <button type="submit" className="h-9 px-4 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
            Search
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); setPage(1); }}
              className="h-9 px-3 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 flex items-center gap-1 transition-colors text-sm"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </form>

        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-400 mr-1 self-center">Role:</span>
          <FilterChip label="All" active={!roleFilter} onClick={() => { setRoleFilter(''); setPage(1); }} />
          {ROLES.map(r => (
            <FilterChip key={r} label={r} active={roleFilter === r} onClick={() => { setRoleFilter(r); setPage(1); }} />
          ))}
          <span className="text-xs text-gray-400 ml-3 mr-1 self-center">Status:</span>
          <FilterChip label="All" active={!statusFilter} onClick={() => { setStatusFilter(''); setPage(1); }} />
          {STATUSES.map(s => (
            <FilterChip key={s} label={s} active={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(1); }} />
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        onSort={(key, order) => { setSortBy(key); setSortOrder(order); }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        emptyMessage="No users found"
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, userId: null, loading: false })}
        loading={deleteModal.loading}
        title="Delete User"
        message="Are you sure you want to delete this user? All their data will be permanently removed."
      />
    </div>
  );
};

export default UsersPage;
