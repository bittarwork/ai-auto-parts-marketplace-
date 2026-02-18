import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../../components/admin/StatusBadge';
import { getUserById, updateUser } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin User Detail Page
 * Full user profile with role/status management and order history
 */

const ROLES = ['customer', 'supplier', 'administrator'];
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const formatCurrency = (v) => new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(v);

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await getUserById(id);
      setData(res.data);
      setRole(res.data.user.role);
      setIsActive(res.data.user.isActive);
    } catch {
      toast.error('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(id, { role, isActive });
      toast.success('User updated successfully');
      fetchUser();
    } catch (err) {
      toast.error(err?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const { user, orders, stats } = data;

  return (
    <div className="space-y-5 max-w-5xl">
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Users
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: User Info + Controls */}
        <div className="space-y-5">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">
                  {user.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="text-gray-800">{user.phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Registered</span>
                <span className="text-gray-800">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Login</span>
                <span className="text-gray-800">{formatDate(user.lastLogin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Statistics</h3>
            <div className="space-y-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalSpent)}</p>
                <p className="text-xs text-gray-500">Total Spent</p>
              </div>
            </div>
          </div>

          {/* Edit Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Manage User</h3>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLES.map(r => (
                  <option key={r} value={r} className="capitalize">{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Account Status</label>
              <select
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Supplier Info */}
          {user.role === 'supplier' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Supplier Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Business Name</span>
                  <span className="text-gray-800">{user.businessName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">License</span>
                  <span className="text-gray-800">{user.businessLicense || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax Number</span>
                  <span className="text-gray-800">{user.taxNumber || '—'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Orders</h3>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {orders.map(order => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    <div>
                      <p className="text-sm font-mono font-medium text-blue-600">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(order.total)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
