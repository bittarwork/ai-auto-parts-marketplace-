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
  MagnifyingGlassIcon,
  PackageIcon,
  CheckCircleIcon as CheckOutline
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  TruckIcon as TruckSolid,
  SparklesIcon
} from '@heroicons/react/24/solid';

/**
 * Orders List Page
 * UX-focused: clear status meanings, "what's next" hints, grouped by state
 */

// Human-readable status: label + short description for quick understanding
const STATUS_INFO = {
  pending: {
    label: 'Awaiting confirmation',
    description: 'We received your order and will confirm it soon.',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-800 dark:text-amber-300',
    icon: ClockIcon,
    border: 'border-amber-200 dark:border-amber-800'
  },
  confirmed: {
    label: 'Confirmed',
    description: 'Your order is confirmed. We are preparing it for shipment.',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-300',
    icon: CheckCircleIcon,
    border: 'border-blue-200 dark:border-blue-800'
  },
  processing: {
    label: 'Being prepared',
    description: 'We are packing your items. You will receive tracking info soon.',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-800 dark:text-indigo-300',
    icon: Cog6ToothIcon,
    border: 'border-indigo-200 dark:border-indigo-800'
  },
  shipped: {
    label: 'On the way',
    description: 'Your package has been shipped. Track it in the order details.',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-800 dark:text-violet-300',
    icon: TruckSolid,
    border: 'border-violet-200 dark:border-violet-800'
  },
  delivered: {
    label: 'Delivered',
    description: 'Your order has been delivered. We hope you enjoy it!',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-800 dark:text-emerald-300',
    icon: CheckCircleIcon,
    border: 'border-emerald-200 dark:border-emerald-800'
  },
  cancelled: {
    label: 'Cancelled',
    description: 'This order was cancelled.',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-300',
    icon: XCircleIcon,
    border: 'border-red-200 dark:border-red-800'
  }
};

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

  const formatPrice = (amount, currency = 'EUR') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getItemCount = (order) =>
    order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0;

  // Group: active first (pending→shipped), then delivered, then cancelled
  const activeStatuses = ['pending', 'confirmed', 'processing', 'shipped'];
  const activeOrders = orders.filter(o => activeStatuses.includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  const displayOrders = statusFilter
    ? orders
    : [...activeOrders, ...deliveredOrders, ...cancelledOrders];

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container>
          <InlineLoader text="Loading your orders..." />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container>
        {/* Header with summary */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-primary-100 dark:bg-primary-900/30">
              <ShoppingBagIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {orders.length === 0
                  ? 'Track and manage your orders'
                  : activeOrders.length > 0
                  ? `You have ${activeOrders.length} order${activeOrders.length > 1 ? 's' : ''} in progress`
                  : `You have ${orders.length} order${orders.length > 1 ? 's' : ''}`}
              </p>
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
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by order number (e.g. ORD-20250219-0001)"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-dark-border rounded-xl bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all placeholder-gray-400"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
              Search
            </button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPagination(p => ({ ...p, page: 1 })); }} className="px-3 py-2.5 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
                Clear
              </button>
            )}
          </form>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Show:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="border border-gray-300 dark:border-dark-border rounded-xl px-4 py-2.5 bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All orders</option>
              <option value="pending">Awaiting confirmation</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Being prepared</option>
              <option value="shipped">On the way</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {displayOrders.length === 0 ? (
          <Card className="text-center py-16 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-900/10 dark:to-transparent" />
            <div className="relative">
              <div className="inline-flex p-4 rounded-2xl bg-gray-100 dark:bg-dark-bg-secondary mb-6">
                <PackageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                When you place an order, it will appear here. You can see its status at every step: from confirmation to delivery.
              </p>
              <Link to="/products">
                <Button variant="primary" size="lg">Browse Products</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {displayOrders.map((order) => {
                const info = STATUS_INFO[order.status] || STATUS_INFO.pending;
                const StatusIcon = info.icon;
                const itemCount = getItemCount(order);

                return (
                  <Card key={order._id} hover className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800">
                    <Link to={`/orders/${order._id}`} className="block">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Order number + status badge */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-mono font-bold text-gray-900 dark:text-white text-lg">
                              Order {order.orderNumber || order._id?.slice(-8)}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium border ${info.bg} ${info.text} ${info.border}`}>
                              <StatusIcon className="w-4 h-4" />
                              {info.label}
                            </span>
                          </div>
                          {/* Status description - helps user understand what's happening */}
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 max-w-xl">
                            {info.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <CalendarDaysIcon className="w-4 h-4" />
                              Ordered {formatDate(order.createdAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </span>
                            {order.estimatedDelivery && order.status !== 'cancelled' && (
                              <span className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-medium">
                                <CheckOutline className="w-4 h-4" />
                                Est. delivery {formatDate(order.estimatedDelivery)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                            {formatPrice(order.total, order.currency || 'EUR')}
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
