import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ConfirmModal from '../components/common/ConfirmModal';
import { InlineLoader } from '../components/common/Spinner';
import orderService from '../services/orderService';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import {
  TruckIcon,
  ArrowLeftIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
  ArrowTopRightOnSquareIcon,
  CreditCardIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CubeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';

/**
 * Order Detail Page
 * Full order view with tracking timeline and shipping/tracking info
 */
const ORDER_STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function OrderTrackingStepper({ order }) {
  const status = order?.status || 'pending';
  const isCancelled = status === 'cancelled';
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        <span className="text-red-700 dark:text-red-300 font-medium">This order was cancelled</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Progress line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-dark-border hidden sm:block" />
      <div
        className="absolute top-5 left-0 h-0.5 bg-primary-500 dark:bg-primary-400 hidden sm:block transition-all duration-500"
        style={{ width: `${(currentIndex / (ORDER_STATUS_FLOW.length - 1)) * 100}%` }}
      />
      <div className="flex justify-between relative">
        {ORDER_STATUS_FLOW.map((s, i) => {
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={s} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white dark:bg-primary-500'
                    : 'bg-gray-200 dark:bg-dark-bg-secondary text-gray-400'
                } ${isCurrent ? 'ring-4 ring-primary-200 dark:ring-primary-800' : ''}`}
              >
                {isActive ? <CheckSolid className="w-5 h-5" /> : <span className="text-sm font-medium">{i + 1}</span>}
              </div>
              <span
                className={`mt-2 text-xs sm:text-sm font-medium text-center capitalize ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                }`}
              >
                {s}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { from: `/orders/${id}` } });
      return;
    }
    loadOrder();
  }, [id, navigate]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrderById(id);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setOrder(null);
      }
    } catch (err) {
      toast.error('Failed to load order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const response = await orderService.cancelOrder(id, 'Cancelled by customer');
      if (response.success) {
        setShowCancelModal(false);
        toast.success('Order cancelled');
        await loadOrder();
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const copyTrackingNumber = () => {
    const tn = order?.trackingNumber;
    if (!tn) return;
    navigator.clipboard.writeText(tn);
    toast.success('Tracking number copied');
  };

  const getTrackingUrl = (carrier, trackingNumber) => {
    if (!carrier || !trackingNumber) return null;
    const c = carrier.toLowerCase();
    const num = encodeURIComponent(trackingNumber);
    if (c.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${num}`;
    if (c.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${num}`;
    if (c.includes('ups')) return `https://www.ups.com/track?tracknum=${num}`;
    if (c.includes('aramex')) return `https://www.aramex.com/tools/track/?l=${num}`;
    return null;
  };

  const formatPrice = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: order?.currency || 'EUR', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';

  const formatDateTime = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

  const getPaymentMethodLabel = (m) => {
    const map = { card: 'Card', cash_on_delivery: 'Cash on Delivery', bank_transfer: 'Bank Transfer' };
    return map[m] || m;
  };

  const canCancel = order && !['shipped', 'delivered', 'cancelled'].includes(order.status);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container>
          <InlineLoader text="Loading order..." />
        </Container>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container>
          <Card className="text-center py-16">
            <XCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">This order may have been removed or the link is invalid.</p>
            <Link to="/orders">
              <Button variant="primary" leftIcon={<ArrowLeftIcon className="w-5 h-5" />}>Back to Orders</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  const addr = order.shippingAddress || {};
  const trackingUrl = getTrackingUrl(order.shippingCarrier, order.trackingNumber);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container>
        <Link to="/orders" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Order {order.orderNumber}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4" />
                  Placed on {formatDate(order.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-4 py-2 rounded-xl font-medium capitalize ${
                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                order.status === 'shipped' ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' :
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
              }`}>
                {order.status}
              </span>
              <Link to="/customer-service">
                <Button variant="outline" leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}>
                  Contact Support
                </Button>
              </Link>
              {canCancel && (
                <Button variant="outline" onClick={() => setShowCancelModal(true)}>
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Order Tracking Stepper */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TruckIcon className="w-5 h-5 text-primary-600" />
            Order Progress
          </h2>
          <OrderTrackingStepper order={order} />
          {/* Estimated Delivery - show even before tracking */}
          {order.estimatedDelivery && order.status !== 'cancelled' && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Delivery</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(order.estimatedDelivery)}</p>
              </div>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Info - use Order model fields */}
            {(order.trackingNumber || order.shippingCarrier) && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TruckIcon className="w-5 h-5 text-primary-600" />
                  Tracking
                </h2>
                <div className="space-y-3">
                  {order.shippingCarrier && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Carrier</span>
                      <span className="font-medium text-gray-900 dark:text-white">{order.shippingCarrier}</span>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <span className="text-gray-500 dark:text-gray-400">Tracking Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-dark-bg-secondary px-3 py-1 rounded-lg">
                          {order.trackingNumber}
                        </span>
                        <button
                          onClick={copyTrackingNumber}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors"
                          title="Copy"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Estimated Delivery</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDate(order.estimatedDelivery)}</span>
                    </div>
                  )}
                  {trackingUrl && (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      Track shipment online
                    </a>
                  )}
                </div>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CubeIcon className="w-5 h-5 text-primary-600" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items?.map((item) => {
                  const product = item.product || {};
                  const snapshot = item.productSnapshot || {};
                  const name = product.name?.en || snapshot.name?.en || 'Product';
                  const partNumber = product.partNumber || snapshot.partNumber || '';
                  const images = product.images || snapshot.images || [];
                  const imageUrl = images[0]?.url || getProductImageUrl({ images });
                  return (
                    <div key={item._id} className="flex gap-4 pb-4 border-b border-gray-100 dark:border-dark-border last:border-0 last:pb-0">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-dark-bg-secondary rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${product._id || item.product}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600 line-clamp-2">
                          {name}
                        </Link>
                        {partNumber && <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{partNumber}</p>}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-primary-600" />
                  Status History
                </h2>
                <div className="space-y-3">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <CheckCircleIcon className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">{h.status}</span>
                        {h.note && <span className="text-gray-500"> — {h.note}</span>}
                        <p className="text-gray-500 dark:text-gray-400">{formatDateTime(h.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-primary-600" />
                Shipping Address
              </h2>
              <div className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                {addr.name && <p className="font-medium text-gray-900 dark:text-white">{addr.name}</p>}
                {addr.phone && <p>{addr.phone}</p>}
                {addr.street && <p>{addr.street}</p>}
                {(addr.city || addr.district) && <p>{[addr.city, addr.district].filter(Boolean).join(', ')}</p>}
                {(addr.postalCode || addr.country) && <p>{[addr.postalCode, addr.country].filter(Boolean).join(' ')}</p>}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-primary-600" />
                Payment & Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Payment</span>
                  <span className="font-medium text-gray-900 dark:text-white">{getPaymentMethodLabel(order.paymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span className="font-medium capitalize">{order.paymentStatus}</span>
                </div>
                <hr className="border-gray-200 dark:border-dark-border my-3" />
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shipping || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax || 0)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-dark-border mt-4 pt-4 flex justify-between items-baseline">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">{formatPrice(order.total)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>

      <ConfirmModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Yes, Cancel Order"
        variant="danger"
        loading={cancelling}
      />
    </div>
  );
}
