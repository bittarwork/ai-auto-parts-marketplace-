import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  CurrencyEuroIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { getDashboard } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Overview Dashboard - Modern Redesign
 * Clean, professional dashboard with area charts, KPI cards with accents,
 * activity feed, and stock progress bars
 */

// ── Helpers ────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

const fmtFull = (v) =>
  new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(v);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

const fmtDateTime = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

// ── KPI Card ───────────────────────────────────────────────
const KpiCard = ({ title, value, sub, icon: Icon, accent, loading }) => {
  const accents = {
    blue:   { bg: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
    green:  { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    violet: { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-600',  border: 'border-violet-100' },
    amber:  { bg: 'bg-amber-500',  light: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100' },
    rose:   { bg: 'bg-rose-500',   light: 'bg-rose-50',   text: 'text-rose-600',   border: 'border-rose-100' },
  };
  const a = accents[accent] || accents.blue;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-28 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-20" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 ${a.light} ${a.border} border rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${a.text}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-gray-400">{sub}</p>}
      {/* Bottom accent bar */}
      <div className={`mt-4 h-0.5 w-0 group-hover:w-full ${a.bg} rounded-full transition-all duration-500`} />
    </div>
  );
};

// ── Status icon mapping ────────────────────────────────────
const StatusIcon = ({ status }) => {
  const map = {
    pending:    { icon: ClockIcon,        cls: 'text-amber-500 bg-amber-50' },
    confirmed:  { icon: CheckCircleIcon,  cls: 'text-blue-500 bg-blue-50' },
    processing: { icon: ArrowTrendingUpIcon, cls: 'text-indigo-500 bg-indigo-50' },
    shipped:    { icon: TruckIcon,        cls: 'text-violet-500 bg-violet-50' },
    delivered:  { icon: CheckCircleIcon,  cls: 'text-emerald-500 bg-emerald-50' },
    cancelled:  { icon: XCircleIcon,      cls: 'text-rose-500 bg-rose-50' },
  };
  const { icon: Icon, cls } = map[status] || map.pending;
  return (
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
  );
};

// ── Custom Tooltip for Area Chart ─────────────────────────
const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-medium mb-1 text-gray-300">{label}</p>
      <p className="text-emerald-400 font-bold">{fmtFull(payload[0]?.value || 0)}</p>
    </div>
  );
};

// ── Order status bar chart tooltip ────────────────────────
const StatusTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="capitalize font-medium">{payload[0]?.payload?.name}</p>
      <p className="text-blue-300 font-bold">{payload[0]?.value} orders</p>
    </div>
  );
};

// ── STATUS COLORS ──────────────────────────────────────────
const STATUS_COLORS = {
  pending:    '#f59e0b',
  confirmed:  '#3b82f6',
  processing: '#6366f1',
  shipped:    '#8b5cf6',
  delivered:  '#10b981',
  cancelled:  '#ef4444',
};

