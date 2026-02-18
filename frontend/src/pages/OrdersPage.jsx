import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { InlineLoader } from '../components/common/Spinner';
import orderService from '../services/orderService';
import { TruckIcon } from '@heroicons/react/24/outline';

/**
 * Orders List Page
 * Full order history with pagination
 */
export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }
    loadOrders();
  }, [navigate, pagination.page, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
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
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusColor = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
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
          <Card className="text-center py-12">
            <TruckIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Orders Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Start shopping to see your orders here</p>
            <Link to="/products">
              <Button variant="primary">Browse Products</Button>
            </Link>
          </Card>
        ) : (
          <>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-dark-border">
                      <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Order</th>
                      <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                      <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Total</th>
                      <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg-secondary/50">
                        <td className="py-4 px-4 font-mono text-sm text-gray-900 dark:text-white">
                          {order.orderNumber || order._id?.slice(-8)}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-900 dark:text-white">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link to={`/orders/${order._id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {pagination.pages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-gray-600 dark:text-gray-400">
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
