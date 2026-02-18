import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PrinterIcon, CheckIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../../components/admin/StatusBadge';
import { getAdminOrderById, updateOrderStatus, updateOrderPayment, updateOrderDetails } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Order Detail Page
 * Full order view with status updates, tracking, invoice print, and admin notes
 */

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(v);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await getAdminOrderById(id);
      const o = res.data;
      setOrder(o);
      setNewStatus(o.status);
      setNewPaymentStatus(o.paymentStatus);
      setTrackingNumber(o.trackingNumber || '');
      setShippingCarrier(o.shippingCarrier || '');
      setAdminNotes(o.adminNotes || '');
    } catch {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      await updateOrderStatus(id, { status: newStatus, note: statusNote });
      toast.success('Order status updated');
      setStatusNote('');
      fetchOrder();
    } catch (err) {
      toast.error(err?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePayment = async () => {
    setSaving(true);
    try {
      await updateOrderPayment(id, { status: newPaymentStatus });
      toast.success('Payment status updated');
      fetchOrder();
    } catch (err) {
      toast.error(err?.message || 'Failed to update payment');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDetails = async () => {
    setSaving(true);
    try {
      await updateOrderDetails(id, { trackingNumber, shippingCarrier, adminNotes });
      toast.success('Order details saved');
      fetchOrder();
    } catch (err) {
      toast.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12 text-gray-400">Order not found</div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Orders
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <PrinterIcon className="w-4 h-4" />
          Print Invoice
        </button>
      </div>

      {/* Order Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
            <p className="text-sm text-gray-400 mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  {item.productSnapshot?.images?.[0]?.url && (
                    <img
                      src={item.productSnapshot.images[0].url}
                      alt=""
                      className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {item.productSnapshot?.name?.en || item.product?.name?.en || 'Product'}
                    </p>
                    <p className="text-xs text-gray-400">{item.productSnapshot?.partNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">x{item.quantity}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.shipping > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.shipping)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Timeline</h3>
            <div className="space-y-3">
              {(order.statusHistory || []).map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 capitalize">{h.status}</p>
                    {h.note && <p className="text-xs text-gray-400">{h.note}</p>}
                    <p className="text-xs text-gray-400">{formatDate(h.date)}</p>
                  </div>
                </div>
              ))}
              {(!order.statusHistory || order.statusHistory.length === 0) && (
                <p className="text-sm text-gray-400">No status history</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer</h3>
            <p className="text-sm font-medium text-gray-800">{order.customer?.name}</p>
            <p className="text-sm text-gray-500">{order.customer?.email}</p>
            <p className="text-sm text-gray-500">{order.customer?.phone}</p>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Shipping Address</h3>
            {order.shippingAddress ? (
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>{order.shippingAddress.name || order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street || order.shippingAddress.addressLine1}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.district}</p>
                <p>{order.shippingAddress.country}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No address</p>
            )}
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Update Status</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleUpdateStatus}
              disabled={saving || newStatus === order.status}
              className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Update Status
            </button>
          </div>

          {/* Update Payment */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Payment Status</h3>
            <select
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAYMENT_STATUSES.map(s => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
            <button
              onClick={handleUpdatePayment}
              disabled={saving || newPaymentStatus === order.paymentStatus}
              className="w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Update Payment
            </button>
          </div>

          {/* Tracking & Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Tracking & Notes</h3>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking number"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={shippingCarrier}
              onChange={(e) => setShippingCarrier(e.target.value)}
              placeholder="Shipping carrier (e.g. DHL)"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Admin notes..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={handleUpdateDetails}
              disabled={saving}
              className="w-full py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 disabled:opacity-50"
            >
              Save Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
