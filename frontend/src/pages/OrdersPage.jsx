import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { InlineLoader } from '../components/common/Spinner';
import orderService from '../services/orderService';
import {
  TruckIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  CubeTransparentIcon
} from '@heroicons/react/24/solid';

/**
 * Orders List Page
 * Order history with filters, cards layout and clear status indicators
 */
export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }
    loadOrders();
  }, [navigate, pagination.page, statusFilter, search]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const response = await orderService.getUserOrders(params);
      if (response.success) {
        setOrders(response.data || []);
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
          pages: response.pagination?.pages || 1
        }));
      }
    } catch (err) {
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount, currency = 'SAR') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-800 dark:text-amber-300',
        icon: ClockIcon,
        label: 'Pending'
      },
      confirmed: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        icon: CheckCircleIcon,
        label: 'Confirmed'
      },
      processing: {
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        text: 'text-indigo-800 dark:text-indigo-300',
        icon: Cog6ToothIcon,
        label: 'Processing'
      },
      shipped: {
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        text: 'text-violet-800 dark:text-violet-300',
        icon: TruckIcon,
        label: 'Shipped'
      },
      delivered: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-800 dark:text-emerald-300',
        icon: CheckCircleIcon,
        label: 'Delivered'
      },
      cancelled: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        icon: XCircleIcon,
        label: 'Cancelled'
      }
    };
    return configs[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: DocumentTextIcon, label: status };
  };

  const getOrderItemCount = (order) => {
    if (!order.items) return 0;
    return order.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container>
          <InlineLoader text="Loading orders..." />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <ShoppingBagIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your orders</p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-4">
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); setPagination(p => ({ ...p, page: 1 })); }}
            className="flex gap-2 flex-1 min-w-0"
          >
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by order number..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-dark-border rounded-xl bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSearchInput(''); setPagination(p => ({ ...p, page: 1 })); }}
                className="px-3 py-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors"
              >
                Clear
              </button>
            )}
          </form>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="border border-gray-300 dark:border-dark-border rounded-xl px-4 py-2.5 bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-16 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-900/10 dark:to-transparent" />
            <div className="relative">
              <div className="inline-flex p-4 rounded-2xl bg-gray-100 dark:bg-dark-bg-secondary mb-6">
                <TruckIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Orders Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                When you place an order, it will appear here. You can track its status and view details.
              </p>
              <Link to="/products">
                <Button variant="primary" size="lg">Browse Products</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            {/* Orders Grid - Card layout */}
            <div className="space-y-4">
              {orders.map((order) => {
                const config = getStatusConfig(order.status);
                const StatusIcon = config.icon;
                const itemCount = getOrderItemCount(order);
                return (
                  <Card
                    key={order._id}
                    hover
                    className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800"
                  >
                    <Link to={`/orders/${order._id}`} className="block">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left: Order info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono font-semibold text-gray-900 dark:text-white text-lg">
                              {order.orderNumber || order._id?.slice(-8)}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                              <StatusIcon className="w-4 h-4" />
                              {config.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <CalendarDaysIcon className="w-4 h-4" />
                              {formatDate(order.createdAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <CubeTransparentIcon className="w-4 h-4" />
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>
                        {/* Right: Total + CTA */}
                        <div className="flex items-center gap-4 sm:gap-6">
                          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                            {formatPrice(order.total, order.currency || 'SAR')}
                          </span>
                          <span className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium group">
                            View details
                            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
