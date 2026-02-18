import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  CurrencyEuroIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import StatsCard from '../../components/admin/StatsCard';
import ChartWrapper from '../../components/admin/ChartWrapper';
import StatusBadge from '../../components/admin/StatusBadge';
import { getDashboard } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Overview / Dashboard Page
 * Shows KPIs, revenue chart, top products, recent orders, and low stock alerts
 */

const ORDER_STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#6366f1',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(value);

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const OverviewPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard();
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const kpis = data?.kpis || {};
  const revenueChart = data?.revenueChart || [];
  const ordersByStatus = data?.ordersByStatus || [];
  const topProducts = data?.topProducts || [];
  const recentOrders = data?.recentOrders || [];
  const lowStockProducts = data?.lowStockProducts || [];

  // Format pie chart data
  const pieData = ordersByStatus.map(s => ({
    name: s._id,
    value: s.count,
    color: ORDER_STATUS_COLORS[s._id] || '#94a3b8'
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Revenue"
          value={loading ? '...' : formatCurrency(kpis.totalRevenue || 0)}
          icon={CurrencyEuroIcon}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Total Orders"
          value={loading ? '...' : kpis.totalOrders?.toLocaleString() || '0'}
          icon={ShoppingBagIcon}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Total Users"
          value={loading ? '...' : kpis.totalUsers?.toLocaleString() || '0'}
          icon={UsersIcon}
          color="purple"
          loading={loading}
        />
        <StatsCard
          title="Products"
          value={loading ? '...' : kpis.totalProducts?.toLocaleString() || '0'}
          icon={CubeIcon}
          color="yellow"
          loading={loading}
        />
        <StatsCard
          title="New Today"
          value={loading ? '...' : kpis.newUsersToday?.toLocaleString() || '0'}
          icon={UserPlusIcon}
          color="indigo"
          trendLabel="users registered today"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Line Chart */}
        <div className="lg:col-span-2">
          <ChartWrapper title="Revenue - Last 30 Days" loading={loading}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueChart.map(d => ({
                date: formatDate(d._id),
                revenue: d.revenue,
                orders: d.orders
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `€${v}`} />
                <Tooltip formatter={(v, name) => [name === 'revenue' ? formatCurrency(v) : v, name]} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </div>

        {/* Orders by Status Pie */}
        <ChartWrapper title="Orders by Status" loading={loading}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                formatter={(value) => <span className="text-xs capitalize">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Orders</h3>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.slice(0, 8).map(order => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{order.customer?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{formatCurrency(order.total)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-700">Low Stock Alerts</h3>
          </div>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded"></div>
              ))}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No low stock items</p>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map(product => (
                <div key={product._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {product.name?.en || product.name?.ar || 'Product'}
                    </p>
                    <p className="text-xs text-gray-400">{product.partNumber}</p>
                  </div>
                  <span className={`text-sm font-bold ${product.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Selling Products</h3>
        {loading ? (
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded"></div>
            ))}
          </div>
        ) : (
          <ChartWrapper title="" loading={false}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts.map(p => ({
                name: p.product?.name?.en || 'Product',
                sold: p.totalSold,
                revenue: p.revenue
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, name) => [name === 'revenue' ? formatCurrency(v) : v, name]} />
                <Bar dataKey="sold" fill="#3b82f6" name="Units Sold" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}
      </div>
    </div>
  );
};

export default OverviewPage;
