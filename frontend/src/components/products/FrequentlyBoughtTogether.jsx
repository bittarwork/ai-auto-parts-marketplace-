import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCartIcon,
  PlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import { getProductImageUrl, handleImageError } from '../../utils/imageUtils';
import { useCart } from '../../contexts/CartContext';
import aiSearchService from '../../services/aiSearchService';

/**
 * FrequentlyBoughtTogether Component
 * Shows products commonly purchased alongside the current product.
 * "Add all to cart" bundles them together for quick checkout.
 */
export default function FrequentlyBoughtTogether({ productId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingAll, setAddingAll] = useState(false);
  const [allAdded, setAllAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (productId) loadProducts();
  }, [productId]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await aiSearchService.getFrequentlyBoughtTogether(productId, 4);
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Error loading frequently bought together:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToCart = async () => {
    setAddingAll(true);
    try {
      for (const product of products) {
        if (product.stock > 0) {
          await addToCart(product._id, 1);
        }
      }
      setAllAdded(true);
      setTimeout(() => setAllAdded(false), 3000);
    } catch (err) {
      console.error('Error adding all to cart:', err);
    } finally {
      setAddingAll(false);
    }
  };

  const formatPrice = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-7 w-64 bg-gray-200 dark:bg-dark-bg-tertiary rounded mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-48 flex-shrink-0 bg-gray-100 dark:bg-dark-bg-tertiary rounded-xl h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  const totalPrice = products.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Frequently Bought Together
        </h2>
        <Button
          variant="primary"
          size="sm"
          disabled={addingAll || allAdded}
          loading={addingAll}
          onClick={handleAddAllToCart}
          leftIcon={allAdded ? <CheckCircleIcon className="w-4 h-4" /> : <ShoppingCartIcon className="w-4 h-4" />}
        >
          {allAdded ? 'Added!' : `Add All (${formatPrice(totalPrice)})`}
        </Button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {products.map((product, index) => (
          <div key={product._id} className="flex items-center gap-3 flex-shrink-0">
            {index > 0 && (
              <PlusIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <Link to={`/products/${product._id}`} className="block">
              <Card hover className="w-44 flex-shrink-0 group">
                <div className="aspect-square bg-gray-100 dark:bg-dark-bg rounded-lg overflow-hidden mb-2">
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name?.en || 'Product'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={handleImageError}
                  />
                </div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {product.name?.en}
                </h4>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                  {formatPrice(product.price, product.currency || 'EUR')}
                </p>
                {product.stock <= 0 && (
                  <p className="text-xs text-error-500 mt-0.5">Out of stock</p>
                )}
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
