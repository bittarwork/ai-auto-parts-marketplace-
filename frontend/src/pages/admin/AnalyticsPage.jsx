import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ChartWrapper from '../../components/admin/ChartWrapper';
import {
  getRevenueAnalytics,
  getOrdersAnalytics,
  getUsersAnalytics,
  getTopProducts
} from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Analytics & Reports Page
 * Revenue trends, order distributions, user growth, top products
 */

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(v);

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#6366f1',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
  paid: '#10b981',
  failed: '#ef4444',
  refunded: '#f97316',
};

const AnalyticsPage = () => {
  const [period, setPeriod] = useState('daily');
  const [revenue, setRevenue] = useState([]);
  const [ordersData, setOrdersData] = useState({ byStatus: [], byPayment: [] });
  const [usersData, setUsersData] = useState({ growth: [], byRole: [] });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [revRes, ordRes, usrRes, topRes] = await Promise.all([
        getRevenueAnalytics(period),
        getOrdersAnalytics(),
        getUsersAnalytics(),
        getTopProducts()
      ]);
      setRevenue(revRes.data || []);
      setOrdersData(ordRes.data || { byStatus: [], byPayment: [] });
      setUsersData(usrRes.data || { growth: [], byRole: [] });
      setTopProducts(topRes.data || []);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [period]);

  const revenueParsed = revenue.map(d => ({
    date: d._id,
    Revenue: d.revenue,
    Orders: d.orders
  }));

  const orderStatusPie = ordersData.byStatus.map(s => ({
    name: s._id,
    value: s.count,
    color: STATUS_COLORS[s._id] || '#94a3b8'
  }));

  const paymentPie = ordersData.byPayment.map(s => ({
    name: s._id,
    value: s.count,
    color: STATUS_COLORS[s._id] || '#94a3b8'
  }));

  const userGrowth = usersData.growth.map(d => ({ date: d._id, Users: d.count }));

  return (
    <div className="space-y-5">
      {/* Period Selector */}
      <div className="flex items-center gap-2">
        {['daily', 'weekly', 'monthly'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 text-sm rounded-lg capitalize font-medium transition-colors ${
              period === p
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Revenue Chart */}
      <ChartWrapper title={`Revenue & Orders (${period})`} loading={loading}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={revenueParsed}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => `€${v}`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, name) => [name === 'Revenue' ? formatCurrency(v) : v, name]} />
            <Legend />
            <Bar yAxisId="left" dataKey="Revenue" fill="#3b82f6" name="Revenue (EUR)" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="Orders" fill="#10b981" name="Orders" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Orders Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartWrapper title="Orders by Status" loading={loading}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={orderStatusPie}
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={50}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {orderStatusPie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Orders by Payment Status" loading={loading}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={paymentPie}
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={50}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {paymentPie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* User Growth */}
      <ChartWrapper title="User Growth (Last 30 Days)" loading={loading}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="Users" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Top Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Top 10 Selling Products</h3>
        {loading ? (
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium text-right">Units Sold</th>
                  <th className="pb-2 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.map((p, i) => (
                  <tr key={i}>
                    <td className="py-2.5">
                      <p className="font-medium text-gray-800">
                        {p.product?.name?.en || 'Product'}
                      </p>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-blue-600">
                      {p.totalSold}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-green-600">
                      {formatCurrency(p.revenue)}
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400">No sales data yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
