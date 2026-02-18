import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ProductGrid from '../components/products/ProductGrid';
import { InlineLoader } from '../components/common/Spinner';
import wishlistService from '../services/wishlistService';
import { useWishlist } from '../contexts/WishlistContext';
import { HeartIcon } from '@heroicons/react/24/outline';

/**
 * Wishlist Page
 * Displays user's saved products (login required)
 */
export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlistIds, toggleWishlist, fetchWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { from: '/wishlist', message: 'Login to view your wishlist' } });
      return;
    }
    loadWishlist();
  }, [navigate]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const response = await wishlistService.getWishlist();
      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (product) => {
    await toggleWishlist(product);
    await loadWishlist();
  };

  if (!localStorage.getItem('token')) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container>
          <InlineLoader text="Loading wishlist..." />
        </Container>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container size="sm">
          <Card className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-dark-bg-secondary rounded-full mb-6">
              <HeartIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add products you like to your wishlist for quick access later
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Wishlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {products.length} {products.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <ProductGrid
          products={products}
          columns={4}
          onToggleWishlist={handleRemove}
          wishlistIds={wishlistIds}
        />
      </Container>
    </div>
  );
}
