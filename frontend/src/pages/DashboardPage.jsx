import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { InlineLoader } from '../components/common/Spinner';
import authService from '../services/authService';
import orderService from '../services/orderService';
import {
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  ChevronRightIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

/**
 * User Dashboard
 * Order history, profile shortcut, wishlist
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { from: '/dashboard', message: 'Login required' } });
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [meRes, ordersRes] = await Promise.all([
        authService.getMe(),
        orderService.getUserOrders({ page: 1, limit: 5 })
      ]);
      if (meRes.success && meRes.data) {
        setUser(meRes.data);
      }
      if (ordersRes.success) {
        setOrders(ordersRes.data || []);
        setPagination(ordersRes.pagination || {});
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container>
          <InlineLoader text="Loading dashboard..." />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name || 'User'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Profile</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account</p>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </Card>
          </Link>
          <Link to="/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <ShoppingBagIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Orders</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View order history</p>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </Card>
          </Link>
          <Link to="/wishlist">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-error-600 dark:text-error-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Wishlist</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Saved products</p>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </Card>
          </Link>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link to="/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <TruckIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No orders yet</p>
              <Link to="/products">
                <Button variant="primary">Browse Products</Button>
              </Link>
            </div>
          ) : (
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
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
          )}
        </Card>
      </Container>
    </div>
  );
}
