import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { getAdminOrders, getAdminOrderQuickStats } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Orders Management Page
 * Quick stats, needs attention filter, overdue highlight, search & filters
 */

const ORDER_STATUSES  = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const fmtCurrency = (v) =>
  new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(v);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const isOverdue = (order) => {
  if (order.status !== 'pending') return false;
  const created = new Date(order.createdAt).getTime();
  const now = Date.now();
  const hours24 = 24 * 60 * 60 * 1000;
  return now - created > hours24;
};

const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`h-7 px-3 rounded-full text-xs font-medium capitalize border transition-all duration-150 ${
      active
        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
    }`}
  >
    {label}
  </button>
);

const StatBadge = ({ icon: Icon, label, value, onClick, accent = 'blue' }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
      accent === 'amber'
        ? 'bg-amber-50 border-amber-200/60 text-amber-800 hover:bg-amber-100'
        : accent === 'green'
        ? 'bg-emerald-50 border-emerald-200/60 text-emerald-800 hover:bg-emerald-100'
        : 'bg-blue-50 border-blue-200/60 text-blue-800 hover:bg-blue-100'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="text-xs font-semibold">{label}:</span>
    <span className="text-sm font-bold">{value}</span>
  </button>
);

const OrdersPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders]       = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [stats, setStats]         = useState(null);

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage]               = useState(1);
  const [sortBy, setSortBy]           = useState('createdAt');
  const [sortOrder, setSortOrder]     = useState('desc');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sortBy, sortOrder };
      if (search)        params.search = search;
      if (statusFilter)  params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;

      const res = await getAdminOrders(params);
      setOrders(Array.isArray(res.data) ? res.data : (res.data?.orders || res.orders || []));
      setPagination(res.pagination || res.data?.pagination || null);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getAdminOrderQuickStats();
      setStats(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter, paymentFilter, sortBy, sortOrder]);
  useEffect(() => { fetchStats(); }, [page, statusFilter, paymentFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order',
      sortable: true,
      render: (row) => {
        const overdue = isOverdue(row);
        return (
          <div>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs font-semibold text-blue-600">#{row.orderNumber}</p>
              {overdue && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200/60" title="Pending for more than 24h">
                  <ClockIcon className="w-3 h-3" /> Overdue
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(row.createdAt)}</p>
          </div>
        );
      }
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{row.customer?.name || '—'}</p>
          <p className="text-xs text-gray-400">{row.customer?.email}</p>
        </div>
      )
    },
    {
      key: 'total',
      label: 'Amount',
      sortable: true,
      render: (row) => (
        <span className="text-sm font-bold text-gray-900">{fmtCurrency(row.total)}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (row) => <StatusBadge status={row.paymentStatus} />
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <button
          onClick={() => navigate(`/admin/orders/${row._id}`)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
        >
          View →
        </button>
      )
    }
  ];

  const hasFilters = statusFilter || paymentFilter || search;

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      {stats && (
        <div className="flex flex-wrap gap-2">
          <StatBadge icon={ShoppingBagIcon} label="New today" value={stats.newToday} onClick={() => { setStatusFilter(''); setPage(1); }} accent="green" />
          <StatBadge icon={ExclamationTriangleIcon} label="Needs attention" value={stats.needsAttention} onClick={() => { setStatusFilter('needs_attention'); setPage(1); }} accent="amber" />
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Orders</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {pagination ? `${pagination.total} total orders` : 'Loading…'}
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number or customer name…"
              className="w-full pl-9 pr-4 h-9 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <button type="submit" className="h-9 px-4 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
            Search
          </button>
          {hasFilters && (
            <button type="button" onClick={() => { setSearch(''); setStatusFilter(''); setPaymentFilter(''); setPage(1); }} className="h-9 px-3 text-gray-400 hover:text-gray-600 text-sm rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1">
              <ArrowPathIcon className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </form>

        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-400 mr-1 self-center">Status:</span>
          <FilterChip label="All" active={!statusFilter} onClick={() => { setStatusFilter(''); setPage(1); }} />
          <FilterChip label="Needs attention" active={statusFilter === 'needs_attention'} onClick={() => { setStatusFilter('needs_attention'); setPage(1); }} />
          {ORDER_STATUSES.map(s => (
            <FilterChip key={s} label={s} active={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(1); }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-400 mr-1 self-center">Payment:</span>
          <FilterChip label="All" active={!paymentFilter} onClick={() => { setPaymentFilter(''); setPage(1); }} />
          {PAYMENT_STATUSES.map(s => (
            <FilterChip key={s} label={s} active={paymentFilter === s} onClick={() => { setPaymentFilter(s); setPage(1); }} />
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        onSort={(key, order) => { setSortBy(key); setSortOrder(order); }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        emptyMessage="No orders found"
      />
    </div>
  );
};

export default OrdersPage;