// ── Skeleton rows ──────────────────────────────────────────
const SkeletonRows = ({ n = 5 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-2.5 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="h-4 bg-gray-100 rounded w-16" />
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
const OverviewPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user name for greeting
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const firstName = user?.name?.split(' ')[0] || 'Admin';

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard();
        setData(res.data);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const kpis              = data?.kpis || {};
  const revenueChart      = data?.revenueChart || [];
  const ordersByStatus    = data?.ordersByStatus || [];
  const topProducts       = data?.topProducts || [];
  const recentOrders      = data?.recentOrders || [];
  const lowStockProducts  = data?.lowStockProducts || [];

  // Build area chart data (fill gaps with 0)
  const areaData = revenueChart.map(d => ({
    date:    fmtDate(d._id),
    revenue: d.revenue,
    orders:  d.orders,
  }));

  // Bar chart for order statuses
  const statusBarData = ordersByStatus.map(s => ({
    name:  s._id,
    count: s.count,
    fill:  STATUS_COLORS[s._id] || '#94a3b8',
  }));

  // Total orders for status % calc
  const totalOrders = ordersByStatus.reduce((sum, s) => sum + s.count, 0);

  // Today's date display
  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="space-y-6">

      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {greeting}, {firstName} 👋
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">{todayLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          {(kpis.newOrdersToday > 0 || kpis.pendingOrdersCount > 0) && !loading && (
            <button
              onClick={() => navigate('/admin/orders')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-medium hover:bg-amber-100 transition-colors"
            >
              {kpis.newOrdersToday > 0 && <span>{kpis.newOrdersToday} new today</span>}
              {kpis.newOrdersToday > 0 && kpis.pendingOrdersCount > 0 && <span>•</span>}
              {kpis.pendingOrdersCount > 0 && <span>{kpis.pendingOrdersCount} need attention</span>}
            </button>
          )}
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ShoppingBagIcon className="w-4 h-4" />
            Orders
          </button>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <CubeIcon className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={loading ? '—' : fmt(kpis.totalRevenue || 0)}
          sub="From all paid orders"
          icon={CurrencyEuroIcon}
          accent="green"
          loading={loading}
        />
        <KpiCard
          title="Total Orders"
          value={loading ? '—' : (kpis.totalOrders || 0).toLocaleString()}
          sub={`${kpis.newUsersToday || 0} new users today`}
          icon={ShoppingBagIcon}
          accent="blue"
          loading={loading}
        />
        <KpiCard
          title="Customers"
          value={loading ? '—' : (kpis.totalUsers || 0).toLocaleString()}
          sub="Active accounts"
          icon={UsersIcon}
          accent="violet"
          loading={loading}
        />
        <KpiCard
          title="Products"
          value={loading ? '—' : (kpis.totalProducts || 0).toLocaleString()}
          sub={lowStockProducts.length > 0 ? `${lowStockProducts.length} low stock` : 'Stock healthy'}
          icon={CubeIcon}
          accent={lowStockProducts.length > 0 ? 'amber' : 'green'}
          loading={loading}
        />
      </div>

      {/* ── Revenue Chart + Order Status ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Area Chart — Revenue */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Revenue Overview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 30 days performance</p>
            </div>
            {!loading && areaData.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-sm font-bold text-emerald-600">
                  {fmtFull(areaData.reduce((s, d) => s + d.revenue, 0))}
                </p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-52 bg-gray-50 rounded-xl animate-pulse" />
          ) : areaData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-300 text-sm">
              No revenue data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={areaData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v >= 1000 ? `€${v / 1000}k` : `€${v}`}
                  width={45}
                />
                <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-800">Order Status</h3>
            <p className="text-xs text-gray-400 mt-0.5">{totalOrders} total orders</p>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-100 rounded w-20" />
                    <div className="h-3 bg-gray-100 rounded w-8" />
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3.5">
              {statusBarData.map((s) => {
                const pct = totalOrders > 0 ? Math.round((s.count / totalOrders) * 100) : 0;
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 capitalize">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800">{s.count}</span>
                        <span className="text-xs text-gray-400">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: s.fill }}
                      />
                    </div>
                  </div>
                );
              })}
              {statusBarData.length === 0 && (
                <p className="text-sm text-gray-300 text-center py-6">No orders yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Orders + Low Stock ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Recent Orders</h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest activity</p>
            </div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all
              <ArrowRightIcon className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <SkeletonRows n={6} />
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-300 text-sm">No orders yet</div>
          ) : (
            <div className="space-y-1">
              {recentOrders.slice(0, 7).map(order => (
                <button
                  key={order._id}
                  onClick={() => navigate(`/admin/orders/${order._id}`)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                >
                  <StatusIcon status={order.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{order.customer?.name || '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{fmtFull(order.total)}</p>
                    <p className="text-xs text-gray-400">{fmtDate(order.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Stock Alerts</h3>
              <p className="text-xs text-gray-400 mt-0.5">Items needing restocking</p>
            </div>
            <button
              onClick={() => navigate('/admin/products')}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all
              <ArrowRightIcon className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <SkeletonRows n={6} />
          ) : lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">All products well stocked</p>
              <p className="text-xs text-gray-400">No restocking needed</p>
            </div>
          ) : (
            <div className="space-y-1">
              {lowStockProducts.map(product => {
                const isOut  = product.stock === 0;
                const maxRef = 20; // reference max for progress bar
                const pct    = Math.min((product.stock / maxRef) * 100, 100);

                return (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isOut ? 'bg-red-50' : 'bg-amber-50'
                    }`}>
                      <ExclamationTriangleIcon className={`w-3.5 h-3.5 ${isOut ? 'text-red-500' : 'text-amber-500'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {product.name?.en || product.name?.ar || 'Product'}
                      </p>
                      <div className="mt-1 w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${isOut ? 'bg-red-500' : 'bg-amber-400'}`}
                          style={{ width: isOut ? '100%' : `${pct}%` }}
                        />
                      </div>
                    </div>

                    <span className={`text-sm font-bold flex-shrink-0 ${
                      isOut ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {isOut ? 'Out' : `${product.stock}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Top Selling Products ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Top Selling Products</h3>
            <p className="text-xs text-gray-400 mt-0.5">Best performers by units sold</p>
          </div>
          <button
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Full report
            <ArrowRightIcon className="w-3 h-3" />
          </button>
        </div>

        {loading ? (
          <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
        ) : topProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-300 text-sm">No sales data yet</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={topProducts.slice(0, 5).map(p => ({
                  name: (p.product?.name?.en || 'Product').substring(0, 14) + (
                    (p.product?.name?.en || '').length > 14 ? '…' : ''
                  ),
                  sold: p.totalSold,
                  revenue: p.revenue,
                }))}
                margin={{ top: 0, right: 0, bottom: 0, left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-gray-900 text-white rounded-xl px-3 py-2 shadow-xl text-xs">
                      <p className="font-medium text-gray-300 mb-1">{label}</p>
                      <p className="text-blue-300">{payload[0]?.value} units sold</p>
                    </div>
                  );
                }} />
                <Bar dataKey="sold" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {topProducts.slice(0, 5).map((_, i) => (
                    <Cell
                      key={i}
                      fill={['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'][i % 5]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Ranked List */}
            <div className="space-y-2.5">
              {topProducts.slice(0, 5).map((p, i) => {
                const maxSold = topProducts[0]?.totalSold || 1;
                const pct = Math.round((p.totalSold / maxSold) * 100);
                const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-pink-500', 'bg-amber-500'];

                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-5 text-xs font-bold text-gray-400 text-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {p.product?.name?.en || 'Product'}
                        </p>
                        <span className="text-xs font-bold text-gray-800 ml-2 flex-shrink-0">
                          {p.totalSold} sold
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${colors[i % 5]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default OverviewPage;
