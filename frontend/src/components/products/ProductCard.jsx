import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  HeartIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { getProductImageUrl, handleImageError } from '../../utils/imageUtils';
import { useCart } from '../../contexts/CartContext';
import productService from '../../services/productService';
import clsx from 'clsx';

/**
 * Product Card Component
 * Displays product information with actions
 */
export default function ProductCard({ 
  product,
  showCompatibility = false,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false
}) {
  const navigate = useNavigate();
  const { addToCart: addToCartContext, cartLoading } = useCart();
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifySubscribed, setNotifySubscribed] = useState(false);
  const {
    _id,
    name,
    partNumber,
    price,
    currency = 'SAR',
    images,
    averageRating,
    totalReviews,
    stock,
    isFeatured,
    compatibilityStatus,
    relevanceScore
  } = product;
  
  const imageUrl = getProductImageUrl(product);
  const isInStock = stock > 0;
  const isLowStock = stock > 0 && stock <= 10;
  
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <Card hover className="group relative overflow-hidden">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1">
        {isFeatured && (
          <Badge variant="warning">Featured</Badge>
        )}
        {relevanceScore && relevanceScore > 80 && (
          <Badge variant="primary">Best Match</Badge>
        )}
        {isLowStock && (
          <Badge variant="warning">Low Stock</Badge>
        )}
      </div>
      
      {/* Compatibility Badge */}
      {showCompatibility && compatibilityStatus && (
        <div className="absolute top-2 right-2 z-10">
          {compatibilityStatus.isCompatible ? (
            <Badge variant="success" dot>
              Compatible
            </Badge>
          ) : (
            <Badge variant="secondary" dot>
              Check Compatibility
            </Badge>
          )}
        </div>
      )}
      
      {/* Wishlist Button - Only for logged-in users */}
      <button
        onClick={() => {
          if (!localStorage.getItem('token')) {
            navigate('/login', { state: { from: '/wishlist', message: 'Login to add to wishlist' } });
            return;
          }
          onToggleWishlist?.(product);
        }}
        className="absolute top-2 right-2 z-10 p-2 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-white dark:hover:bg-dark-bg-secondary transition-all"
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        title={!localStorage.getItem('token') ? "Login to add to wishlist" : (isInWishlist ? "Remove from wishlist" : "Add to wishlist")}
      >
        {isInWishlist ? (
          <HeartSolidIcon className="w-5 h-5 text-error-500" />
        ) : (
          <HeartIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>
      
      {/* Product Image */}
      <Link to={`/products/${_id}`} className="block aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-dark-bg mb-4">
        <img
          src={imageUrl}
          alt={name?.en || 'Product'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={handleImageError}
        />
      </Link>
      
      {/* Product Info */}
      <div className="space-y-2">
        {/* Part Number */}
        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {partNumber}
        </p>
        
        {/* Product Name */}
        <Link 
          to={`/products/${_id}`}
          className="block"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {name?.en}
          </h3>
        </Link>
        
        {/* Rating */}
        {averageRating > 0 && (
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={clsx(
                    "w-4 h-4",
                    i < Math.floor(averageRating)
                      ? "text-warning-500 fill-warning-500"
                      : "text-gray-300 dark:text-gray-600"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {averageRating.toFixed(1)} ({totalReviews})
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPrice(price)}
          </span>
          {currency === 'SAR' && (
            <span className="text-sm text-gray-500">+ VAT</span>
          )}
        </div>
        
        {/* Stock Status */}
        <div className="flex items-center space-x-2">
          {isInStock ? (
            <>
              <CheckCircleIcon className="w-4 h-4 text-success-500" />
              <span className="text-sm text-success-600 dark:text-success-400">
                {isLowStock ? `Only ${stock} left` : 'In Stock'}
              </span>
            </>
          ) : (
            <>
              <XCircleIcon className="w-4 h-4 text-error-500" />
              <span className="text-sm text-error-600 dark:text-error-400">
                Out of Stock
              </span>
            </>
          )}
        </div>
        
        {/* Actions */}
        <div className="pt-2 space-y-2">
          {isInStock ? (
            <Button
              variant="primary"
              fullWidth
              disabled={cartLoading}
              loading={cartLoading}
              onClick={async () => {
                if (onAddToCart) {
                  onAddToCart(product);
                  return;
                }
                await addToCartContext(_id, 1);
              }}
              leftIcon={<ShoppingCartIcon className="w-5 h-5" />}
            >
              Add to Cart
            </Button>
          ) : (
            <Button
              variant="primary"
              fullWidth
              disabled={notifySubscribed}
              loading={notifyLoading}
              onClick={async () => {
                if (!localStorage.getItem('token')) {
                  navigate('/login', { state: { from: `/products/${_id}`, message: 'Login to get notified when this product is back in stock' } });
                  return;
                }
                setNotifyLoading(true);
                try {
                  const res = await productService.subscribeNotifyMe(_id);
                  if (res.success) {
                    setNotifySubscribed(true);
                  }
                } catch (err) {
                  console.error('Notify Me error:', err);
                } finally {
                  setNotifyLoading(false);
                }
              }}
              leftIcon={<BellAlertIcon className="w-5 h-5" />}
            >
              {notifySubscribed ? 'You\'ll be notified' : 'Notify Me'}
            </Button>
          )}
          
          <Link to={`/products/${_id}`} className="block">
            <Button variant="outline" fullWidth>
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
