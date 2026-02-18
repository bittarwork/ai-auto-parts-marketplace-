import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { getAdminOrders } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Orders Management Page
 * Lists all orders with filters, search, and pagination
 */

const ORDER_STATUSES = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['', 'pending', 'paid', 'failed', 'refunded'];

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(v);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const OrdersPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sortBy, sortOrder };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;

      const res = await getAdminOrders(params);
      setOrders(res.data?.orders || res.orders || []);
      setPagination(res.data?.pagination || res.pagination || null);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, paymentFilter, sortBy, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order #',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-sm font-medium text-blue-600">
          #{row.orderNumber}
        </span>
      )
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
      label: 'Total',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-gray-800">{formatCurrency(row.total)}</span>
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
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (row) => <span className="text-sm text-gray-500">{formatDate(row.createdAt)}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => navigate(`/admin/orders/${row._id}`)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View
        </button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order number or customer..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          {/* Status filters */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.filter(Boolean).map(s => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payments</option>
              {PAYMENT_STATUSES.filter(Boolean).map(s => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
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
