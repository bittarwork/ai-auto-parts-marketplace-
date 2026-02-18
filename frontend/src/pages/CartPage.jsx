import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { InlineLoader } from '../components/common/Spinner';
import ConfirmModal from '../components/common/ConfirmModal';
import cartService from '../services/cartService';
import { useCart } from '../contexts/CartContext';
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

/**
 * Cart Page
 * Shopping cart with real-time calculations
 */
export default function CartPage() {
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  const [cart, setCart] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, productId: null });
  
  useEffect(() => {
    loadCart();
  }, []);
  
  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await cartService.getCart();
      if (response.success) {
        setCart(response.data.cart);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      const response = await cartService.updateCartItem(productId, newQuantity);
      if (response.success) {
        await loadCart();
        refreshCartCount();
        toast.success('Cart updated successfully');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setUpdating(false);
    }
  };
  
  const removeItem = async (productId) => {
    setConfirmModal({ open: true, type: 'remove', productId });
  };

  const handleConfirmRemove = async () => {
    if (!confirmModal.productId) return;
    setUpdating(true);
    try {
      const response = await cartService.removeFromCart(confirmModal.productId);
      if (response.success) {
        await loadCart();
        refreshCartCount();
        toast.success('Item removed from cart');
        setConfirmModal({ open: false, type: null, productId: null });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };
  
  const clearCart = () => {
    setConfirmModal({ open: true, type: 'clear', productId: null });
  };

  const handleConfirmClear = async () => {
    setUpdating(true);
    try {
      const response = await cartService.clearCart();
      if (response.success) {
        await loadCart();
        refreshCartCount();
        toast.success('Cart cleared successfully');
        setConfirmModal({ open: false, type: null, productId: null });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setUpdating(false);
    }
  };
  
  const proceedToCheckout = () => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { from: '/checkout', message: 'Login required to complete purchase' } });
      return;
    }
    navigate('/checkout');
  };
  
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container>
          <InlineLoader text="Loading cart..." />
        </Container>
      </div>
    );
  }
  
  // Empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container size="sm">
          <Card className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-dark-bg-secondary rounded-full mb-6">
              <ShoppingCartIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add some products to get started
            </p>
            <Link to="/products">
              <Button variant="primary" size="lg">
                Browse Products
              </Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Shopping Cart
          </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {summary.totalItems} {summary.totalItems === 1 ? 'item' : 'items'} in your cart
          {!localStorage.getItem('token') && (
            <span className="block text-sm text-warning-600 dark:text-warning-400 mt-1">
              Login required to complete purchase
            </span>
          )}
        </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item._id} className="relative">
                {updating && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-dark-bg/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <div className="spinner"></div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link 
                    to={`/products/${item.product._id}`}
                    className="flex-shrink-0"
                  >
                    <div className="w-24 h-24 bg-gray-100 dark:bg-dark-bg-secondary rounded-lg overflow-hidden">
                      {item.product.images && item.product.images[0] ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name.en}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs" style={{ display: item.product.images && item.product.images[0] ? 'none' : 'flex' }}>
                        No Image
                      </div>
                    </div>
                  </Link>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/products/${item.product._id}`}
                      className="block"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {item.product.name.en}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Part No: {item.product.partNumber}
                    </p>
                    
                    {/* Price */}
                    <div className="mt-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatPrice(item.unitPrice)}
                      </span>
                      {item.priceAtAdd !== item.product.price && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          {formatPrice(item.priceAtAdd)}
                        </span>
                      )}
                    </div>
                    
                    {/* Stock Warning */}
                    {item.product.stock < item.quantity && (
                      <p className="text-sm text-error-600 dark:text-error-400 mt-2">
                        Only {item.product.stock} available in stock
                      </p>
                    )}
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end space-y-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        disabled={updating || item.quantity <= 1}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MinusIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val > 0) updateQuantity(item.product._id, val);
                        }}
                        className="w-16 text-center border border-gray-300 dark:border-dark-border rounded-md py-1 bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
                        min="1"
                        max={item.product.stock}
                      />
                      
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        disabled={updating || item.quantity >= item.product.stock}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(item.itemTotal)}
                      </p>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.product._id)}
                      disabled={updating}
                      className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300 text-sm font-medium flex items-center space-x-1 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Clear Cart Button */}
            <Button
              variant="ghost"
              onClick={clearCart}
              disabled={updating}
              leftIcon={<TrashIcon className="w-4 h-4" />}
            >
              Clear Cart
            </Button>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({summary.totalItems} items)</span>
                  <span className="font-medium">{formatPrice(summary.subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {summary.subtotal >= 500 ? (
                      <span className="text-success-600">FREE</span>
                    ) : (
                      formatPrice(50)
                    )}
                  </span>
                </div>
                
                {summary.subtotal < 500 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add {formatPrice(500 - summary.subtotal)} more for free shipping
                  </p>
                )}
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (15%)</span>
                  <span className="font-medium">{formatPrice(summary.tax)}</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-dark-border pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {formatPrice(summary.total)}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={proceedToCheckout}
                rightIcon={<ArrowRightIcon className="w-5 h-5" />}
              >
                Proceed to Checkout
              </Button>
              
              <Link to="/products" className="block mt-4">
                <Button variant="outline" fullWidth>
                  Continue Shopping
                </Button>
              </Link>
              
              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Easy Returns</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Warranty Included</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Confirm Modals */}
        <ConfirmModal
          open={confirmModal.open && confirmModal.type === 'remove'}
          onClose={() => setConfirmModal({ open: false, type: null, productId: null })}
          onConfirm={handleConfirmRemove}
          title="Remove Item"
          message="Are you sure you want to remove this item from your cart?"
          confirmLabel="Remove"
          variant="danger"
          loading={updating}
        />
        <ConfirmModal
          open={confirmModal.open && confirmModal.type === 'clear'}
          onClose={() => setConfirmModal({ open: false, type: null, productId: null })}
          onConfirm={handleConfirmClear}
          title="Clear Cart"
          message="Are you sure you want to remove all items from your cart?"
          confirmLabel="Clear Cart"
          variant="danger"
          loading={updating}
        />
      </Container>
    </div>
  );
}
