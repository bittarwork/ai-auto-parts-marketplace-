import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import { InlineLoader } from '../components/common/Spinner';
import cartService from '../services/cartService';
import orderService from '../services/orderService';
import { useCart } from '../contexts/CartContext';
import {
  CheckCircleIcon,
  TruckIcon,
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

/**
 * Checkout Page
 * Complete order checkout with shipping and payment
 */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();
  
  const [cart, setCart] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Saudi Arabia'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { from: '/checkout', message: 'Login required to complete purchase' } });
      return;
    }
    loadCart();
  }, [navigate]);
  
  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await cartService.getCart();
      if (response.success) {
        if (!response.data.cart || response.data.cart.items.length === 0) {
          navigate('/cart');
          return;
        }
        setCart(response.data.cart);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load cart'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateShipping = () => {
    const newErrors = {};
    
    if (!shippingForm.fullName) newErrors.fullName = 'Full name is required';
    if (!shippingForm.phone) newErrors.phone = 'Phone number is required';
    else if (!/^(05|5)\d{8}$/.test(shippingForm.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Invalid Saudi phone number';
    }
    if (!shippingForm.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingForm.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!shippingForm.addressLine1) newErrors.addressLine1 = 'Address is required';
    if (!shippingForm.city) newErrors.city = 'City is required';
    if (!shippingForm.postalCode) newErrors.postalCode = 'Postal code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleContinueToPayment = () => {
    if (validateShipping()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      setAlert({
        type: 'error',
        message: 'Please select a payment method'
      });
      return;
    }
    
    setSubmitting(true);
    setAlert(null);
    
    try {
      // Validate cart first
      const validation = await cartService.validateCart();
      
      if (!validation.success || !validation.data.isValid) {
        setAlert({
          type: 'error',
          message: 'Some items in your cart are no longer available. Please review your cart.'
        });
        setSubmitting(false);
        return;
      }
      
      // Create order
      const orderData = {
        shippingAddress: shippingForm,
        paymentMethod,
        notes
      };
      
      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        refreshCartCount();
        setAlert({
          type: 'success',
          message: 'Order placed successfully!'
        });
        setTimeout(() => navigate(`/orders/${response.data._id}`), 2000);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setAlert({
        type: 'error',
        message: error?.message || error?.error || 'Failed to place order. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container>
          <InlineLoader text="Loading checkout..." />
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
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your order
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Payment' }
            ].map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div className={`flex items-center space-x-2 ${
                  currentStep >= step.num ? 'text-primary-600' : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step.num 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 dark:bg-dark-bg-secondary text-gray-600'
                  }`}>
                    {currentStep > step.num ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      step.num
                    )}
                  </div>
                  <span className="hidden sm:inline font-medium">{step.label}</span>
                </div>
                {index < 1 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > step.num ? 'bg-primary-600' : 'bg-gray-200 dark:bg-dark-bg-secondary'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            dismissible
            onDismiss={() => setAlert(null)}
            className="mb-6"
          />
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <Card>
                <div className="flex items-center space-x-3 mb-6">
                  <TruckIcon className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Shipping Information
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name *"
                      name="fullName"
                      value={shippingForm.fullName}
                      onChange={handleShippingChange}
                      error={errors.fullName}
                      placeholder="John Doe"
                    />
                    
                    <Input
                      label="Phone Number *"
                      name="phone"
                      value={shippingForm.phone}
                      onChange={handleShippingChange}
                      error={errors.phone}
                      placeholder="05XXXXXXXX"
                    />
                  </div>
                  
                  <Input
                    label="Email Address *"
                    name="email"
                    type="email"
                    value={shippingForm.email}
                    onChange={handleShippingChange}
                    error={errors.email}
                    placeholder="your@email.com"
                  />
                  
                  <Input
                    label="Address Line 1 *"
                    name="addressLine1"
                    value={shippingForm.addressLine1}
                    onChange={handleShippingChange}
                    error={errors.addressLine1}
                    placeholder="Street address, P.O. box"
                  />
                  
                  <Input
                    label="Address Line 2"
                    name="addressLine2"
                    value={shippingForm.addressLine2}
                    onChange={handleShippingChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="City *"
                      name="city"
                      value={shippingForm.city}
                      onChange={handleShippingChange}
                      error={errors.city}
                      placeholder="Riyadh"
                    />
                    
                    <Input
                      label="State/Province"
                      name="state"
                      value={shippingForm.state}
                      onChange={handleShippingChange}
                      placeholder="Riyadh Region"
                    />
                    
                    <Input
                      label="Postal Code *"
                      name="postalCode"
                      value={shippingForm.postalCode}
                      onChange={handleShippingChange}
                      error={errors.postalCode}
                      placeholder="12345"
                    />
                  </div>
                  
                  <Input
                    label="Country"
                    name="country"
                    value={shippingForm.country}
                    disabled
                  />
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleContinueToPayment}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </Card>
            )}
            
            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <CreditCardIcon className="w-6 h-6 text-primary-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Payment Method
                    </h2>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'cash_on_delivery', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                      { value: 'credit_card', label: 'Credit Card', desc: 'Pay securely with your credit card' },
                      { value: 'debit_card', label: 'Debit Card', desc: 'Pay with your debit card' },
                      { value: 'bank_transfer', label: 'Bank Transfer', desc: 'Transfer directly to our bank account' }
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === method.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-dark-border hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {method.label}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {method.desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </Card>
                
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Order Notes (Optional)
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions for your order?"
                    rows={4}
                    className="w-full border border-gray-300 dark:border-dark-border rounded-lg px-4 py-3 bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </Card>
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back to Shipping
                  </Button>
                  
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handlePlaceOrder}
                    loading={submitting}
                    leftIcon={<ShieldCheckIcon className="w-5 h-5" />}
                  >
                    Place Order
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images && item.product.images[0] ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name.en}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.product.name.en}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(item.itemTotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-2 py-4 border-t border-gray-200 dark:border-dark-border">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>
                    {summary.subtotal >= 500 ? (
                      <span className="text-success-600">FREE</span>
                    ) : (
                      formatPrice(50)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (15%)</span>
                  <span>{formatPrice(summary.tax)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-dark-border pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {formatPrice(summary.total)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
