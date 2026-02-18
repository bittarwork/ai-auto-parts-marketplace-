import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { getUsers, deleteUser, toggleUserActivation } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Users Management Page
 * Table with filters for all users, role/status management actions
 */

const ROLES = ['', 'customer', 'supplier', 'administrator'];
const STATUSES = ['', 'active', 'inactive'];

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const UsersPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [deleteModal, setDeleteModal] = useState({ open: false, userId: null, loading: false });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sortBy, sortOrder };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
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

  const handleToggleActivation = async (id) => {
    try {
      const res = await toggleUserActivation(id);
      toast.success(res.message);
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      await deleteUser(deleteModal.userId);
      toast.success('User deleted');
      setDeleteModal({ open: false, userId: null, loading: false });
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const roleBadgeStyle = {
    administrator: 'bg-purple-100 text-purple-800',
    supplier: 'bg-blue-100 text-blue-800',
    customer: 'bg-gray-100 text-gray-700',
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{row.name}</p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => <span className="text-sm text-gray-600">{row.phone || '—'}</span>
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadgeStyle[row.role] || 'bg-gray-100 text-gray-700'}`}>
          {row.role}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <StatusBadge status={row.isActive ? 'active' : 'inactive'} />
      )
    },
    {
      key: 'createdAt',
      label: 'Registered',
      sortable: true,
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
          <button
            onClick={() => handleToggleActivation(row._id)}
            className={`text-xs font-medium ${row.isActive ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'}`}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => setDeleteModal({ open: true, userId: row._id, loading: false })}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Delete
          </button>
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
                placeholder="Search name, email, phone..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              Search
            </button>
          </form>

          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              {ROLES.filter(Boolean).map(r => (
                <option key={r} value={r} className="capitalize">{r}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {STATUSES.filter(Boolean).map(s => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
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

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, userId: null, loading: false })}
        loading={deleteModal.loading}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
};

export default UsersPage;
