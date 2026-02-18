import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

/**
 * Order Detail / Confirmation Page
 * Shows order summary after checkout or when viewing past order
 */
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
        await loadOrder();
      }
    } catch (err) {
      console.error('Cancel order error:', err);
    } finally {
      setCancelling(false);
    }
  };

  const formatPrice = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
          <Card className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order Not Found</h2>
            <Link to="/orders">
              <Button variant="primary" leftIcon={<ArrowLeftIcon className="w-5 h-5" />}>Back to Orders</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  const addr = order.shippingAddress || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container>
        <Link to="/orders" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Orders
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Order {order.orderNumber}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full font-medium capitalize ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {order.status}
              </span>
              {canCancel && (
                <Button variant="outline" onClick={() => setShowCancelModal(true)}>
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Info */}
            {order.trackingInfo && (
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <TruckIcon className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tracking Information</h2>
                </div>
                <div className="space-y-2 text-sm">
                  {order.trackingInfo.carrier && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Carrier</span>
                      <span className="font-medium text-gray-900 dark:text-white">{order.trackingInfo.carrier}</span>
                    </div>
                  )}
                  {order.trackingInfo.trackingNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Tracking Number</span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white">{order.trackingInfo.trackingNumber}</span>
                    </div>
                  )}
                  {order.trackingInfo.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Estimated Delivery</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDate(order.trackingInfo.estimatedDelivery)}</span>
                    </div>
                  )}
                  {order.trackingInfo.url && (
                    <div className="mt-3">
                      <a
                        href={order.trackingInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        <ClipboardDocumentListIcon className="w-4 h-4" />
                        Track your shipment
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item) => {
                  const product = item.product || {};
                  const snapshot = item.productSnapshot || {};
                  const name = product.name?.en || snapshot.name?.en || 'Product';
                  const partNumber = product.partNumber || snapshot.partNumber || '';
                  const images = product.images || snapshot.images || [];
                  const imageUrl = images[0]?.url || getProductImageUrl({ images });
                  return (
                    <div key={item._id} className="flex gap-4 pb-4 border-b border-gray-100 dark:border-dark-border last:border-0">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-dark-bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${product._id || item.product}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                          {name}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{partNumber}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
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
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shipping Address</h2>
              <div className="text-gray-600 dark:text-gray-400">
                <p className="font-medium text-gray-900 dark:text-white">{addr.name}</p>
                <p>{addr.phone}</p>
                <p>{addr.street}</p>
                <p>{addr.city}{addr.district ? `, ${addr.district}` : ''}</p>
                <p>{addr.postalCode} {addr.country}</p>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              <div className="space-y-2">
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
              </div>
              <div className="border-t border-gray-200 dark:border-dark-border mt-4 pt-4 flex justify-between items-baseline">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">{formatPrice(order.total)}</span>
              </div>
            </Card>
          </div>
        </div>
      </Container>

      {/* Cancel Order Confirm Modal */}
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
