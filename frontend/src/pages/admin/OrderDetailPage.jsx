import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PrinterIcon,
  CheckIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import StatusBadge from '../../components/admin/StatusBadge';
import {
  getAdminOrderById,
  updateOrderStatus,
  updateOrderPayment,
  updateOrderDetails
} from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Order Detail Page
 * Full order view with visual timeline, status updates, tracking, ETA, and admin notes
 */

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
const CARRIERS = ['DHL', 'FedEx', 'UPS', 'Aramex', 'Other'];

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(v);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const formatDateOnly = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

// Tracking URL for common carriers
const getTrackingUrl = (carrier, trackingNumber) => {
  if (!carrier || !trackingNumber) return null;
  const c = (carrier || '').toLowerCase();
  const num = encodeURIComponent(trackingNumber);
  if (c.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${num}`;
  if (c.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${num}`;
  if (c.includes('ups')) return `https://www.ups.com/track?tracknum=${num}`;
  if (c.includes('aramex')) return `https://www.aramex.com/tools/track/?l=${num}`;
  return null;
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
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
      setEstimatedDelivery(o.estimatedDelivery ? o.estimatedDelivery.split('T')[0] : '');
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
      await updateOrderDetails(id, {
        trackingNumber,
        shippingCarrier,
        estimatedDelivery: estimatedDelivery || undefined,
        adminNotes
      });
      toast.success('Order details saved');
      fetchOrder();
    } catch (err) {
      toast.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();

  const copyTracking = () => {
    if (!order?.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingNumber);
    toast.success('Tracking number copied');
  };

  const trackingUrl = getTrackingUrl(order?.shippingCarrier, order?.trackingNumber);
  const needsTrackingHint = order?.status === 'shipped' && !order?.trackingNumber;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-12 text-gray-400">Order not found</div>;
  }

  const inputClass = 'w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block';

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Orders
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <PrinterIcon className="w-4 h-4" />
          Print Invoice
        </button>
      </div>

      {/* Order Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
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
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  {item.productSnapshot?.images?.[0]?.url && (
                    <img src={item.productSnapshot.images[0].url} alt="" className="w-12 h-12 object-cover rounded-xl border border-gray-100" />
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
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              {order.shipping > 0 && <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{formatCurrency(order.shipping)}</span></div>}
              {order.tax > 0 && <div className="flex justify-between text-gray-500"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>}
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
            </div>
          </div>

          {/* Visual Status Timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TruckIcon className="w-4 h-4 text-blue-500" />
              Status Timeline
            </h3>
            <div className="relative pl-6 space-y-0">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200 rounded-full" />
              {(order.statusHistory || []).length === 0 ? (
                <p className="text-sm text-gray-400">No status history yet</p>
              ) : (
                [...(order.statusHistory || [])].reverse().map((h, i) => (
                  <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
                    <div className="absolute left-0 w-4 h-4 -translate-x-[7px] rounded-full bg-blue-500 border-2 border-white shadow-sm flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800 capitalize">{h.status}</p>
                      {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(h.date)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer</h3>
            <p className="text-sm font-medium text-gray-800">{order.customer?.name}</p>
            <p className="text-sm text-gray-500">{order.customer?.email}</p>
            <p className="text-sm text-gray-500">{order.customer?.phone}</p>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
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

          {/* Tracking & ETA - Prominent */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-blue-500" />
              Tracking & Delivery
            </h3>
            {needsTrackingHint && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-700 text-xs">
                <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                <span>Add tracking number so the customer can follow the shipment</span>
              </div>
            )}
            <div>
              <label className={labelClass}>Carrier</label>
              <select value={shippingCarrier} onChange={(e) => setShippingCarrier(e.target.value)} className={inputClass}>
                <option value="">Select carrier…</option>
                {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tracking Number</label>
              <div className="flex gap-2">
                <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. 1234567890" className={inputClass} />
                {order.trackingNumber && (
                  <button onClick={copyTracking} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600" title="Copy">
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Estimated Delivery (ETA)</label>
              <input type="date" value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)} className={inputClass} />
            </div>
            {trackingUrl && (
              <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800">
                <LinkIcon className="w-3.5 h-3.5" />
                Open carrier tracking page
              </a>
            )}
            <button onClick={handleUpdateDetails} disabled={saving} className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50">
              Save Tracking
            </button>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Update Status</h3>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={inputClass}>
              {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <input type="text" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Note (optional)" className={inputClass} />
            <button onClick={handleUpdateStatus} disabled={saving || newStatus === order.status} className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50">
              Update Status
            </button>
          </div>

          {/* Update Payment */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Payment Status</h3>
            <select value={newPaymentStatus} onChange={(e) => setNewPaymentStatus(e.target.value)} className={inputClass}>
              {PAYMENT_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <button onClick={handleUpdatePayment} disabled={saving || newPaymentStatus === order.paymentStatus} className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50">
              Update Payment
            </button>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Admin Notes</h3>
            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Internal notes (not visible to customer)" rows={3} className={`${inputClass} resize-none`} />
            <button onClick={handleUpdateDetails} disabled={saving} className="w-full py-2.5 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-900 disabled:opacity-50">
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
