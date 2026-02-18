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
  ChatBubbleLeftRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';

/**
 * Order Detail Page
 * UX-focused: "What's happening now", clear status explanations, simple timeline
 */

// Current status → human sentence + next step
const STATUS_MSG = {
  pending: {
    headline: 'We received your order',
    sub: 'Our team will confirm it shortly. You will get an email when it is confirmed.',
    next: 'What happens next? We will review and confirm your order.'
  },
  confirmed: {
    headline: 'Your order is confirmed',
    sub: 'We are preparing your items for shipment.',
    next: 'What happens next? We will pack your order and add tracking info when it ships.'
  },
  processing: {
    headline: 'We are packing your order',
    sub: 'Your items are being prepared. Tracking will be available once shipped.',
    next: 'What happens next? Your package will be handed to the carrier soon.'
  },
  shipped: {
    headline: 'Your order is on the way',
    sub: 'Track your package below to see real-time updates.',
    next: 'What happens next? The carrier will deliver to your address.'
  },
  delivered: {
    headline: 'Your order has been delivered',
    sub: 'We hope you enjoy your purchase!',
    next: null
  },
  cancelled: {
    headline: 'This order was cancelled',
    sub: 'If you have questions, please contact support.',
    next: null
  }
};

const ORDER_STEPS = [
  { key: 'pending', label: 'Order placed', short: 'Placed' },
  { key: 'confirmed', label: 'Confirmed', short: 'Confirmed' },
  { key: 'processing', label: 'Being prepared', short: 'Preparing' },
  { key: 'shipped', label: 'Shipped', short: 'Shipped' },
  { key: 'delivered', label: 'Delivered', short: 'Delivered' }
];

function OrderProgressStepper({ order }) {
  const status = order?.status || 'pending';
  const isCancelled = status === 'cancelled';
  const currentIdx = ORDER_STEPS.findIndex(s => s.key === status);
  const idx = currentIdx < 0 ? 0 : currentIdx;

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
        <span className="text-red-700 dark:text-red-300 font-medium">This order was cancelled</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-dark-border hidden sm:block" />
      <div
        className="absolute top-5 left-0 h-0.5 bg-primary-500 dark:bg-primary-400 hidden sm:block transition-all duration-500"
        style={{ width: `${(idx / (ORDER_STEPS.length - 1)) * 100}%` }}
      />
      <div className="flex justify-between relative">
        {ORDER_STEPS.map((step, i) => {
          const isActive = i <= idx;
          const isCurrent = i === idx;
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                  isActive ? 'bg-primary-600 text-white dark:bg-primary-500' : 'bg-gray-200 dark:bg-dark-bg-secondary text-gray-400'
                } ${isCurrent ? 'ring-4 ring-primary-200 dark:ring-primary-800' : ''}`}
              >
                {isActive ? <CheckSolid className="w-5 h-5" /> : <span className="text-xs font-medium">{i + 1}</span>}
              </div>
              <span className={`mt-2 text-xs sm:text-sm font-medium text-center ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                {step.short}
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
      if (response.success && response.data) setOrder(response.data);
      else setOrder(null);
    } catch {
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
      } else toast.error(response.message || 'Failed to cancel order');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const copyTracking = () => {
    if (!order?.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingNumber);
    toast.success('Tracking number copied');
  };

  const getTrackingUrl = (carrier, tn) => {
    if (!carrier || !tn) return null;
    const c = carrier.toLowerCase();
    const num = encodeURIComponent(tn);
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

  const getPaymentLabel = (m) => ({ card: 'Card', cash_on_delivery: 'Cash on Delivery', bank_transfer: 'Bank Transfer' }[m] || m);

  const canCancel = order && !['shipped', 'delivered', 'cancelled'].includes(order.status);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container>
          <InlineLoader text="Loading order details..." />
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order not found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">This order may have been removed or the link is invalid.</p>
            <Link to="/orders">
              <Button variant="primary" leftIcon={<ArrowLeftIcon className="w-5 h-5" />}>Back to orders</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  const addr = order.shippingAddress || {};
  const trackingUrl = getTrackingUrl(order.shippingCarrier, order.trackingNumber);
  const msg = STATUS_MSG[order.status] || STATUS_MSG.pending;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container>
        <Link to="/orders" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors text-sm font-medium">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to my orders
        </Link>

        {/* Hero: What's happening now */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-1">Order {order.orderNumber}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {msg.headline}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xl">
                {msg.sub}
              </p>
              {msg.next && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                  <InformationCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-primary-800 dark:text-primary-200">{msg.next}</p>
                </div>
              )}
              <div className="flex items-center gap-3 mt-3 text-gray-500 dark:text-gray-400 text-sm">
                <span>Ordered on {formatDate(order.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link to="/customer-service">
                <Button variant="outline" leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}>
                  Contact support
                </Button>
              </Link>
              {canCancel && (
                <Button variant="outline" onClick={() => setShowCancelModal(true)} className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Cancel order
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Progress stepper */}
        <Card className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <TruckIcon className="w-5 h-5 text-primary-600" />
            Where is my order?
          </h2>
          <OrderProgressStepper order={order} />
          {order.estimatedDelivery && order.status !== 'cancelled' && (
            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-dark-border flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Expected delivery</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(order.estimatedDelivery)}</p>
              </div>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking - when available */}
            {(order.trackingNumber || order.shippingCarrier) && order.status !== 'cancelled' && (
              <Card className="border-2 border-primary-200 dark:border-primary-800 bg-primary-50/30 dark:bg-primary-900/10">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TruckIcon className="w-5 h-5 text-primary-600" />
                  Track your shipment
                </h2>
                <div className="space-y-4">
                  {order.shippingCarrier && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Carrier</p>
                      <p className="font-medium text-gray-900 dark:text-white">{order.shippingCarrier}</p>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tracking number</p>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-2 bg-white dark:bg-dark-bg-secondary rounded-xl font-mono font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-dark-border">
                          {order.trackingNumber}
                        </code>
                        <button onClick={copyTracking} className="p-2 rounded-xl hover:bg-white dark:hover:bg-dark-bg-secondary transition-colors" title="Copy">
                          <ClipboardDocumentIcon className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Estimated delivery</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(order.estimatedDelivery)}</p>
                    </div>
                  )}
                  {trackingUrl && (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      Track on carrier website
                    </a>
                  )}
                </div>
              </Card>
            )}

            {/* Order items */}
            <Card>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CubeIcon className="w-5 h-5 text-primary-600" />
                What you ordered
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
                        <img src={imageUrl} alt={name} className="w-full h-full object-cover" onError={handleImageError} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${product._id || item.product}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600 line-clamp-2">
                          {name}
                        </Link>
                        {partNumber && <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{partNumber}</p>}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quantity: {item.quantity}</p>
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

            {/* Status history - optional timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <Card>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-primary-600" />
                  Activity
                </h2>
                <div className="space-y-3">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <CheckCircleIcon className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">{h.status}</span>
                        {h.note && <span className="text-gray-500"> — {h.note}</span>}
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{formatDateTime(h.date)}</p>
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
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-primary-600" />
                Delivery address
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
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-primary-600" />
                Payment & total
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Payment</span>
                  <span className="font-medium text-gray-900 dark:text-white">{getPaymentLabel(order.paymentMethod)}</span>
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
        title="Cancel order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Yes, cancel order"
        variant="danger"
        loading={cancelling}
      />
    </div>
  );
}
